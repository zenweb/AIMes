using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using MES.AI.Core.Models;
using MES.AI.Core.Scheduling;
using MES.Application.DTOs;
using MES.Domain.Authorization;
using MES.Domain.Entities;
using MES.Domain.Entities.Agent;
using MES.Domain.Entities.Quality;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Enums;
using MES.Domain.Interfaces.Repositories;
using MES.Domain.Interfaces.Services;

namespace MES.Application.Services;

public class ScheduleAgentService : IScheduleAgentService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly IWorkOrderRepository _workOrderRepository;
    private readonly IEquipmentRepository _equipmentRepository;
    private readonly ISchedulingContextProvider _contextProvider;
    private readonly ISchedulingRuleEngine _ruleEngine;
    private readonly IAgentDecisionRepository _decisionRepository;
    private readonly IAuditLogRepository _auditLogRepository;
    private readonly IScheduleRepository _scheduleRepository;
    private readonly IPurchaseOrderRepository _purchaseOrderRepository;
    private readonly IQualityInspectionRepository _qualityInspectionRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ScheduleAgentService(
        IWorkOrderRepository workOrderRepository,
        IEquipmentRepository equipmentRepository,
        ISchedulingContextProvider contextProvider,
        ISchedulingRuleEngine ruleEngine,
        IAgentDecisionRepository decisionRepository,
        IAuditLogRepository auditLogRepository,
        IScheduleRepository scheduleRepository,
        IPurchaseOrderRepository purchaseOrderRepository,
        IQualityInspectionRepository qualityInspectionRepository,
        IUnitOfWork unitOfWork)
    {
        _workOrderRepository = workOrderRepository;
        _equipmentRepository = equipmentRepository;
        _contextProvider = contextProvider;
        _ruleEngine = ruleEngine;
        _decisionRepository = decisionRepository;
        _auditLogRepository = auditLogRepository;
        _scheduleRepository = scheduleRepository;
        _purchaseOrderRepository = purchaseOrderRepository;
        _qualityInspectionRepository = qualityInspectionRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<AgentDecisionDto> RecommendAsync(AgentRecommendRequest request, string actor, CancellationToken ct = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(request.WorkshopId);

        var workOrders = await LoadWorkOrdersAsync(request, ct);
        if (workOrders.Count == 0)
            throw new InvalidOperationException("没有可用于 Agent 推荐的工单。");

        SchedulingContextSnapshot context;
        try
        {
            context = await _contextProvider.GetContextAsync(request.WorkshopId, ct);
        }
        catch (InvalidOperationException)
        {
            context = new SchedulingContextSnapshot
            {
                WorkshopId = request.WorkshopId,
                SnapshotTime = DateTime.UtcNow,
            };
        }
        if (context.EquipmentCapacities.Count == 0)
        {
            var equipment = await _equipmentRepository.GetAllAsync(ct);
            context.EquipmentCapacities = equipment.Select(e => new EquipmentCapacitySummary(
                e.Id,
                e.EquipmentCode,
                e.EquipmentName,
                e.EquipmentType,
                e.Status.ToString(),
                e.Capacity,
                e.UtilizationRate)
            {
                TheoreticalCapacity = e.Capacity,
                ActualCapacity = e.Capacity,
                ReservedCapacity = e.Capacity * 0.10,
                IsBottleneck = e.EquipmentType is "CNC" or "InjectionMolding" or "Assembly",
                ConstraintType = e.EquipmentType is "CNC" or "InjectionMolding" ? "equipment" : null
            }).ToList();
        }
        var scheduleRequest = new ScheduleRequest
        {
            WorkshopId = request.WorkshopId,
            Orders = workOrders.Select(w => new WorkOrderInfo
            {
                Id = w.Id,
                OrderNumber = w.OrderNumber,
                ProductCode = w.ProductCode,
                Quantity = w.PlannedQuantity,
                DueDate = w.PlannedEndDate,
                Priority = w.Priority,
                RouteCode = w.RouteCode,
            }).ToList(),
            Deadlines = workOrders.ToDictionary(w => w.Id, w => w.PlannedEndDate),
            OptimizationObjective = request.Objective,
            LockedOrderIds = workOrders
                .Where(w => w.Status == WorkOrderStatus.Scheduled)
                .Select(w => w.Id)
                .ToList()
        };

        var payloadJson = JsonSerializer.Serialize(request, JsonOptions);
        var triggerEvent = new AgentTriggerEvent
        {
            EventType = request.EventType,
            SourceModule = request.SourceModule,
            BusinessKeyType = request.BusinessKeyType,
            BusinessKeyValue = string.IsNullOrWhiteSpace(request.BusinessKeyValue)
                ? request.WorkshopId
                : request.BusinessKeyValue,
            Severity = request.Severity,
            PayloadJson = payloadJson,
            OccurredAt = DateTime.UtcNow,
        };
        await _decisionRepository.AddTriggerEventAsync(triggerEvent, ct);

        var scenarioSpecs = new[]
        {
            new ScenarioSpec("FCFS", PriorityRule.FCFS, CapacitySelectionStrategy.LeastLoaded, "先到先服务基线"),
            new ScenarioSpec("EDD", PriorityRule.EDD, CapacitySelectionStrategy.LeastLoaded, "交期最早优先基线"),
            new ScenarioSpec("WeightedComposite", PriorityRule.WeightedComposite, CapacitySelectionStrategy.LeastLoaded, "交期、优先级、加工时长加权基线"),
            new ScenarioSpec("LeastLoaded", PriorityRule.EDD, CapacitySelectionStrategy.LeastLoaded, "最轻负载设备选择基线")
        };

        var scenarios = new List<AgentDecisionScenario>();
        foreach (var spec in scenarioSpecs)
        {
            var result = await _ruleEngine.GenerateInitialScheduleAsync(
                scheduleRequest,
                context,
                spec.PriorityRule,
                spec.CapacityStrategy,
                ct);

            scenarios.Add(new AgentDecisionScenario
            {
                StrategyName = spec.Name,
                PriorityRule = spec.PriorityRule.ToString(),
                CapacityStrategy = spec.CapacityStrategy.ToString(),
                Objective = request.Objective ?? "due_date",
                TasksJson = JsonSerializer.Serialize(result.Assignments, JsonOptions),
                OtdProjection = result.OnTimeDeliveryRate,
                UtilizationProjection = result.UtilizationRate,
                ChangeoverProjection = result.TotalChangeoverMinutes,
                Explanation = $"{spec.Explanation}；OTD={result.OnTimeDeliveryRate:F1}%，利用率={result.UtilizationRate:F1}%，换线={result.TotalChangeoverMinutes:F0}min。",
                SacrificedObjectives = BuildSacrificeSummary(result),
            });
        }

        var recommended = scenarios
            .OrderByDescending(s => s.OtdProjection)
            .ThenByDescending(s => s.UtilizationProjection)
            .ThenBy(s => s.ChangeoverProjection)
            .First();

        var contextSummary = $"Workshop={request.WorkshopId};Orders={workOrders.Count};Equipment={context.EquipmentCapacities.Count};Materials={context.MaterialAvailabilities.Count}";
        var decision = new AgentDecision
        {
            TriggerEventId = triggerEvent.Id,
            BoundedContext = "Scheduling",
            DecisionType = "MultiScenario",
            Status = "PendingReview",
            ScenarioCount = scenarios.Count,
            RecommendedScenarioId = recommended.Id,
            AgentName = "SchedulingAgent",
            AgentVersion = "v1.5-rule-engine-baseline",
            PromptHash = ComputeSha256(payloadJson),
            ContextHash = ComputeSha256(contextSummary),
            InputSummary = contextSummary,
            OutputSummary = $"Scenarios={scenarios.Count};Recommended={recommended.StrategyName};OTD={recommended.OtdProjection:F1}",
            BusinessKey = $"{triggerEvent.BusinessKeyType}:{triggerEvent.BusinessKeyValue}",
            Scenarios = scenarios,
        };
        decision.TraceId = $"trace-agent-{decision.Id}";

        foreach (var scenario in scenarios)
            scenario.AgentDecisionId = decision.Id;

        await _decisionRepository.AddDecisionAsync(decision, ct);
        await _decisionRepository.AddEvidenceLinkAsync(new AgentEvidenceLink
        {
            AgentDecisionId = decision.Id,
            EvidenceType = "ScheduleRequest",
            EvidenceKey = decision.BusinessKey,
            EvidenceSummary = decision.InputSummary,
            CreatedAt = decision.CreatedAt,
        }, ct);

        await _decisionRepository.AddTraceAsync(new AiDecisionTraceEntity
        {
            TraceId = decision.TraceId,
            AgentName = decision.AgentName,
            AgentVersion = decision.AgentVersion,
            ModelProvider = "MES.AI",
            ModelName = "SchedulingRuleEngine",
            ModelVersion = "v1.5",
            PromptHash = decision.PromptHash,
            ContextHash = decision.ContextHash,
            InputSummary = decision.InputSummary,
            OutputSummary = decision.OutputSummary,
            Confidence = 0.80m,
            LatencyMs = 0,
            SourceReferences = "SchedulingRuleEngine;ScheduleRequest",
            RelatedBusinessKeys = decision.BusinessKey,
            BusinessKeyType = triggerEvent.BusinessKeyType,
            BusinessKeyValue = triggerEvent.BusinessKeyValue,
            LinkedAgentDecisionId = decision.Id,
        }, ct);

        await WriteAuditAsync(actor, "AgentRecommend", "scheduling-agent", decision.Id, decision.BusinessKey,
            decision.TraceId, decision.PromptHash, decision.ContextHash,
            JsonSerializer.Serialize(MapDecision(decision), JsonOptions), ct);

        return MapDecision(decision);
    }

    public async Task<AgentDecisionDto?> GetDecisionAsync(string decisionId, CancellationToken ct = default)
    {
        var decision = await _decisionRepository.GetByIdAsync(decisionId, ct);
        return decision is null ? null : MapDecision(decision);
    }

    public async Task<List<AgentDecisionDto>> QueryRecentAsync(int take, CancellationToken ct = default)
    {
        var decisions = await _decisionRepository.QueryRecentAsync("Scheduling", take, ct);
        return decisions.Select(MapDecision).ToList();
    }

    public async Task<AgentDecisionDto> AdoptAsync(string decisionId, string scenarioId, string? reason, string actor, string role, CancellationToken ct = default)
    {
        var decision = await _decisionRepository.GetByIdAsync(decisionId, ct)
            ?? throw new InvalidOperationException($"Agent decision {decisionId} not found.");
        if (!decision.Scenarios.Any(s => s.Id == scenarioId))
            throw new InvalidOperationException($"Scenario {scenarioId} not found.");

        await _decisionRepository.RecordAdoptionAsync(decisionId, scenarioId, reason, ct);
        await RecordAgentActionAsync(
            decision,
            AgentActionType.AdoptScheduling,
            "Succeeded",
            actor,
            role,
            reason,
            "AgentAdopt",
            JsonSerializer.Serialize(new { scenarioId, reason }, JsonOptions),
            ct);

        var adoptedScenario = decision.Scenarios.First(s => s.Id == scenarioId);
        var feedback = new ScheduleAdoptionFeedback
        {
            SchedulePlanId = decisionId,
            WorkshopId = ExtractWorkshopId(decision),
            OptimizationObjective = adoptedScenario.Objective ?? "due_date",
            OriginalAssignmentsJson = adoptedScenario.TasksJson,
            ModifiedAssignmentsJson = adoptedScenario.TasksJson,
            ReasonCategory = OverrideReasonCategory.Other,
            ReasonDetail = reason,
            OperatorUser = actor,
            AiTraceId = decision.TraceId,
            InitiatedByAgent = true,
            AgentDecisionId = decisionId,
            AgentVersion = decision.AgentVersion,
        };
        await _scheduleRepository.SaveFeedbackAsync(feedback, ct);
        await WriteScheduleAdoptionFeedbackEvidenceAsync(feedback, actor, decision, ct);

        return MapDecision(await _decisionRepository.GetByIdAsync(decisionId, ct)
            ?? throw new InvalidOperationException($"Agent decision {decisionId} not found."));
    }

    public async Task<AgentDecisionDto> RejectAsync(string decisionId, string? reason, string actor, string role, CancellationToken ct = default)
    {
        var decision = await _decisionRepository.GetByIdAsync(decisionId, ct)
            ?? throw new InvalidOperationException($"Agent decision {decisionId} not found.");

        await _decisionRepository.RecordRejectionAsync(decisionId, reason, ct);
        await RecordAgentActionAsync(
            decision,
            AgentActionType.RejectScheduling,
            "Succeeded",
            actor,
            role,
            reason,
            "AgentReject",
            JsonSerializer.Serialize(new { reason }, JsonOptions),
            ct);

        return MapDecision(await _decisionRepository.GetByIdAsync(decisionId, ct)
            ?? throw new InvalidOperationException($"Agent decision {decisionId} not found."));
    }

    public async Task<AgentDecisionDto> ExecuteCrossDomainActionAsync(
        string decisionId,
        AgentActionType action,
        AgentExecuteActionRequest request,
        string actor,
        string role,
        CancellationToken ct = default)
    {
        var decision = await _decisionRepository.GetByIdAsync(decisionId, ct)
            ?? throw new InvalidOperationException($"Agent decision {decisionId} not found.");

        var actionName = AgentPermissionPolicy.GetActionName(action);
        var businessWrite = await ExecuteBusinessWriteAsync(action, request, ct);
        var actionPayload = JsonSerializer.Serialize(new
        {
            actionName,
            requestActionName = request.ActionName,
            reason = request.Reason,
            payload = request.Payload,
            businessWrite,
        }, JsonOptions);

        await RecordAgentActionAsync(
            decision,
            action,
            "Succeeded",
            actor,
            role,
            request.Reason,
            "Agent" + actionName,
            actionPayload,
            ct);

        return MapDecision(await _decisionRepository.GetByIdAsync(decisionId, ct)
            ?? throw new InvalidOperationException($"Agent decision {decisionId} not found."));
    }

    private async Task<object?> ExecuteBusinessWriteAsync(
        AgentActionType action,
        AgentExecuteActionRequest request,
        CancellationToken ct)
    {
        return action switch
        {
            AgentActionType.ExecuteQualityDisposition => await ExecuteQualityDispositionWriteAsync(request, ct),
            AgentActionType.ExecutePurchaseAction => await ExecutePurchaseWriteAsync(request, ct),
            AgentActionType.ExecuteMaintenanceAction => await ExecuteMaintenanceWriteAsync(request, ct),
            _ => null,
        };
    }

    private async Task<object?> ExecuteQualityDispositionWriteAsync(AgentExecuteActionRequest request, CancellationToken ct)
    {
        if (request.Payload is null)
            return null;

        var inspectionId = GetPayloadString(request.Payload, "inspectionId");
        if (string.IsNullOrWhiteSpace(inspectionId))
            return null;

        var inspection = await _qualityInspectionRepository.GetForUpdateAsync(inspectionId, ct)
            ?? throw new InvalidOperationException($"质检记录 {inspectionId} 不存在。");

        var defectType = GetPayloadString(request.Payload, "defectType") ?? "AgentDisposition";
        var severity = GetPayloadString(request.Payload, "severity") ?? "Medium";
        var quantity = GetPayloadInt(request.Payload, "quantity") ?? Math.Max(1, inspection.DefectQuantity);
        var correctiveAction = GetPayloadString(request.Payload, "correctiveAction") ?? request.Reason;

        inspection.RecordDefect(defectType, quantity, 0, severity, correctiveAction);
        await _qualityInspectionRepository.UpdateAsync(inspection, ct);

        return new
        {
            resource = "quality-inspection",
            inspectionId = inspection.Id,
            result = inspection.Result.ToString(),
            defectType,
            quantity,
            severity,
        };
    }

    private async Task<object?> ExecutePurchaseWriteAsync(AgentExecuteActionRequest request, CancellationToken ct)
    {
        if (request.Payload is null)
            return null;

        return await _unitOfWork.ExecuteAsync<object?>(async innerCt =>
        {
            var purchaseOrderId = GetPayloadString(request.Payload, "purchaseOrderId");
            if (string.IsNullOrWhiteSpace(purchaseOrderId))
                return null;

            var order = await _purchaseOrderRepository.GetByIdAsync(purchaseOrderId, innerCt)
                ?? throw new InvalidOperationException($"采购单 {purchaseOrderId} 不存在。");

            var materialCode = GetPayloadString(request.Payload, "materialCode");
            var quantity = GetPayloadDecimal(request.Payload, "quantity");
            if (string.IsNullOrWhiteSpace(materialCode) || quantity is null)
                throw new InvalidOperationException("采购执行需要 materialCode 和 quantity。");

            order.Receive(materialCode, quantity.Value);
            await _purchaseOrderRepository.UpdateAsync(order, innerCt);

            return new
            {
                resource = "purchase-order",
                purchaseOrderId = order.Id,
                orderNumber = order.OrderNumber,
                materialCode,
                receivedQuantity = quantity.Value,
                status = order.Status.ToString(),
            };
        }, ct);
    }

    private async Task<object?> ExecuteMaintenanceWriteAsync(AgentExecuteActionRequest request, CancellationToken ct)
    {
        if (request.Payload is null)
            return null;

        var equipmentId = GetPayloadString(request.Payload, "equipmentId");
        if (string.IsNullOrWhiteSpace(equipmentId))
            return null;

        var equipment = await _equipmentRepository.GetByIdAsync(equipmentId, ct)
            ?? throw new InvalidOperationException($"设备 {equipmentId} 不存在。");

        var targetStatus = GetPayloadString(request.Payload, "targetStatus") ?? "Maintenance";
        if (!Enum.TryParse<EquipmentStatus>(targetStatus, ignoreCase: true, out var status))
            throw new InvalidOperationException($"不支持的设备状态 {targetStatus}。");

        equipment.TransitionTo(status);
        await _equipmentRepository.UpdateAsync(equipment, ct);

        return new
        {
            resource = "equipment",
            equipmentId = equipment.Id,
            equipmentCode = equipment.EquipmentCode,
            targetStatus = equipment.Status.ToString(),
        };
    }

    public async Task RecordPolicyRejectionAsync(
        AgentActionType action,
        string decisionId,
        string actor,
        string role,
        string? reason,
        CancellationToken ct = default)
    {
        var decision = await _decisionRepository.GetByIdAsync(decisionId, ct);
        var actionName = AgentPermissionPolicy.GetActionName(action);
        var rejectionReason = reason ?? AgentPermissionPolicy.GetDenialReason(action);
        await RecordAgentActionAsync(
            decision,
            action,
            "RejectedByPolicy",
            actor,
            role,
            rejectionReason,
            "AgentPolicyRejected",
            JsonSerializer.Serialize(new { action = actionName, role, reason = rejectionReason }, JsonOptions),
            ct,
            decisionId);
    }

    public async Task<List<OtdEvidenceChainItemDto>> QueryOtdEvidenceAsync(int take, CancellationToken ct = default)
    {
        var links = await _decisionRepository.QueryEvidenceLinksAsync("OtdEvidenceChain", take <= 0 ? 24 : take, ct);
        return WhereNotNull(links.Select(MapOtdEvidence))
            .ToList();
    }

    public async Task<OtdEvidenceChainItemDto> UpsertOtdEvidenceAsync(OtdEvidenceChainItemDto item, string actor, CancellationToken ct = default)
    {
        var summaryJson = JsonSerializer.Serialize(item, JsonOptions);
        await _decisionRepository.UpsertEvidenceLinkAsync(new AgentEvidenceLink
        {
            AgentDecisionId = string.IsNullOrWhiteSpace(item.SourceTraceId) ? "otd-evidence-chain" : item.SourceTraceId,
            EvidenceType = "OtdEvidenceChain",
            EvidenceKey = item.Id,
            EvidenceSummary = summaryJson,
            CreatedAt = item.CreatedAt,
        }, ct);

        await WriteAuditAsync(actor, "OtdEvidenceUpsert", "otd-evidence-chain", item.Id, item.Object,
            item.TraceId, null, null, summaryJson, ct);

        return item;
    }

    public async Task<EquipmentDowntimeEventDto?> GetLatestEquipmentDowntimeAsync(CancellationToken ct = default)
    {
        var links = await _decisionRepository.QueryEvidenceLinksAsync("EquipmentDowntimeEvent", 1, ct);
        return links.Select(MapEquipmentDowntime).FirstOrDefault(item => item is not null);
    }

    public async Task<EquipmentDowntimeEventDto> UpsertEquipmentDowntimeAsync(
        EquipmentDowntimeEventDto item,
        string actor,
        CancellationToken ct = default)
    {
        var summaryJson = JsonSerializer.Serialize(item, JsonOptions);
        var evidenceKey = string.IsNullOrWhiteSpace(item.EquipmentCode) ? "equipment-downtime" : item.EquipmentCode;
        await _decisionRepository.UpsertEvidenceLinkAsync(new AgentEvidenceLink
        {
            AgentDecisionId = $"equipment-downtime-{evidenceKey}",
            EvidenceType = "EquipmentDowntimeEvent",
            EvidenceKey = evidenceKey,
            EvidenceSummary = summaryJson,
            CreatedAt = item.CreatedAt,
        }, ct);

        await WriteAuditAsync(actor, "EquipmentDowntimeUpsert", "equipment-downtime", evidenceKey, item.AffectedOrders,
            $"TRACE-EQ-DOWNTIME-{evidenceKey}", null, null, summaryJson, ct);

        return item;
    }

    public async Task<CustomerEquipmentFaultEvidenceDto?> GetLatestCustomerEquipmentFaultAsync(CancellationToken ct = default)
    {
        var links = await _decisionRepository.QueryEvidenceLinksAsync("CustomerEquipmentFaultEvidence", 1, ct);
        return links.Select(MapCustomerEquipmentFault).FirstOrDefault(item => item is not null);
    }

    public async Task<CustomerEquipmentFaultEvidenceDto> UpsertCustomerEquipmentFaultAsync(
        CustomerEquipmentFaultEvidenceDto item,
        string actor,
        CancellationToken ct = default)
    {
        var summaryJson = JsonSerializer.Serialize(item, JsonOptions);
        await _decisionRepository.UpsertEvidenceLinkAsync(new AgentEvidenceLink
        {
            AgentDecisionId = $"customer-equipment-fault-{item.BatchId}",
            EvidenceType = "CustomerEquipmentFaultEvidence",
            EvidenceKey = item.BatchId,
            EvidenceSummary = summaryJson,
            CreatedAt = item.PreparedAt,
        }, ct);

        await WriteAuditAsync(actor, "CustomerEquipmentFaultUpsert", "customer-equipment-fault", item.BatchId,
            $"{item.EquipmentCode}:{item.AffectedOrders}", item.BatchId, null, null, summaryJson, ct);

        return item;
    }

    public async Task<ShortageKittingEventDto?> GetLatestShortageKittingAsync(CancellationToken ct = default)
    {
        var links = await _decisionRepository.QueryEvidenceLinksAsync("ShortageKittingEvent", 1, ct);
        return links.Select(MapShortageKitting).FirstOrDefault(item => item is not null);
    }

    public async Task<ShortageKittingEventDto> UpsertShortageKittingAsync(
        ShortageKittingEventDto item,
        string actor,
        CancellationToken ct = default)
    {
        var summaryJson = JsonSerializer.Serialize(item, JsonOptions);
        var evidenceKey = $"{item.WorkOrderNumber}:{item.MaterialCode}";
        await _decisionRepository.UpsertEvidenceLinkAsync(new AgentEvidenceLink
        {
            AgentDecisionId = $"shortage-kitting-{item.WorkOrderNumber}-{item.MaterialCode}",
            EvidenceType = "ShortageKittingEvent",
            EvidenceKey = evidenceKey,
            EvidenceSummary = summaryJson,
            CreatedAt = item.CreatedAt,
        }, ct);

        await WriteAuditAsync(actor, "ShortageKittingUpsert", "shortage-kitting", evidenceKey, item.AffectedOrders,
            $"TRACE-KIT-{item.WorkOrderNumber}-{item.MaterialCode}", null, null, summaryJson, ct);

        return item;
    }

    public async Task<ShortageRiskResolutionDto?> GetLatestShortageRiskResolutionAsync(CancellationToken ct = default)
    {
        var links = await _decisionRepository.QueryEvidenceLinksAsync("ShortageRiskResolution", 1, ct);
        return links.Select(MapShortageRiskResolution).FirstOrDefault(item => item is not null);
    }

    public async Task<ShortageRiskResolutionDto> UpsertShortageRiskResolutionAsync(
        ShortageRiskResolutionDto item,
        string actor,
        CancellationToken ct = default)
    {
        var summaryJson = JsonSerializer.Serialize(item, JsonOptions);
        var evidenceKey = $"{item.SourceOrderNumber}:{item.MaterialCode}";
        await _decisionRepository.UpsertEvidenceLinkAsync(new AgentEvidenceLink
        {
            AgentDecisionId = $"shortage-resolution-{item.SourceOrderNumber}-{item.MaterialCode}",
            EvidenceType = "ShortageRiskResolution",
            EvidenceKey = evidenceKey,
            EvidenceSummary = summaryJson,
            CreatedAt = item.ResolvedAt,
        }, ct);

        await WriteAuditAsync(actor, "ShortageRiskResolutionUpsert", "shortage-risk-resolution", evidenceKey, item.AffectedOrders,
            $"TRACE-SHORTAGE-RESOLUTION-{item.SourceOrderNumber}-{item.MaterialCode}", null, null, summaryJson, ct);

        return item;
    }

    public async Task<BomKittingPackageDto?> GetLatestBomKittingPackageAsync(CancellationToken ct = default)
    {
        var links = await _decisionRepository.QueryEvidenceLinksAsync("BomKittingPackage", 1, ct);
        return links.Select(MapBomKittingPackage).FirstOrDefault(item => item is not null);
    }

    public async Task<BomKittingPackageDto> UpsertBomKittingPackageAsync(
        BomKittingPackageDto item,
        string actor,
        CancellationToken ct = default)
    {
        var summaryJson = JsonSerializer.Serialize(item, JsonOptions);
        var evidenceKey = string.IsNullOrWhiteSpace(item.Id) ? $"{item.BomCode}:{item.WorkOrderNumber}" : item.Id;
        await _decisionRepository.UpsertEvidenceLinkAsync(new AgentEvidenceLink
        {
            AgentDecisionId = $"bom-kitting-package-{evidenceKey}",
            EvidenceType = "BomKittingPackage",
            EvidenceKey = evidenceKey,
            EvidenceSummary = summaryJson,
            CreatedAt = item.CreatedAt,
        }, ct);

        await WriteAuditAsync(actor, "BomKittingPackageUpsert", "bom-kitting-package", evidenceKey, item.WorkOrderNumber,
            item.TraceId, null, null, summaryJson, ct);

        return item;
    }

    public async Task<SupplyRiskEscalationDto?> GetLatestSupplyRiskEscalationAsync(CancellationToken ct = default)
    {
        var links = await _decisionRepository.QueryEvidenceLinksAsync("SupplyRiskEscalation", 1, ct);
        return links.Select(MapSupplyRiskEscalation).FirstOrDefault(item => item is not null);
    }

    public async Task<SupplyRiskEscalationDto> UpsertSupplyRiskEscalationAsync(
        SupplyRiskEscalationDto item,
        string actor,
        CancellationToken ct = default)
    {
        var summaryJson = JsonSerializer.Serialize(item, JsonOptions);
        var evidenceKey = $"{item.PurchaseOrderNumber}:{item.MaterialCode}";
        await _decisionRepository.UpsertEvidenceLinkAsync(new AgentEvidenceLink
        {
            AgentDecisionId = $"supply-risk-{item.PurchaseOrderNumber}-{item.MaterialCode}",
            EvidenceType = "SupplyRiskEscalation",
            EvidenceKey = evidenceKey,
            EvidenceSummary = summaryJson,
            CreatedAt = item.CreatedAt,
        }, ct);

        await WriteAuditAsync(actor, "SupplyRiskEscalationUpsert", "supply-risk-escalation", evidenceKey,
            item.AffectedOrders, item.ReceiptTraceId ?? item.TraceId, null, null, summaryJson, ct);

        return item;
    }

    public async Task<SupplierNetworkDecisionDto?> GetLatestSupplierNetworkDecisionAsync(CancellationToken ct = default)
    {
        var links = await _decisionRepository.QueryEvidenceLinksAsync("SupplierNetworkDecision", 1, ct);
        return links.Select(MapSupplierNetworkDecision).FirstOrDefault(item => item is not null);
    }

    public async Task<SupplierNetworkDecisionDto> UpsertSupplierNetworkDecisionAsync(
        SupplierNetworkDecisionDto item,
        string actor,
        CancellationToken ct = default)
    {
        var summaryJson = JsonSerializer.Serialize(item, JsonOptions);
        var evidenceKey = $"{item.MaterialCode}:{item.SelectedSupplierName}";
        await _decisionRepository.UpsertEvidenceLinkAsync(new AgentEvidenceLink
        {
            AgentDecisionId = $"supplier-network-{item.MaterialCode}-{item.SelectedSupplierName}",
            EvidenceType = "SupplierNetworkDecision",
            EvidenceKey = evidenceKey,
            EvidenceSummary = summaryJson,
            CreatedAt = item.CreatedAt,
        }, ct);

        await WriteAuditAsync(actor, "SupplierNetworkDecisionUpsert", "supplier-network-decision", evidenceKey,
            item.AffectedOrders, item.TraceId, null, null, summaryJson, ct);

        return item;
    }

    public async Task<List<OutsourcingCommitmentPackageDto>> QueryOutsourcingCommitmentsAsync(int take, CancellationToken ct = default)
    {
        var links = await _decisionRepository.QueryEvidenceLinksAsync("OutsourcingCommitmentPackage", take <= 0 ? 8 : take, ct);
        return WhereNotNull(links.Select(MapOutsourcingCommitment))
            .ToList();
    }

    public async Task<OutsourcingCommitmentPackageDto?> GetLatestOutsourcingCommitmentAsync(CancellationToken ct = default)
    {
        var links = await _decisionRepository.QueryEvidenceLinksAsync("OutsourcingCommitmentPackage", 1, ct);
        return links.Select(MapOutsourcingCommitment).FirstOrDefault(item => item is not null);
    }

    public async Task<OutsourcingCommitmentPackageDto> UpsertOutsourcingCommitmentAsync(
        OutsourcingCommitmentPackageDto item,
        string actor,
        CancellationToken ct = default)
    {
        var summaryJson = JsonSerializer.Serialize(item, JsonOptions);
        var evidenceKey = string.IsNullOrWhiteSpace(item.Id) ? item.SourceKpiId : item.Id;
        await _decisionRepository.UpsertEvidenceLinkAsync(new AgentEvidenceLink
        {
            AgentDecisionId = $"outsourcing-commitment-{evidenceKey}",
            EvidenceType = "OutsourcingCommitmentPackage",
            EvidenceKey = evidenceKey,
            EvidenceSummary = summaryJson,
            CreatedAt = item.CreatedAt,
        }, ct);

        await WriteAuditAsync(actor, "OutsourcingCommitmentUpsert", "outsourcing-commitment-package", evidenceKey,
            item.AffectedOrders, item.ScheduleReleaseTraceId ?? item.ReceiptTraceId ?? item.TraceId, null, null, summaryJson, ct);

        return item;
    }

    public async Task<QualityReworkImpactDto?> GetLatestQualityReworkImpactAsync(CancellationToken ct = default)
    {
        var links = await _decisionRepository.QueryEvidenceLinksAsync("QualityReworkImpact", 1, ct);
        return links.Select(MapQualityReworkImpact).FirstOrDefault(item => item is not null);
    }

    public async Task<QualityReworkImpactDto> UpsertQualityReworkImpactAsync(
        QualityReworkImpactDto item,
        string actor,
        CancellationToken ct = default)
    {
        var summaryJson = JsonSerializer.Serialize(item, JsonOptions);
        await _decisionRepository.UpsertEvidenceLinkAsync(new AgentEvidenceLink
        {
            AgentDecisionId = $"quality-rework-{item.InspectionId}",
            EvidenceType = "QualityReworkImpact",
            EvidenceKey = item.InspectionId,
            EvidenceSummary = summaryJson,
            CreatedAt = item.CreatedAt,
        }, ct);

        await WriteAuditAsync(actor, "QualityReworkImpactUpsert", "quality-rework-impact", item.InspectionId,
            item.WorkOrderId, item.BatchCode, null, null, summaryJson, ct);

        return item;
    }

    public async Task<QualityMrbDispositionRecordDto?> GetLatestQualityMrbDispositionAsync(CancellationToken ct = default)
    {
        var links = await _decisionRepository.QueryEvidenceLinksAsync("QualityMrbDisposition", 1, ct);
        return links.Select(MapQualityMrbDisposition).FirstOrDefault(item => item is not null);
    }

    public async Task<QualityMrbDispositionRecordDto> UpsertQualityMrbDispositionAsync(
        QualityMrbDispositionRecordDto item,
        string actor,
        CancellationToken ct = default)
    {
        var summaryJson = JsonSerializer.Serialize(item, JsonOptions);
        var traceId = item.ClosureTraceId ?? item.ScheduleTraceId;
        await _decisionRepository.UpsertEvidenceLinkAsync(new AgentEvidenceLink
        {
            AgentDecisionId = $"quality-mrb-{item.Id}",
            EvidenceType = "QualityMrbDisposition",
            EvidenceKey = item.Id,
            EvidenceSummary = summaryJson,
            CreatedAt = item.ClosedAt ?? item.CreatedAt,
        }, ct);

        await WriteAuditAsync(actor, "QualityMrbDispositionUpsert", "quality-mrb-disposition", item.Id,
            $"{item.WorkOrderId}:{item.InspectionId}", traceId, null, null, summaryJson, ct);

        return item;
    }

    public async Task<AlternateMaterialApprovalDto?> GetLatestAlternateMaterialApprovalAsync(CancellationToken ct = default)
    {
        var links = await _decisionRepository.QueryEvidenceLinksAsync("AlternateMaterialApproval", 1, ct);
        return links.Select(MapAlternateMaterialApproval).FirstOrDefault(item => item is not null);
    }

    public async Task<AlternateMaterialApprovalDto> UpsertAlternateMaterialApprovalAsync(
        AlternateMaterialApprovalDto item,
        string actor,
        CancellationToken ct = default)
    {
        var summaryJson = JsonSerializer.Serialize(item, JsonOptions);
        await _decisionRepository.UpsertEvidenceLinkAsync(new AgentEvidenceLink
        {
            AgentDecisionId = $"alternate-material-{item.Id}",
            EvidenceType = "AlternateMaterialApproval",
            EvidenceKey = item.Id,
            EvidenceSummary = summaryJson,
            CreatedAt = item.ApprovedAt,
        }, ct);

        await WriteAuditAsync(actor, "AlternateMaterialApprovalUpsert", "alternate-material-approval", item.Id,
            item.AffectedOrders, item.TraceId, null, null, summaryJson, ct);

        return item;
    }

    public async Task<EngineeringChangeImpactAnalysisDto?> GetLatestEngineeringChangeImpactAsync(CancellationToken ct = default)
    {
        var links = await _decisionRepository.QueryEvidenceLinksAsync("EngineeringChangeImpact", 1, ct);
        return links.Select(MapEngineeringChangeImpact).FirstOrDefault(item => item is not null);
    }

    public async Task<EngineeringChangeImpactAnalysisDto> UpsertEngineeringChangeImpactAsync(
        EngineeringChangeImpactAnalysisDto item,
        string actor,
        CancellationToken ct = default)
    {
        var summaryJson = JsonSerializer.Serialize(item, JsonOptions);
        await _decisionRepository.UpsertEvidenceLinkAsync(new AgentEvidenceLink
        {
            AgentDecisionId = $"engineering-change-{item.Id}",
            EvidenceType = "EngineeringChangeImpact",
            EvidenceKey = item.Id,
            EvidenceSummary = summaryJson,
            CreatedAt = item.DecidedAt ?? item.AnalyzedAt,
        }, ct);

        await WriteAuditAsync(actor, "EngineeringChangeImpactUpsert", "engineering-change-impact", item.Id,
            item.AffectedOrders, item.TraceId, null, null, summaryJson, ct);

        return item;
    }

    public async Task<RouteCapabilityValidationDto?> GetLatestRouteCapabilityValidationAsync(CancellationToken ct = default)
    {
        var links = await _decisionRepository.QueryEvidenceLinksAsync("RouteCapabilityValidation", 1, ct);
        return links.Select(MapRouteCapabilityValidation).FirstOrDefault(item => item is not null);
    }

    public async Task<RouteCapabilityValidationDto> UpsertRouteCapabilityValidationAsync(
        RouteCapabilityValidationDto item,
        string actor,
        CancellationToken ct = default)
    {
        var summaryJson = JsonSerializer.Serialize(item, JsonOptions);
        await _decisionRepository.UpsertEvidenceLinkAsync(new AgentEvidenceLink
        {
            AgentDecisionId = $"route-capability-{item.Id}",
            EvidenceType = "RouteCapabilityValidation",
            EvidenceKey = item.Id,
            EvidenceSummary = summaryJson,
            CreatedAt = item.ApprovedAt ?? item.ValidatedAt,
        }, ct);

        await WriteAuditAsync(actor, "RouteCapabilityValidationUpsert", "route-capability-validation", item.Id,
            item.AffectedOrders, item.TraceId, null, null, summaryJson, ct);

        return item;
    }

    public async Task<ProductionAnomalyEventDto?> GetLatestProductionAnomalyEventAsync(CancellationToken ct = default)
    {
        var links = await _decisionRepository.QueryEvidenceLinksAsync("ProductionAnomalyEvent", 1, ct);
        return links.Select(MapProductionAnomalyEvent).FirstOrDefault(item => item is not null);
    }

    public async Task<ProductionAnomalyEventDto> UpsertProductionAnomalyEventAsync(
        ProductionAnomalyEventDto item,
        string actor,
        CancellationToken ct = default)
    {
        var summaryJson = JsonSerializer.Serialize(item, JsonOptions);
        await _decisionRepository.UpsertEvidenceLinkAsync(new AgentEvidenceLink
        {
            AgentDecisionId = $"production-anomaly-{item.Id}",
            EvidenceType = "ProductionAnomalyEvent",
            EvidenceKey = item.Id,
            EvidenceSummary = summaryJson,
            CreatedAt = ParseEventTimestamp(item.DetectedAt),
        }, ct);

        await WriteAuditAsync(actor, "ProductionAnomalyEventUpsert", "production-anomaly-event", item.Id,
            item.WorkOrderNumber, item.Id, null, null, summaryJson, ct);

        return item;
    }

    public async Task<List<AnomalyDispatchRecordDto>> QueryAnomalyDispatchRecordsAsync(int take, CancellationToken ct = default)
    {
        var links = await _decisionRepository.QueryEvidenceLinksAsync("AnomalyDispatchRecord", take <= 0 ? 12 : take, ct);
        return WhereNotNull(links.Select(MapAnomalyDispatchRecord)).ToList();
    }

    public async Task<AnomalyDispatchRecordDto> UpsertAnomalyDispatchRecordAsync(
        AnomalyDispatchRecordDto item,
        string actor,
        CancellationToken ct = default)
    {
        var summaryJson = JsonSerializer.Serialize(item, JsonOptions);
        await _decisionRepository.UpsertEvidenceLinkAsync(new AgentEvidenceLink
        {
            AgentDecisionId = $"anomaly-dispatch-{item.Id}",
            EvidenceType = "AnomalyDispatchRecord",
            EvidenceKey = item.Id,
            EvidenceSummary = summaryJson,
            CreatedAt = ParseEventTimestamp(item.CreatedAt),
        }, ct);

        await WriteAuditAsync(actor, "AnomalyDispatchRecordUpsert", "anomaly-dispatch-record", item.Id,
            item.AffectedOrders, item.TraceId, null, null, summaryJson, ct);

        return item;
    }

    public async Task<List<MonitoringSituationEscalationDto>> QueryMonitoringSituationEscalationsAsync(int take, CancellationToken ct = default)
    {
        var links = await _decisionRepository.QueryEvidenceLinksAsync("MonitoringSituationEscalation", take <= 0 ? 8 : take, ct);
        return WhereNotNull(links.Select(MapMonitoringSituationEscalation)).ToList();
    }

    public async Task<MonitoringSituationEscalationDto> UpsertMonitoringSituationEscalationAsync(
        MonitoringSituationEscalationDto item,
        string actor,
        CancellationToken ct = default)
    {
        var summaryJson = JsonSerializer.Serialize(item, JsonOptions);
        await _decisionRepository.UpsertEvidenceLinkAsync(new AgentEvidenceLink
        {
            AgentDecisionId = $"monitoring-situation-{item.Id}",
            EvidenceType = "MonitoringSituationEscalation",
            EvidenceKey = item.Id,
            EvidenceSummary = summaryJson,
            CreatedAt = ParseEventTimestamp(item.ClosedAt ?? item.CreatedAt),
        }, ct);

        await WriteAuditAsync(actor, "MonitoringSituationEscalationUpsert", "monitoring-situation-escalation", item.Id,
            item.WorkOrders, item.ClosureTrace ?? item.TraceId, null, null, summaryJson, ct);

        return item;
    }

    public async Task<RiskSlaReviewRecordDto?> GetLatestRiskSlaReviewAsync(CancellationToken ct = default)
    {
        var links = await _decisionRepository.QueryEvidenceLinksAsync("RiskSlaReview", 1, ct);
        return links.Select(MapRiskSlaReview).FirstOrDefault(item => item is not null);
    }

    public async Task<RiskSlaReviewRecordDto> UpsertRiskSlaReviewAsync(
        RiskSlaReviewRecordDto item,
        string actor,
        CancellationToken ct = default)
    {
        var summaryJson = JsonSerializer.Serialize(item, JsonOptions);
        await _decisionRepository.UpsertEvidenceLinkAsync(new AgentEvidenceLink
        {
            AgentDecisionId = $"risk-sla-review-{item.Id}",
            EvidenceType = "RiskSlaReview",
            EvidenceKey = item.Id,
            EvidenceSummary = summaryJson,
            CreatedAt = ParseEventTimestamp(item.ClosedAt ?? item.CreatedAt),
        }, ct);

        await WriteAuditAsync(actor, "RiskSlaReviewUpsert", "risk-sla-review", item.Id,
            item.AffectedOrders, item.ClosureTraceId ?? item.TraceId, null, null, summaryJson, ct);

        return item;
    }

    public async Task<List<RiskActionTraceDto>> QueryRiskActionTracesAsync(int take, CancellationToken ct = default)
    {
        var links = await _decisionRepository.QueryEvidenceLinksAsync("RiskActionTrace", take <= 0 ? 12 : take, ct);
        return WhereNotNull(links.Select(MapRiskActionTrace)).ToList();
    }

    public async Task<RiskActionTraceDto> UpsertRiskActionTraceAsync(
        RiskActionTraceDto item,
        string actor,
        CancellationToken ct = default)
    {
        var summaryJson = JsonSerializer.Serialize(item, JsonOptions);
        var evidenceKey = $"{item.Id}:{item.Status}";
        await _decisionRepository.UpsertEvidenceLinkAsync(new AgentEvidenceLink
        {
            AgentDecisionId = $"risk-action-{item.Id}-{item.Status}",
            EvidenceType = "RiskActionTrace",
            EvidenceKey = evidenceKey,
            EvidenceSummary = summaryJson,
            CreatedAt = ParseEventTimestamp(item.CreatedAt),
        }, ct);

        await WriteAuditAsync(actor, "RiskActionTraceUpsert", "risk-action-trace", evidenceKey,
            item.WorkOrders, item.DeliveryImpact, null, null, summaryJson, ct);

        return item;
    }

    public async Task<List<AssistantActionAuditRecordDto>> QueryAssistantActionAuditsAsync(int take, CancellationToken ct = default)
    {
        var links = await _decisionRepository.QueryEvidenceLinksAsync("AssistantActionAudit", take <= 0 ? 12 : take, ct);
        return WhereNotNull(links.Select(MapAssistantActionAudit)).ToList();
    }

    public async Task<AssistantActionAuditRecordDto> UpsertAssistantActionAuditAsync(
        AssistantActionAuditRecordDto item,
        string actor,
        CancellationToken ct = default)
    {
        var summaryJson = JsonSerializer.Serialize(item, JsonOptions);
        await _decisionRepository.UpsertEvidenceLinkAsync(new AgentEvidenceLink
        {
            AgentDecisionId = $"assistant-action-{item.Id}",
            EvidenceType = "AssistantActionAudit",
            EvidenceKey = item.Id,
            EvidenceSummary = summaryJson,
            CreatedAt = ParseEventTimestamp(item.CreatedAt),
        }, ct);

        await WriteAuditAsync(actor, "AssistantActionAuditUpsert", "assistant-action-audit", item.Id,
            item.ActionId, item.TraceId ?? item.AuditCode, null, null, summaryJson, ct);

        return item;
    }

    public async Task<List<AssistantRecoveryPackageDto>> QueryAssistantRecoveryPackagesAsync(int take, CancellationToken ct = default)
    {
        var links = await _decisionRepository.QueryEvidenceLinksAsync("AssistantRecoveryPackage", take <= 0 ? 8 : take, ct);
        return WhereNotNull(links.Select(MapAssistantRecoveryPackage)).ToList();
    }

    public async Task<AssistantRecoveryPackageDto> UpsertAssistantRecoveryPackageAsync(
        AssistantRecoveryPackageDto item,
        string actor,
        CancellationToken ct = default)
    {
        var summaryJson = JsonSerializer.Serialize(item, JsonOptions);
        await _decisionRepository.UpsertEvidenceLinkAsync(new AgentEvidenceLink
        {
            AgentDecisionId = $"assistant-recovery-{item.Id}",
            EvidenceType = "AssistantRecoveryPackage",
            EvidenceKey = item.Id,
            EvidenceSummary = summaryJson,
            CreatedAt = ParseEventTimestamp(item.ClosedAt ?? item.CreatedAt),
        }, ct);

        await WriteAuditAsync(actor, "AssistantRecoveryPackageUpsert", "assistant-recovery-package", item.Id,
            item.WorkOrders, item.ClosureTraceId ?? item.TraceId, null, null, summaryJson, ct);

        return item;
    }

    public async Task<List<AssistantAnomalyDispositionPackageDto>> QueryAssistantAnomalyPackagesAsync(int take, CancellationToken ct = default)
    {
        var links = await _decisionRepository.QueryEvidenceLinksAsync("AssistantAnomalyPackage", take <= 0 ? 8 : take, ct);
        return WhereNotNull(links.Select(MapAssistantAnomalyPackage)).ToList();
    }

    public async Task<AssistantAnomalyDispositionPackageDto> UpsertAssistantAnomalyPackageAsync(
        AssistantAnomalyDispositionPackageDto item,
        string actor,
        CancellationToken ct = default)
    {
        var summaryJson = JsonSerializer.Serialize(item, JsonOptions);
        await _decisionRepository.UpsertEvidenceLinkAsync(new AgentEvidenceLink
        {
            AgentDecisionId = $"assistant-anomaly-{item.Id}",
            EvidenceType = "AssistantAnomalyPackage",
            EvidenceKey = item.Id,
            EvidenceSummary = summaryJson,
            CreatedAt = ParseEventTimestamp(item.CreatedAt),
        }, ct);

        await WriteAuditAsync(actor, "AssistantAnomalyPackageUpsert", "assistant-anomaly-package", item.Id,
            item.WorkOrders, item.TraceId, null, null, summaryJson, ct);

        return item;
    }

    public async Task<List<AssistantEngineeringConstraintPackageDto>> QueryAssistantEngineeringConstraintPackagesAsync(int take, CancellationToken ct = default)
    {
        var links = await _decisionRepository.QueryEvidenceLinksAsync("AssistantEngineeringConstraintPackage", take <= 0 ? 8 : take, ct);
        return WhereNotNull(links.Select(MapAssistantEngineeringConstraintPackage)).ToList();
    }

    public async Task<AssistantEngineeringConstraintPackageDto> UpsertAssistantEngineeringConstraintPackageAsync(
        AssistantEngineeringConstraintPackageDto item,
        string actor,
        CancellationToken ct = default)
    {
        var summaryJson = JsonSerializer.Serialize(item, JsonOptions);
        await _decisionRepository.UpsertEvidenceLinkAsync(new AgentEvidenceLink
        {
            AgentDecisionId = $"assistant-engineering-{item.Id}",
            EvidenceType = "AssistantEngineeringConstraintPackage",
            EvidenceKey = item.Id,
            EvidenceSummary = summaryJson,
            CreatedAt = ParseEventTimestamp(item.CreatedAt),
        }, ct);

        await WriteAuditAsync(actor, "AssistantEngineeringConstraintPackageUpsert", "assistant-engineering-constraint-package", item.Id,
            item.WorkOrders, item.TraceId, null, null, summaryJson, ct);

        return item;
    }

    public async Task<CustomerOrderImportEvidenceDto?> GetLatestCustomerOrderImportAsync(CancellationToken ct = default)
    {
        var links = await _decisionRepository.QueryEvidenceLinksAsync("CustomerOrderImportEvidence", 1, ct);
        return links.Select(MapCustomerOrderImport).FirstOrDefault(item => item is not null);
    }

    public async Task<CustomerOrderImportEvidenceDto> UpsertCustomerOrderImportAsync(
        CustomerOrderImportEvidenceDto item,
        string actor,
        CancellationToken ct = default)
    {
        var summaryJson = JsonSerializer.Serialize(item, JsonOptions);
        await _decisionRepository.UpsertEvidenceLinkAsync(new AgentEvidenceLink
        {
            AgentDecisionId = $"customer-order-import-{item.BatchId}",
            EvidenceType = "CustomerOrderImportEvidence",
            EvidenceKey = item.BatchId,
            EvidenceSummary = summaryJson,
            CreatedAt = item.PreparedAt,
        }, ct);

        await WriteAuditAsync(actor, "CustomerOrderImportUpsert", "customer-order-import", item.BatchId,
            $"{item.ImportedOrders} orders / {item.HighRiskOrders} high risk", item.BatchId, null, null, summaryJson, ct);

        return item;
    }

    public async Task<PocReviewSignoffRecordDto?> GetLatestPocReviewSignoffAsync(CancellationToken ct = default)
    {
        var links = await _decisionRepository.QueryEvidenceLinksAsync("PocReviewSignoff", 1, ct);
        return links.Select(MapPocReviewSignoff).FirstOrDefault(item => item is not null);
    }

    public async Task<PocReviewSignoffRecordDto> UpsertPocReviewSignoffAsync(
        PocReviewSignoffRecordDto item,
        string actor,
        CancellationToken ct = default)
    {
        var summaryJson = JsonSerializer.Serialize(item, JsonOptions);
        await _decisionRepository.UpsertEvidenceLinkAsync(new AgentEvidenceLink
        {
            AgentDecisionId = $"poc-review-signoff-{item.Id}",
            EvidenceType = "PocReviewSignoff",
            EvidenceKey = item.Id,
            EvidenceSummary = summaryJson,
            CreatedAt = item.SignedAt,
        }, ct);

        await WriteAuditAsync(actor, "PocReviewSignoffUpsert", "poc-review-signoff", item.Id,
            item.MeetingId, item.AuditId, null, null, summaryJson, ct);

        return item;
    }

    public async Task<PocRolloutPackageDto?> GetLatestPocRolloutPackageAsync(CancellationToken ct = default)
    {
        var links = await _decisionRepository.QueryEvidenceLinksAsync("PocRolloutPackage", 1, ct);
        return links.Select(MapPocRolloutPackage).FirstOrDefault(item => item is not null);
    }

    public async Task<PocRolloutPackageDto> UpsertPocRolloutPackageAsync(
        PocRolloutPackageDto item,
        string actor,
        CancellationToken ct = default)
    {
        var summaryJson = JsonSerializer.Serialize(item, JsonOptions);
        await _decisionRepository.UpsertEvidenceLinkAsync(new AgentEvidenceLink
        {
            AgentDecisionId = $"poc-rollout-package-{item.Id}",
            EvidenceType = "PocRolloutPackage",
            EvidenceKey = item.Id,
            EvidenceSummary = summaryJson,
            CreatedAt = item.CreatedAt,
        }, ct);

        await WriteAuditAsync(actor, "PocRolloutPackageUpsert", "poc-rollout-package", item.Id,
            item.TargetCustomer, item.TraceId, null, null, summaryJson, ct);

        return item;
    }

    public async Task<PocPilotRunRecordDto?> GetLatestPocPilotRunAsync(CancellationToken ct = default)
    {
        var links = await _decisionRepository.QueryEvidenceLinksAsync("PocPilotRun", 1, ct);
        return links.Select(MapPocPilotRun).FirstOrDefault(item => item is not null);
    }

    public async Task<PocPilotRunRecordDto> UpsertPocPilotRunAsync(
        PocPilotRunRecordDto item,
        string actor,
        CancellationToken ct = default)
    {
        var summaryJson = JsonSerializer.Serialize(item, JsonOptions);
        await _decisionRepository.UpsertEvidenceLinkAsync(new AgentEvidenceLink
        {
            AgentDecisionId = $"poc-pilot-run-{item.Id}",
            EvidenceType = "PocPilotRun",
            EvidenceKey = item.Id,
            EvidenceSummary = summaryJson,
            CreatedAt = item.CreatedAt,
        }, ct);

        await WriteAuditAsync(actor, "PocPilotRunUpsert", "poc-pilot-run", item.Id,
            $"{item.BatchId} / {item.SampleSize} orders", item.TraceId, null, null, summaryJson, ct);

        return item;
    }

    public async Task<PocHypercareAcceptanceDto?> GetLatestPocHypercareAcceptanceAsync(CancellationToken ct = default)
    {
        var links = await _decisionRepository.QueryEvidenceLinksAsync("PocHypercareAcceptance", 1, ct);
        return links.Select(MapPocHypercareAcceptance).FirstOrDefault(item => item is not null);
    }

    public async Task<PocHypercareAcceptanceDto> UpsertPocHypercareAcceptanceAsync(
        PocHypercareAcceptanceDto item,
        string actor,
        CancellationToken ct = default)
    {
        var summaryJson = JsonSerializer.Serialize(item, JsonOptions);
        await _decisionRepository.UpsertEvidenceLinkAsync(new AgentEvidenceLink
        {
            AgentDecisionId = $"poc-hypercare-acceptance-{item.Id}",
            EvidenceType = "PocHypercareAcceptance",
            EvidenceKey = item.Id,
            EvidenceSummary = summaryJson,
            CreatedAt = item.CreatedAt,
        }, ct);

        await WriteAuditAsync(actor, "PocHypercareAcceptanceUpsert", "poc-hypercare-acceptance", item.Id,
            item.TargetCustomer, item.TraceId, null, null, summaryJson, ct);

        return item;
    }

    public async Task<List<KnowledgeGovernanceReviewRecordDto>> QueryKnowledgeGovernanceReviewsAsync(int take, CancellationToken ct = default)
    {
        var links = await _decisionRepository.QueryEvidenceLinksAsync("KnowledgeGovernanceReview", take <= 0 ? 12 : take, ct);
        return WhereNotNull(links.Select(MapKnowledgeGovernanceReview)).ToList();
    }

    public async Task<KnowledgeGovernanceReviewRecordDto> UpsertKnowledgeGovernanceReviewAsync(
        KnowledgeGovernanceReviewRecordDto item,
        string actor,
        CancellationToken ct = default)
    {
        var summaryJson = JsonSerializer.Serialize(item, JsonOptions);
        await _decisionRepository.UpsertEvidenceLinkAsync(new AgentEvidenceLink
        {
            AgentDecisionId = $"knowledge-governance-review-{item.Id}",
            EvidenceType = "KnowledgeGovernanceReview",
            EvidenceKey = item.Id,
            EvidenceSummary = summaryJson,
            CreatedAt = item.ReviewedAt,
        }, ct);

        await WriteAuditAsync(actor, "KnowledgeGovernanceReviewUpsert", "knowledge-governance-review", item.Id,
            item.DocumentId, item.TraceId, null, null, summaryJson, ct);

        return item;
    }

    public async Task<List<LaborReassignmentRecordDto>> QueryLaborReassignmentsAsync(int take, CancellationToken ct = default)
    {
        var links = await _decisionRepository.QueryEvidenceLinksAsync("LaborReassignment", take <= 0 ? 12 : take, ct);
        return WhereNotNull(links.Select(MapLaborReassignment)).ToList();
    }

    public async Task<LaborReassignmentRecordDto> UpsertLaborReassignmentAsync(
        LaborReassignmentRecordDto item,
        string actor,
        CancellationToken ct = default)
    {
        var summaryJson = JsonSerializer.Serialize(item, JsonOptions);
        await _decisionRepository.UpsertEvidenceLinkAsync(new AgentEvidenceLink
        {
            AgentDecisionId = $"labor-reassignment-{item.Id}",
            EvidenceType = "LaborReassignment",
            EvidenceKey = item.Id,
            EvidenceSummary = summaryJson,
            CreatedAt = ParseEventTimestamp(item.CreatedAt),
        }, ct);

        await WriteAuditAsync(actor, "LaborReassignmentUpsert", "labor-reassignment", item.Id,
            item.WorkOrderNumber, item.TraceId, null, null, summaryJson, ct);

        return item;
    }

    public async Task<List<LaborQualificationBlockRecordDto>> QueryLaborQualificationBlocksAsync(int take, CancellationToken ct = default)
    {
        var links = await _decisionRepository.QueryEvidenceLinksAsync("LaborQualificationBlock", take <= 0 ? 12 : take, ct);
        return WhereNotNull(links.Select(MapLaborQualificationBlock)).ToList();
    }

    public async Task<LaborQualificationBlockRecordDto> UpsertLaborQualificationBlockAsync(
        LaborQualificationBlockRecordDto item,
        string actor,
        CancellationToken ct = default)
    {
        var summaryJson = JsonSerializer.Serialize(item, JsonOptions);
        await _decisionRepository.UpsertEvidenceLinkAsync(new AgentEvidenceLink
        {
            AgentDecisionId = $"labor-qualification-block-{item.Id}",
            EvidenceType = "LaborQualificationBlock",
            EvidenceKey = item.Id,
            EvidenceSummary = summaryJson,
            CreatedAt = ParseEventTimestamp(item.ReleasedAt ?? item.CreatedAt),
        }, ct);

        await WriteAuditAsync(actor, "LaborQualificationBlockUpsert", "labor-qualification-block", item.Id,
            item.WorkOrderNumber, item.ReleaseTraceId ?? item.TraceId, null, null, summaryJson, ct);

        return item;
    }

    public async Task<List<BarcodeScanEvidenceRecordDto>> QueryBarcodeScanEvidenceAsync(int take, CancellationToken ct = default)
    {
        var links = await _decisionRepository.QueryEvidenceLinksAsync("BarcodeScanEvidence", take <= 0 ? 20 : take, ct);
        return WhereNotNull(links.Select(MapBarcodeScanEvidence)).ToList();
    }

    public async Task<BarcodeScanEvidenceRecordDto> UpsertBarcodeScanEvidenceAsync(
        BarcodeScanEvidenceRecordDto item,
        string actor,
        CancellationToken ct = default)
    {
        var summaryJson = JsonSerializer.Serialize(item, JsonOptions);
        await _decisionRepository.UpsertEvidenceLinkAsync(new AgentEvidenceLink
        {
            AgentDecisionId = $"barcode-scan-evidence-{item.Id}",
            EvidenceType = "BarcodeScanEvidence",
            EvidenceKey = item.Id,
            EvidenceSummary = summaryJson,
            CreatedAt = ParseEventTimestamp(item.CreatedAt),
        }, ct);

        await WriteAuditAsync(actor, "BarcodeScanEvidenceUpsert", "barcode-scan-evidence", item.Id,
            item.Object, item.TraceId, null, null, summaryJson, ct);

        return item;
    }

    public async Task<QualityCapaClosureDto?> GetLatestQualityCapaClosureAsync(CancellationToken ct = default)
    {
        var links = await _decisionRepository.QueryEvidenceLinksAsync("QualityCapaClosure", 1, ct);
        return links.Select(MapQualityCapaClosure).FirstOrDefault(item => item is not null);
    }

    public async Task<QualityCapaClosureDto> UpsertQualityCapaClosureAsync(
        QualityCapaClosureDto item,
        string actor,
        CancellationToken ct = default)
    {
        var summaryJson = JsonSerializer.Serialize(item, JsonOptions);
        await _decisionRepository.UpsertEvidenceLinkAsync(new AgentEvidenceLink
        {
            AgentDecisionId = $"quality-capa-closure-{item.InspectionId}",
            EvidenceType = "QualityCapaClosure",
            EvidenceKey = item.InspectionId,
            EvidenceSummary = summaryJson,
            CreatedAt = ParseEventTimestamp(item.VerifiedAt),
        }, ct);

        await WriteAuditAsync(actor, "QualityCapaClosureUpsert", "quality-capa-closure", item.InspectionId,
            item.WorkOrderId, item.TraceId, null, null, summaryJson, ct);

        return item;
    }

    public async Task<List<AgentConfigApprovalRecordDto>> QueryAgentConfigApprovalsAsync(int take, CancellationToken ct = default)
    {
        var links = await _decisionRepository.QueryEvidenceLinksAsync("AgentConfigApproval", take <= 0 ? 12 : take, ct);
        return WhereNotNull(links.Select(MapAgentConfigApproval)).ToList();
    }

    public async Task<AgentConfigApprovalRecordDto> UpsertAgentConfigApprovalAsync(
        AgentConfigApprovalRecordDto item,
        string actor,
        CancellationToken ct = default)
    {
        var summaryJson = JsonSerializer.Serialize(item, JsonOptions);
        await _decisionRepository.UpsertEvidenceLinkAsync(new AgentEvidenceLink
        {
            AgentDecisionId = $"agent-config-approval-{item.Id}",
            EvidenceType = "AgentConfigApproval",
            EvidenceKey = item.Id,
            EvidenceSummary = summaryJson,
            CreatedAt = ParseEventTimestamp(item.DecidedAt ?? item.SubmittedAt),
        }, ct);

        await WriteAuditAsync(actor, "AgentConfigApprovalUpsert", "agent-config-approval", item.Id,
            item.ConfigKey, item.AuditId, null, null, summaryJson, ct);

        return item;
    }

    public async Task<List<OtdKpiCommitmentPackageDto>> QueryOtdKpiCommitmentsAsync(int take, CancellationToken ct = default)
    {
        var links = await _decisionRepository.QueryEvidenceLinksAsync("OtdKpiCommitmentPackage", take <= 0 ? 8 : take, ct);
        return WhereNotNull(links.Select(MapOtdKpiCommitment)).ToList();
    }

    public async Task<OtdKpiCommitmentPackageDto?> GetLatestOtdKpiCommitmentAsync(CancellationToken ct = default)
    {
        var links = await _decisionRepository.QueryEvidenceLinksAsync("OtdKpiCommitmentPackage", 1, ct);
        return links.Select(MapOtdKpiCommitment).FirstOrDefault(item => item is not null);
    }

    public async Task<OtdKpiCommitmentPackageDto> UpsertOtdKpiCommitmentAsync(
        OtdKpiCommitmentPackageDto item,
        string actor,
        CancellationToken ct = default)
    {
        var summaryJson = JsonSerializer.Serialize(item, JsonOptions);
        await _decisionRepository.UpsertEvidenceLinkAsync(new AgentEvidenceLink
        {
            AgentDecisionId = $"otd-kpi-commitment-{item.Id}",
            EvidenceType = "OtdKpiCommitmentPackage",
            EvidenceKey = item.Id,
            EvidenceSummary = summaryJson,
            CreatedAt = item.CreatedAt,
        }, ct);

        await WriteAuditAsync(actor, "OtdKpiCommitmentPackageUpsert", "otd-kpi-commitment-package", item.Id,
            item.TargetName, item.TraceId, null, null, summaryJson, ct);

        return item;
    }

    public async Task<List<QualityKnowledgeEvidenceRecordDto>> QueryQualityKnowledgeEvidenceAsync(
        string? evidenceType,
        int take,
        CancellationToken ct = default)
    {
        var links = await _decisionRepository.QueryEvidenceLinksAsync("QualityKnowledgeEvidence", take <= 0 ? 20 : take, ct);
        return WhereNotNull(links.Select(MapQualityKnowledgeEvidence))
            .Where(item => string.IsNullOrWhiteSpace(evidenceType) || item.EvidenceType == evidenceType)
            .ToList();
    }

    public async Task<QualityKnowledgeEvidenceRecordDto> UpsertQualityKnowledgeEvidenceAsync(
        QualityKnowledgeEvidenceRecordDto item,
        string actor,
        CancellationToken ct = default)
    {
        var summaryJson = JsonSerializer.Serialize(item, JsonOptions);
        await _decisionRepository.UpsertEvidenceLinkAsync(new AgentEvidenceLink
        {
            AgentDecisionId = $"quality-knowledge-{item.EvidenceType}-{item.Id}",
            EvidenceType = "QualityKnowledgeEvidence",
            EvidenceKey = $"{item.EvidenceType}:{item.Id}",
            EvidenceSummary = summaryJson,
            CreatedAt = item.CreatedAt,
        }, ct);

        await WriteAuditAsync(actor, "QualityKnowledgeEvidenceUpsert", "quality-knowledge-evidence", $"{item.EvidenceType}:{item.Id}",
            item.Title, item.TraceId, null, null, summaryJson, ct);

        return item;
    }

    private async Task<List<Domain.Entities.Production.WorkOrder>> LoadWorkOrdersAsync(AgentRecommendRequest request, CancellationToken ct)
    {
        if (request.WorkOrderIds is { Count: > 0 })
        {
            var selected = new List<Domain.Entities.Production.WorkOrder>();
            foreach (var id in request.WorkOrderIds)
            {
                var workOrder = await _workOrderRepository.GetByIdAsync(id, ct);
                if (workOrder is not null)
                    selected.Add(workOrder);
            }
            return selected;
        }

        var workOrders = await _workOrderRepository.GetByWorkshopAsync(request.WorkshopId, ct);
        return workOrders
            .Where(w => w.Status is WorkOrderStatus.Created or WorkOrderStatus.Scheduled)
            .ToList();
    }

    private async Task RecordAgentActionAsync(
        AgentDecision? decision,
        AgentActionType action,
        string resultStatus,
        string actor,
        string role,
        string? reason,
        string auditAction,
        string payloadJson,
        CancellationToken ct,
        string? fallbackDecisionId = null)
    {
        var decisionId = decision?.Id ?? fallbackDecisionId
            ?? throw new InvalidOperationException("Agent decision id is required for action result.");
        var businessKey = decision?.BusinessKey ?? $"AgentDecision:{decisionId}";
        var auditLogId = await WriteAuditAsync(actor, auditAction, "scheduling-agent", decisionId, businessKey,
            decision?.TraceId, decision?.PromptHash, decision?.ContextHash, payloadJson, ct);

        await _decisionRepository.AddActionResultAsync(new AgentActionResult
        {
            AgentDecisionId = decisionId,
            ActionType = AgentPermissionPolicy.GetActionName(action),
            ResultStatus = resultStatus,
            Actor = actor,
            Role = role,
            InitiatedBy = "User",
            Reason = reason,
            ResultPayloadJson = payloadJson,
            AuditLogId = auditLogId,
        }, ct);
    }

    private async Task<string> WriteAuditAsync(string actor, string action, string resource, string resourceId, string businessKey,
        string? traceId, string? promptHash, string? contextHash, string newValues, CancellationToken ct)
    {
        var auditLog = new AuditLog
        {
            UserId = actor,
            InitiatedBy = AuditInitiatedBy.User,
            Action = action,
            Resource = resource,
            ResourceId = resourceId,
            BusinessKey = businessKey,
            TraceId = traceId,
            PromptHash = promptHash,
            ContextHash = contextHash,
            NewValues = newValues,
            CreatedAt = DateTime.UtcNow,
        };
        await _unitOfWork.ExecuteAsync(innerCt => _auditLogRepository.AddAsync(auditLog, innerCt), ct);
        return auditLog.Id;
    }

    private async Task WriteScheduleAdoptionFeedbackEvidenceAsync(
        ScheduleAdoptionFeedback feedback,
        string actor,
        AgentDecision decision,
        CancellationToken ct)
    {
        var summaryJson = JsonSerializer.Serialize(new
        {
            feedback.Id,
            feedback.SchedulePlanId,
            feedback.WorkshopId,
            feedback.OptimizationObjective,
            Decision = "accepted",
            DecisionLabel = "已采纳 Agent 排产建议",
            ReasonCategory = feedback.ReasonCategory.ToString(),
            CategoryLabel = "其他",
            feedback.ReasonDetail,
            ObjectiveLabel = feedback.OptimizationObjective,
            feedback.MovedOrderIdsJson,
            feedback.OperatorUser,
            feedback.AiTraceId,
            feedback.AgentDecisionId,
            feedback.AgentVersion,
            feedback.CreatedAt,
        }, JsonOptions);
        await _decisionRepository.UpsertEvidenceLinkAsync(new AgentEvidenceLink
        {
            AgentDecisionId = decision.Id,
            EvidenceType = "ScheduleAdoptionFeedback",
            EvidenceKey = feedback.Id,
            EvidenceSummary = summaryJson,
            CreatedAt = feedback.CreatedAt,
        }, ct);
        await WriteAuditAsync(actor, "ScheduleAdoptionFeedbackUpsert", "schedule-adoption-feedback", feedback.Id,
            $"SchedulePlan:{feedback.SchedulePlanId}", decision.TraceId, decision.PromptHash, decision.ContextHash, summaryJson, ct);
    }

    private static string ExtractWorkshopId(AgentDecision decision)
    {
        const string workshopPrefix = "Workshop:";
        return decision.BusinessKey.StartsWith(workshopPrefix, StringComparison.OrdinalIgnoreCase)
            ? decision.BusinessKey[workshopPrefix.Length..]
            : decision.BusinessKey;
    }

    private static AgentDecisionDto MapDecision(AgentDecision decision)
    {
        return new AgentDecisionDto
        {
            Id = decision.Id,
            TriggerEventId = decision.TriggerEventId,
            BoundedContext = decision.BoundedContext,
            DecisionType = decision.DecisionType,
            Status = decision.Status,
            RecommendedScenarioId = decision.RecommendedScenarioId,
            AdoptedScenarioId = decision.AdoptedScenarioId,
            AgentName = decision.AgentName,
            AgentVersion = decision.AgentVersion,
            TraceId = decision.TraceId,
            PromptHash = decision.PromptHash,
            ContextHash = decision.ContextHash,
            InputSummary = decision.InputSummary,
            OutputSummary = decision.OutputSummary,
            BusinessKey = decision.BusinessKey,
            CreatedAt = decision.CreatedAt,
            Scenarios = decision.Scenarios.Select(s => new AgentDecisionScenarioDto
            {
                Id = s.Id,
                StrategyName = s.StrategyName,
                PriorityRule = s.PriorityRule,
                CapacityStrategy = s.CapacityStrategy,
                Objective = s.Objective,
                OtdProjection = s.OtdProjection,
                UtilizationProjection = s.UtilizationProjection,
                ChangeoverProjection = s.ChangeoverProjection,
                Explanation = s.Explanation,
                SacrificedObjectives = s.SacrificedObjectives,
            }).ToList()
        };
    }

    private static string BuildSacrificeSummary(RuleEngineResult result)
    {
        if (result.Validation.IsValid)
            return result.Warnings.Count == 0 ? "无明显牺牲目标" : string.Join("; ", result.Warnings);

        var errors = result.Validation.Violations
            .Where(v => v.Level == ConstraintViolationLevel.Error)
            .Select(v => v.Message);
        return string.Join("; ", errors);
    }

    private static string ComputeSha256(string value)
    {
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(value));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    private static string? GetPayloadString(Dictionary<string, object> payload, string key)
    {
        if (!payload.TryGetValue(key, out var value) || value is null)
            return null;

        return value switch
        {
            string text => text,
            JsonElement { ValueKind: JsonValueKind.String } element => element.GetString(),
            JsonElement element => element.ToString(),
            _ => value.ToString(),
        };
    }

    private static int? GetPayloadInt(Dictionary<string, object> payload, string key)
    {
        var value = GetPayloadString(payload, key);
        return int.TryParse(value, out var result) ? result : null;
    }

    private static decimal? GetPayloadDecimal(Dictionary<string, object> payload, string key)
    {
        var value = GetPayloadString(payload, key);
        return decimal.TryParse(value, out var result) ? result : null;
    }

    private static DateTime ParseEventTimestamp(string value)
    {
        return DateTimeOffset.TryParse(value, out var timestamp)
            ? timestamp.UtcDateTime
            : DateTime.UtcNow;
    }

    private static IEnumerable<T> WhereNotNull<T>(IEnumerable<T?> values)
        where T : class
    {
        foreach (var value in values)
        {
            if (value is not null)
            {
                yield return value;
            }
        }
    }

    private static OtdEvidenceChainItemDto? MapOtdEvidence(AgentEvidenceLink link)
    {
        if (string.IsNullOrWhiteSpace(link.EvidenceSummary))
            return null;

        try
        {
            return JsonSerializer.Deserialize<OtdEvidenceChainItemDto>(link.EvidenceSummary, JsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static EquipmentDowntimeEventDto? MapEquipmentDowntime(AgentEvidenceLink link)
    {
        if (string.IsNullOrWhiteSpace(link.EvidenceSummary))
            return null;

        try
        {
            return JsonSerializer.Deserialize<EquipmentDowntimeEventDto>(link.EvidenceSummary, JsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static CustomerEquipmentFaultEvidenceDto? MapCustomerEquipmentFault(AgentEvidenceLink link)
    {
        if (string.IsNullOrWhiteSpace(link.EvidenceSummary))
            return null;

        try
        {
            return JsonSerializer.Deserialize<CustomerEquipmentFaultEvidenceDto>(link.EvidenceSummary, JsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static ShortageKittingEventDto? MapShortageKitting(AgentEvidenceLink link)
    {
        if (string.IsNullOrWhiteSpace(link.EvidenceSummary))
            return null;

        try
        {
            return JsonSerializer.Deserialize<ShortageKittingEventDto>(link.EvidenceSummary, JsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static ShortageRiskResolutionDto? MapShortageRiskResolution(AgentEvidenceLink link)
    {
        if (string.IsNullOrWhiteSpace(link.EvidenceSummary))
            return null;

        try
        {
            return JsonSerializer.Deserialize<ShortageRiskResolutionDto>(link.EvidenceSummary, JsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static BomKittingPackageDto? MapBomKittingPackage(AgentEvidenceLink link)
    {
        if (string.IsNullOrWhiteSpace(link.EvidenceSummary))
            return null;

        try
        {
            return JsonSerializer.Deserialize<BomKittingPackageDto>(link.EvidenceSummary, JsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static SupplyRiskEscalationDto? MapSupplyRiskEscalation(AgentEvidenceLink link)
    {
        if (string.IsNullOrWhiteSpace(link.EvidenceSummary))
            return null;

        try
        {
            return JsonSerializer.Deserialize<SupplyRiskEscalationDto>(link.EvidenceSummary, JsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static SupplierNetworkDecisionDto? MapSupplierNetworkDecision(AgentEvidenceLink link)
    {
        if (string.IsNullOrWhiteSpace(link.EvidenceSummary))
            return null;

        try
        {
            return JsonSerializer.Deserialize<SupplierNetworkDecisionDto>(link.EvidenceSummary, JsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static OutsourcingCommitmentPackageDto? MapOutsourcingCommitment(AgentEvidenceLink link)
    {
        if (string.IsNullOrWhiteSpace(link.EvidenceSummary))
            return null;

        try
        {
            return JsonSerializer.Deserialize<OutsourcingCommitmentPackageDto>(link.EvidenceSummary, JsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static QualityReworkImpactDto? MapQualityReworkImpact(AgentEvidenceLink link)
    {
        if (string.IsNullOrWhiteSpace(link.EvidenceSummary))
            return null;

        try
        {
            return JsonSerializer.Deserialize<QualityReworkImpactDto>(link.EvidenceSummary, JsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static QualityMrbDispositionRecordDto? MapQualityMrbDisposition(AgentEvidenceLink link)
    {
        if (string.IsNullOrWhiteSpace(link.EvidenceSummary))
            return null;

        try
        {
            return JsonSerializer.Deserialize<QualityMrbDispositionRecordDto>(link.EvidenceSummary, JsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static AlternateMaterialApprovalDto? MapAlternateMaterialApproval(AgentEvidenceLink link)
    {
        if (string.IsNullOrWhiteSpace(link.EvidenceSummary))
            return null;

        try
        {
            return JsonSerializer.Deserialize<AlternateMaterialApprovalDto>(link.EvidenceSummary, JsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static EngineeringChangeImpactAnalysisDto? MapEngineeringChangeImpact(AgentEvidenceLink link)
    {
        if (string.IsNullOrWhiteSpace(link.EvidenceSummary))
            return null;

        try
        {
            return JsonSerializer.Deserialize<EngineeringChangeImpactAnalysisDto>(link.EvidenceSummary, JsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static RouteCapabilityValidationDto? MapRouteCapabilityValidation(AgentEvidenceLink link)
    {
        if (string.IsNullOrWhiteSpace(link.EvidenceSummary))
            return null;

        try
        {
            return JsonSerializer.Deserialize<RouteCapabilityValidationDto>(link.EvidenceSummary, JsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static ProductionAnomalyEventDto? MapProductionAnomalyEvent(AgentEvidenceLink link)
    {
        if (string.IsNullOrWhiteSpace(link.EvidenceSummary))
            return null;

        try
        {
            return JsonSerializer.Deserialize<ProductionAnomalyEventDto>(link.EvidenceSummary, JsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static AnomalyDispatchRecordDto? MapAnomalyDispatchRecord(AgentEvidenceLink link)
    {
        if (string.IsNullOrWhiteSpace(link.EvidenceSummary))
            return null;

        try
        {
            return JsonSerializer.Deserialize<AnomalyDispatchRecordDto>(link.EvidenceSummary, JsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static MonitoringSituationEscalationDto? MapMonitoringSituationEscalation(AgentEvidenceLink link)
    {
        if (string.IsNullOrWhiteSpace(link.EvidenceSummary))
            return null;

        try
        {
            return JsonSerializer.Deserialize<MonitoringSituationEscalationDto>(link.EvidenceSummary, JsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static RiskSlaReviewRecordDto? MapRiskSlaReview(AgentEvidenceLink link)
    {
        if (string.IsNullOrWhiteSpace(link.EvidenceSummary))
            return null;

        try
        {
            return JsonSerializer.Deserialize<RiskSlaReviewRecordDto>(link.EvidenceSummary, JsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static RiskActionTraceDto? MapRiskActionTrace(AgentEvidenceLink link)
    {
        if (string.IsNullOrWhiteSpace(link.EvidenceSummary))
            return null;

        try
        {
            return JsonSerializer.Deserialize<RiskActionTraceDto>(link.EvidenceSummary, JsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static AssistantActionAuditRecordDto? MapAssistantActionAudit(AgentEvidenceLink link)
    {
        if (string.IsNullOrWhiteSpace(link.EvidenceSummary))
            return null;

        try
        {
            return JsonSerializer.Deserialize<AssistantActionAuditRecordDto>(link.EvidenceSummary, JsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static AssistantRecoveryPackageDto? MapAssistantRecoveryPackage(AgentEvidenceLink link)
    {
        if (string.IsNullOrWhiteSpace(link.EvidenceSummary))
            return null;

        try
        {
            return JsonSerializer.Deserialize<AssistantRecoveryPackageDto>(link.EvidenceSummary, JsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static AssistantAnomalyDispositionPackageDto? MapAssistantAnomalyPackage(AgentEvidenceLink link)
    {
        if (string.IsNullOrWhiteSpace(link.EvidenceSummary))
            return null;

        try
        {
            return JsonSerializer.Deserialize<AssistantAnomalyDispositionPackageDto>(link.EvidenceSummary, JsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static AssistantEngineeringConstraintPackageDto? MapAssistantEngineeringConstraintPackage(AgentEvidenceLink link)
    {
        if (string.IsNullOrWhiteSpace(link.EvidenceSummary))
            return null;

        try
        {
            return JsonSerializer.Deserialize<AssistantEngineeringConstraintPackageDto>(link.EvidenceSummary, JsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static CustomerOrderImportEvidenceDto? MapCustomerOrderImport(AgentEvidenceLink link)
    {
        if (string.IsNullOrWhiteSpace(link.EvidenceSummary))
            return null;

        try
        {
            return JsonSerializer.Deserialize<CustomerOrderImportEvidenceDto>(link.EvidenceSummary, JsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static PocReviewSignoffRecordDto? MapPocReviewSignoff(AgentEvidenceLink link)
    {
        if (string.IsNullOrWhiteSpace(link.EvidenceSummary))
            return null;

        try
        {
            return JsonSerializer.Deserialize<PocReviewSignoffRecordDto>(link.EvidenceSummary, JsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static PocRolloutPackageDto? MapPocRolloutPackage(AgentEvidenceLink link)
    {
        if (string.IsNullOrWhiteSpace(link.EvidenceSummary))
            return null;

        try
        {
            return JsonSerializer.Deserialize<PocRolloutPackageDto>(link.EvidenceSummary, JsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static PocPilotRunRecordDto? MapPocPilotRun(AgentEvidenceLink link)
    {
        if (string.IsNullOrWhiteSpace(link.EvidenceSummary))
            return null;

        try
        {
            return JsonSerializer.Deserialize<PocPilotRunRecordDto>(link.EvidenceSummary, JsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static PocHypercareAcceptanceDto? MapPocHypercareAcceptance(AgentEvidenceLink link)
    {
        if (string.IsNullOrWhiteSpace(link.EvidenceSummary))
            return null;

        try
        {
            return JsonSerializer.Deserialize<PocHypercareAcceptanceDto>(link.EvidenceSummary, JsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static KnowledgeGovernanceReviewRecordDto? MapKnowledgeGovernanceReview(AgentEvidenceLink link)
    {
        if (string.IsNullOrWhiteSpace(link.EvidenceSummary))
            return null;

        try
        {
            return JsonSerializer.Deserialize<KnowledgeGovernanceReviewRecordDto>(link.EvidenceSummary, JsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static LaborReassignmentRecordDto? MapLaborReassignment(AgentEvidenceLink link)
    {
        if (string.IsNullOrWhiteSpace(link.EvidenceSummary))
            return null;

        try
        {
            return JsonSerializer.Deserialize<LaborReassignmentRecordDto>(link.EvidenceSummary, JsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static LaborQualificationBlockRecordDto? MapLaborQualificationBlock(AgentEvidenceLink link)
    {
        if (string.IsNullOrWhiteSpace(link.EvidenceSummary))
            return null;

        try
        {
            return JsonSerializer.Deserialize<LaborQualificationBlockRecordDto>(link.EvidenceSummary, JsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static BarcodeScanEvidenceRecordDto? MapBarcodeScanEvidence(AgentEvidenceLink link)
    {
        if (string.IsNullOrWhiteSpace(link.EvidenceSummary))
            return null;

        try
        {
            return JsonSerializer.Deserialize<BarcodeScanEvidenceRecordDto>(link.EvidenceSummary, JsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static QualityCapaClosureDto? MapQualityCapaClosure(AgentEvidenceLink link)
    {
        if (string.IsNullOrWhiteSpace(link.EvidenceSummary))
            return null;

        try
        {
            return JsonSerializer.Deserialize<QualityCapaClosureDto>(link.EvidenceSummary, JsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static AgentConfigApprovalRecordDto? MapAgentConfigApproval(AgentEvidenceLink link)
    {
        if (string.IsNullOrWhiteSpace(link.EvidenceSummary))
            return null;

        try
        {
            return JsonSerializer.Deserialize<AgentConfigApprovalRecordDto>(link.EvidenceSummary, JsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static OtdKpiCommitmentPackageDto? MapOtdKpiCommitment(AgentEvidenceLink link)
    {
        if (string.IsNullOrWhiteSpace(link.EvidenceSummary))
            return null;

        try
        {
            return JsonSerializer.Deserialize<OtdKpiCommitmentPackageDto>(link.EvidenceSummary, JsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static QualityKnowledgeEvidenceRecordDto? MapQualityKnowledgeEvidence(AgentEvidenceLink link)
    {
        if (string.IsNullOrWhiteSpace(link.EvidenceSummary))
            return null;

        try
        {
            return JsonSerializer.Deserialize<QualityKnowledgeEvidenceRecordDto>(link.EvidenceSummary, JsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private sealed record ScenarioSpec(string Name, PriorityRule PriorityRule, CapacitySelectionStrategy CapacityStrategy, string Explanation);
}
