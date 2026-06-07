using System.Security.Claims;
using MES.AI.Core.Models;
using MES.AI.Core.Scheduling;
using MES.Api.Filters;
using MES.Application.DTOs;
using MES.Application.Services;
using MES.Domain.Authorization;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Enums;
using MES.Domain.Interfaces.Repositories;

namespace MES.Api.Endpoints;

public static class SchedulingEndpoints
{
    private static readonly AuditEndpointFilter Audit = new("scheduling");

    public static RouteGroupBuilder MapSchedulingEndpoints(this RouteGroupBuilder group)
    {
        group.MapPost("/optimize", OptimizeScheduleAsync)
             .WithTags("排产管理")
             .RequireAuthorization()
             .AddEndpointFilter<ValidationEndpointFilter>()
             .AddEndpointFilter(Audit);
        group.MapPost("/rule-based", RuleBasedScheduleAsync)
             .WithTags("排产管理")
             .RequireAuthorization()
             .AddEndpointFilter<ValidationEndpointFilter>();
        group.MapGet("/current", GetCurrentPlanAsync).WithTags("排产管理");
        group.MapGet("/plans", GetAllPlansAsync).WithTags("排产管理");
        group.MapGet("/plans/{id}", GetPlanByIdAsync).WithTags("排产管理");
        group.MapPatch("/plans/{planId}/items/{itemId}", RescheduleItemAsync)
             .WithTags("排产管理")
             .RequireAuthorization()
             .AddEndpointFilter<ValidationEndpointFilter>();
        group.MapPost("/workorders", CreateWorkOrderAsync)
             .WithTags("排产管理")
             .RequireAuthorization()
             .AddEndpointFilter<ValidationEndpointFilter>()
             .AddEndpointFilter(Audit);
        group.MapGet("/workorders", GetWorkOrdersAsync).WithTags("排产管理");
        group.MapGet("/workorders/{id}", GetWorkOrderByIdAsync).WithTags("排产管理");
        group.MapPatch("/workorders/{id}/status", UpdateWorkOrderStatusAsync)
             .WithTags("排产管理")
             .RequireAuthorization()
             .AddEndpointFilter<ValidationEndpointFilter>()
             .AddEndpointFilter(Audit);
        group.MapDelete("/workorders/{id}", DeleteWorkOrderAsync)
             .WithTags("排产管理")
             .RequireAuthorization()
             .AddEndpointFilter(Audit);
        group.MapPost("/optimize-compare", BatchOptimizeAsync)
             .WithTags("排产管理")
             .RequireAuthorization()
             .AddEndpointFilter<ValidationEndpointFilter>()
             .AddEndpointFilter(Audit);
        group.MapPost("/adoption-feedback", SubmitAdoptionFeedbackAsync)
             .WithTags("排产管理")
             .RequireAuthorization()
             .AddEndpointFilter<ValidationEndpointFilter>()
             .AddEndpointFilter(Audit);
        group.MapGet("/adoption-feedback/latest", GetLatestAdoptionFeedbackAsync)
             .WithTags("排产管理")
             .RequireAuthorization();
        group.MapGet("/otd-evidence", QueryOtdEvidenceAsync)
             .WithTags("OTD证据链")
             .RequireAuthorization();
        group.MapPost("/otd-evidence", UpsertOtdEvidenceAsync)
             .WithTags("OTD证据链")
             .RequireAuthorization();
        group.MapGet("/equipment-downtime/latest", GetLatestEquipmentDowntimeAsync)
             .WithTags("设备证据链")
             .RequireAuthorization();
        group.MapPost("/equipment-downtime", UpsertEquipmentDowntimeAsync)
             .WithTags("设备证据链")
             .RequireAuthorization();
        group.MapGet("/customer-equipment-fault/latest", GetLatestCustomerEquipmentFaultAsync)
             .WithTags("设备证据链")
             .RequireAuthorization();
        group.MapPost("/customer-equipment-fault", UpsertCustomerEquipmentFaultAsync)
             .WithTags("设备证据链")
             .RequireAuthorization();
        group.MapGet("/shortage-kitting/latest", GetLatestShortageKittingAsync)
             .WithTags("缺料齐套")
             .RequireAuthorization();
        group.MapPost("/shortage-kitting", UpsertShortageKittingAsync)
             .WithTags("缺料齐套")
             .RequireAuthorization();
        group.MapGet("/shortage-risk-resolution/latest", GetLatestShortageRiskResolutionAsync)
             .WithTags("缺料齐套")
             .RequireAuthorization();
        group.MapPost("/shortage-risk-resolution", UpsertShortageRiskResolutionAsync)
             .WithTags("缺料齐套")
             .RequireAuthorization();
        group.MapGet("/bom-kitting-package/latest", GetLatestBomKittingPackageAsync)
             .WithTags("缺料齐套")
             .RequireAuthorization();
        group.MapPost("/bom-kitting-package", UpsertBomKittingPackageAsync)
             .WithTags("缺料齐套")
             .RequireAuthorization();
        group.MapGet("/supply-risk-escalation/latest", GetLatestSupplyRiskEscalationAsync)
             .WithTags("供应风险")
             .RequireAuthorization();
        group.MapPost("/supply-risk-escalation", UpsertSupplyRiskEscalationAsync)
             .WithTags("供应风险")
             .RequireAuthorization();
        group.MapGet("/supplier-network-decision/latest", GetLatestSupplierNetworkDecisionAsync)
             .WithTags("供应风险")
             .RequireAuthorization();
        group.MapPost("/supplier-network-decision", UpsertSupplierNetworkDecisionAsync)
             .WithTags("供应风险")
             .RequireAuthorization();
        group.MapGet("/outsourcing-commitments", QueryOutsourcingCommitmentsAsync)
             .WithTags("外协承诺")
             .RequireAuthorization();
        group.MapGet("/outsourcing-commitments/latest", GetLatestOutsourcingCommitmentAsync)
             .WithTags("外协承诺")
             .RequireAuthorization();
        group.MapPost("/outsourcing-commitments", UpsertOutsourcingCommitmentAsync)
             .WithTags("外协承诺")
             .RequireAuthorization();
        group.MapGet("/quality-rework-impact/latest", GetLatestQualityReworkImpactAsync)
             .WithTags("质量证据链")
             .RequireAuthorization();
        group.MapPost("/quality-rework-impact", UpsertQualityReworkImpactAsync)
             .WithTags("质量证据链")
             .RequireAuthorization();
        group.MapGet("/quality-mrb-disposition/latest", GetLatestQualityMrbDispositionAsync)
             .WithTags("质量证据链")
             .RequireAuthorization();
        group.MapPost("/quality-mrb-disposition", UpsertQualityMrbDispositionAsync)
             .WithTags("质量证据链")
             .RequireAuthorization();
        group.MapGet("/alternate-material-approval/latest", GetLatestAlternateMaterialApprovalAsync)
             .WithTags("工程约束")
             .RequireAuthorization();
        group.MapPost("/alternate-material-approval", UpsertAlternateMaterialApprovalAsync)
             .WithTags("工程约束")
             .RequireAuthorization();
        group.MapGet("/engineering-change-impact/latest", GetLatestEngineeringChangeImpactAsync)
             .WithTags("工程约束")
             .RequireAuthorization();
        group.MapPost("/engineering-change-impact", UpsertEngineeringChangeImpactAsync)
             .WithTags("工程约束")
             .RequireAuthorization();
        group.MapGet("/route-capability-validation/latest", GetLatestRouteCapabilityValidationAsync)
             .WithTags("工程约束")
             .RequireAuthorization();
        group.MapPost("/route-capability-validation", UpsertRouteCapabilityValidationAsync)
             .WithTags("工程约束")
             .RequireAuthorization();
        group.MapGet("/production-anomaly-event/latest", GetLatestProductionAnomalyEventAsync)
             .WithTags("异常风险")
             .RequireAuthorization();
        group.MapPost("/production-anomaly-event", UpsertProductionAnomalyEventAsync)
             .WithTags("异常风险")
             .RequireAuthorization();
        group.MapGet("/anomaly-dispatch-records", QueryAnomalyDispatchRecordsAsync)
             .WithTags("异常风险")
             .RequireAuthorization();
        group.MapPost("/anomaly-dispatch-records", UpsertAnomalyDispatchRecordAsync)
             .WithTags("异常风险")
             .RequireAuthorization();
        group.MapGet("/monitoring-situation-escalations", QueryMonitoringSituationEscalationsAsync)
             .WithTags("异常风险")
             .RequireAuthorization();
        group.MapPost("/monitoring-situation-escalations", UpsertMonitoringSituationEscalationAsync)
             .WithTags("异常风险")
             .RequireAuthorization();
        group.MapGet("/risk-sla-review/latest", GetLatestRiskSlaReviewAsync)
             .WithTags("异常风险")
             .RequireAuthorization();
        group.MapPost("/risk-sla-review", UpsertRiskSlaReviewAsync)
             .WithTags("异常风险")
             .RequireAuthorization();
        group.MapGet("/risk-action-traces", QueryRiskActionTracesAsync)
             .WithTags("异常风险")
             .RequireAuthorization();
        group.MapPost("/risk-action-traces", UpsertRiskActionTraceAsync)
             .WithTags("异常风险")
             .RequireAuthorization();
        group.MapGet("/assistant-action-audits", QueryAssistantActionAuditsAsync)
             .WithTags("助手证据链")
             .RequireAuthorization();
        group.MapPost("/assistant-action-audits", UpsertAssistantActionAuditAsync)
             .WithTags("助手证据链")
             .RequireAuthorization();
        group.MapGet("/assistant-recovery-packages", QueryAssistantRecoveryPackagesAsync)
             .WithTags("助手证据链")
             .RequireAuthorization();
        group.MapPost("/assistant-recovery-packages", UpsertAssistantRecoveryPackageAsync)
             .WithTags("助手证据链")
             .RequireAuthorization();
        group.MapGet("/assistant-anomaly-packages", QueryAssistantAnomalyPackagesAsync)
             .WithTags("助手证据链")
             .RequireAuthorization();
        group.MapPost("/assistant-anomaly-packages", UpsertAssistantAnomalyPackageAsync)
             .WithTags("助手证据链")
             .RequireAuthorization();
        group.MapGet("/assistant-engineering-constraint-packages", QueryAssistantEngineeringConstraintPackagesAsync)
             .WithTags("助手证据链")
             .RequireAuthorization();
        group.MapPost("/assistant-engineering-constraint-packages", UpsertAssistantEngineeringConstraintPackageAsync)
             .WithTags("助手证据链")
             .RequireAuthorization();
        group.MapGet("/customer-order-import/latest", GetLatestCustomerOrderImportAsync)
             .WithTags("POC证据链")
             .RequireAuthorization();
        group.MapPost("/customer-order-import", UpsertCustomerOrderImportAsync)
             .WithTags("POC证据链")
             .RequireAuthorization();
        group.MapGet("/poc-review-signoff/latest", GetLatestPocReviewSignoffAsync)
             .WithTags("POC证据链")
             .RequireAuthorization();
        group.MapPost("/poc-review-signoff", UpsertPocReviewSignoffAsync)
             .WithTags("POC证据链")
             .RequireAuthorization();
        group.MapGet("/poc-rollout-package/latest", GetLatestPocRolloutPackageAsync)
             .WithTags("POC证据链")
             .RequireAuthorization();
        group.MapPost("/poc-rollout-package", UpsertPocRolloutPackageAsync)
             .WithTags("POC证据链")
             .RequireAuthorization();
        group.MapGet("/poc-pilot-run/latest", GetLatestPocPilotRunAsync)
             .WithTags("POC证据链")
             .RequireAuthorization();
        group.MapPost("/poc-pilot-run", UpsertPocPilotRunAsync)
             .WithTags("POC证据链")
             .RequireAuthorization();
        group.MapGet("/poc-hypercare-acceptance/latest", GetLatestPocHypercareAcceptanceAsync)
             .WithTags("POC证据链")
             .RequireAuthorization();
        group.MapPost("/poc-hypercare-acceptance", UpsertPocHypercareAcceptanceAsync)
             .WithTags("POC证据链")
             .RequireAuthorization();
        group.MapGet("/knowledge-governance-reviews", QueryKnowledgeGovernanceReviewsAsync)
             .WithTags("知识治理")
             .RequireAuthorization();
        group.MapPost("/knowledge-governance-reviews", UpsertKnowledgeGovernanceReviewAsync)
             .WithTags("知识治理")
             .RequireAuthorization();
        group.MapGet("/labor-reassignments", QueryLaborReassignmentsAsync)
             .WithTags("执行证据链")
             .RequireAuthorization();
        group.MapPost("/labor-reassignments", UpsertLaborReassignmentAsync)
             .WithTags("执行证据链")
             .RequireAuthorization();
        group.MapGet("/labor-qualification-blocks", QueryLaborQualificationBlocksAsync)
             .WithTags("执行证据链")
             .RequireAuthorization();
        group.MapPost("/labor-qualification-blocks", UpsertLaborQualificationBlockAsync)
             .WithTags("执行证据链")
             .RequireAuthorization();
        group.MapGet("/barcode-scan-evidence", QueryBarcodeScanEvidenceAsync)
             .WithTags("执行证据链")
             .RequireAuthorization();
        group.MapPost("/barcode-scan-evidence", UpsertBarcodeScanEvidenceAsync)
             .WithTags("执行证据链")
             .RequireAuthorization();
        group.MapGet("/quality-capa-closure/latest", GetLatestQualityCapaClosureAsync)
             .WithTags("执行证据链")
             .RequireAuthorization();
        group.MapPost("/quality-capa-closure", UpsertQualityCapaClosureAsync)
             .WithTags("执行证据链")
             .RequireAuthorization();
        group.MapGet("/agent-config-approvals", QueryAgentConfigApprovalsAsync)
             .WithTags("系统治理")
             .RequireAuthorization();
        group.MapPost("/agent-config-approvals", UpsertAgentConfigApprovalAsync)
             .WithTags("系统治理")
             .RequireAuthorization();
        group.MapGet("/otd-kpi-commitments", QueryOtdKpiCommitmentsAsync)
             .WithTags("报表证据链")
             .RequireAuthorization();
        group.MapGet("/otd-kpi-commitments/latest", GetLatestOtdKpiCommitmentAsync)
             .WithTags("报表证据链")
             .RequireAuthorization();
        group.MapPost("/otd-kpi-commitments", UpsertOtdKpiCommitmentAsync)
             .WithTags("报表证据链")
             .RequireAuthorization();
        group.MapGet("/quality-knowledge-evidence", QueryQualityKnowledgeEvidenceAsync)
             .WithTags("知识治理")
             .RequireAuthorization();
        group.MapPost("/quality-knowledge-evidence", UpsertQualityKnowledgeEvidenceAsync)
             .WithTags("知识治理")
             .RequireAuthorization();
        group.MapPost("/agent/recommend", RecommendAgentDecisionAsync)
             .WithTags("调度员Agent")
             .RequireAuthorization()
             .AddEndpointFilter(Audit);
        group.MapGet("/agent/decisions", QueryAgentDecisionsAsync)
             .WithTags("调度员Agent")
             .RequireAuthorization();
        group.MapGet("/agent/{decisionId}", GetAgentDecisionAsync)
             .WithTags("调度员Agent")
             .RequireAuthorization();
        group.MapPost("/agent/{decisionId}/adopt", AdoptAgentDecisionAsync)
             .WithTags("调度员Agent")
             .RequireAuthorization();
        group.MapPost("/agent/{decisionId}/reject", RejectAgentDecisionAsync)
             .WithTags("调度员Agent")
             .RequireAuthorization();
        group.MapPost("/agent/{decisionId}/execute-quality-disposition", ExecuteQualityDispositionAsync)
             .WithTags("调度员Agent")
             .RequireAuthorization();
        group.MapPost("/agent/{decisionId}/execute-purchase-action", ExecutePurchaseActionAsync)
             .WithTags("调度员Agent")
             .RequireAuthorization();
        group.MapPost("/agent/{decisionId}/execute-maintenance-action", ExecuteMaintenanceActionAsync)
             .WithTags("调度员Agent")
             .RequireAuthorization();
        return group;
    }

    private static async Task<IResult> OptimizeScheduleAsync(
        OptimizeScheduleRequest request,
        ISchedulingAppService schedulingService,
        CancellationToken ct)
    {
        var result = await schedulingService.OptimizeScheduleAsync(request, ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> RuleBasedScheduleAsync(
        RuleBasedScheduleRequest request,
        IWorkOrderRepository workOrderRepo,
        IEquipmentRepository equipmentRepo,
        IMaterialRepository materialRepo,
        IScheduleRepository scheduleRepo,
        ISchedulingRuleEngine ruleEngine,
        CancellationToken ct)
    {
        // 1. 加载待排产工单
        var workOrders = request.WorkOrderIds is { Count: > 0 }
            ? await LoadWorkOrdersByIds(workOrderRepo, request.WorkOrderIds, ct)
            : await workOrderRepo.GetAllAsync(WorkOrderStatus.Created, ct);

        // 2. 加载设备
        var equipment = await equipmentRepo.GetAllAsync(ct);
        var equipCapacity = equipment.Select(e => new EquipmentCapacity
        {
            Id = e.Id,
            EquipmentCode = e.EquipmentCode,
            Capacity = e.Capacity,
            Type = e.EquipmentType,
        }).ToList();

        // 3. 构建交期字典
        var deadlines = workOrders.ToDictionary(w => w.Id, w => w.PlannedEndDate);

        // 4. 构建 ScheduleRequest
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
                RouteCode = w.RouteCode ?? "",
            }).ToList(),
            Equipment = equipCapacity,
            Deadlines = deadlines,
        };

        // 5. 构建 SchedulingContextSnapshot
        var context = new SchedulingContextSnapshot
        {
            WorkshopId = request.WorkshopId,
            SnapshotTime = DateTime.UtcNow,
            EquipmentCapacities = equipment.Select(e => new EquipmentCapacitySummary(
                e.Id, e.EquipmentCode, e.EquipmentName, e.EquipmentType,
                e.Status.ToString(), e.Capacity, 0)
            {
                TheoreticalCapacity = e.Capacity,
                ActualCapacity = e.Capacity,
            }).ToList(),
        };

        // 6. 解析优先级规则和容量策略
        var priorityRule = request.PriorityRule switch
        {
            "SPT" => PriorityRule.SPT,
            "CR" => PriorityRule.CR,
            "FCFS" => PriorityRule.FCFS,
            "WeightedComposite" => PriorityRule.WeightedComposite,
            _ => PriorityRule.EDD
        };

        var capacityStrategy = request.CapacityStrategy switch
        {
            "EarliestAvailable" => CapacitySelectionStrategy.EarliestAvailable,
            "MostSuitable" => CapacitySelectionStrategy.MostSuitable,
            "LeastChangeoverCost" => CapacitySelectionStrategy.LeastChangeoverCost,
            _ => CapacitySelectionStrategy.LeastLoaded
        };

        // 7. 执行规则引擎
        var engineResult = await ruleEngine.GenerateInitialScheduleAsync(
            scheduleRequest, context, priorityRule, capacityStrategy, ct);

        // 8. 保存排产计划
        var plan = SchedulePlan.Create(
            $"规则排产-{priorityRule}-{DateTime.UtcNow:yyyyMMddHHmmss}",
            DateTime.UtcNow,
            DateTime.UtcNow.AddDays(7));

        plan.UpdateMetrics(engineResult.UtilizationRate, engineResult.OnTimeDeliveryRate,
            $"规则引擎: {priorityRule} + {capacityStrategy} | {engineResult.BottleneckInfo}");

        plan.AddItems(engineResult.Assignments.Select((a, i) =>
            ScheduleItem.Create(a.WorkOrderId, a.EquipmentId, a.StartTime, a.EndTime,
                i + 1, setupTime: $"{a.SetupMinutes:F0}min", dependentItems: a.Dependencies)));

        var saved = await scheduleRepo.CreateAsync(plan, ct);

        // 9. 返回结果
        var planDto = MapToPlanDto(saved);
        return TypedResults.Ok(new SchedulingResultDto
        {
            Plan = planDto,
            Assignments = engineResult.Assignments.Select(a => new ScheduleAssignmentDto
            {
                WorkOrderId = a.WorkOrderId,
                EquipmentId = a.EquipmentId,
                StartTime = a.StartTime,
                EndTime = a.EndTime,
                Dependencies = a.Dependencies,
            }).ToList(),
            EstimatedCompletionRate = engineResult.OnTimeDeliveryRate,
            UtilizationRate = engineResult.UtilizationRate,
            OptimizationReason = engineResult.BottleneckInfo,
            Warnings = engineResult.Validation.Violations
                .Where(v => v.Level == ConstraintViolationLevel.Warning)
                .Select(v => v.Message).ToList(),
        });
    }

    private static async Task<IResult> GetCurrentPlanAsync(
        ISchedulingAppService schedulingService,
        CancellationToken ct)
    {
        var plan = await schedulingService.GetCurrentPlanAsync(ct);
        if (plan is null)
            return TypedResults.NotFound(new { message = "未找到当前排产计划" });
        return TypedResults.Ok(plan);
    }

    private static async Task<IResult> GetAllPlansAsync(
        ISchedulingAppService schedulingService,
        CancellationToken ct)
    {
        var plans = await schedulingService.GetAllPlansAsync(ct);
        return TypedResults.Ok(plans);
    }

    private static async Task<IResult> GetPlanByIdAsync(
        string id,
        ISchedulingAppService schedulingService,
        CancellationToken ct)
    {
        var plan = await schedulingService.GetPlanByIdAsync(id, ct);
        if (plan is null)
            return TypedResults.NotFound(new { message = $"排产计划 {id} 不存在" });
        return TypedResults.Ok(plan);
    }

    private static async Task<IResult> RescheduleItemAsync(
        string planId,
        string itemId,
        RescheduleItemRequest request,
        IScheduleRepository scheduleRepo,
        CancellationToken ct)
    {
        var plan = await scheduleRepo.GetByIdAsync(planId, ct);
        if (plan is null)
            return TypedResults.NotFound(new { message = $"排产计划 {planId} 不存在" });

        if (!plan.IsEditable)
            return TypedResults.BadRequest(new { message = "当前计划状态不允许调整" });

        var item = plan.Items.FirstOrDefault(i => i.Id == itemId);
        if (item is null)
            return TypedResults.NotFound(new { message = $"排产项 {itemId} 不存在" });

        item.Reschedule(request.PlannedStartTime, request.PlannedEndTime);

        await scheduleRepo.UpdateAsync(plan, ct);

        return TypedResults.Ok(new
        {
            planId,
            itemId,
            request.PlannedStartTime,
            request.PlannedEndTime,
        });
    }

    private static async Task<IResult> CreateWorkOrderAsync(
        CreateWorkOrderRequest request,
        ISchedulingAppService schedulingService,
        CancellationToken ct)
    {
        var workOrder = await schedulingService.CreateWorkOrderAsync(request, ct);
        return TypedResults.Created($"/api/v1/scheduling/workorders/{workOrder.Id}", workOrder);
    }

    private static async Task<IResult> GetWorkOrdersAsync(
        string? status,
        string? workshopId,
        string? productCode,
        DateTime? startDate,
        DateTime? endDate,
        ISchedulingAppService schedulingService,
        CancellationToken ct,
        int page = 1,
        int pageSize = 20)
    {
        var parameters = new WorkOrderQueryParameters
        {
            Status = status,
            WorkshopId = workshopId,
            ProductCode = productCode,
            StartDate = startDate,
            EndDate = endDate,
            Page = page,
            PageSize = pageSize
        };
        var result = await schedulingService.GetWorkOrdersAsync(parameters, ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> GetWorkOrderByIdAsync(
        string id,
        ISchedulingAppService schedulingService,
        CancellationToken ct)
    {
        var workOrder = await schedulingService.GetWorkOrderByIdAsync(id, ct);
        if (workOrder is null)
            return TypedResults.NotFound(new { message = $"工单 {id} 不存在" });
        return TypedResults.Ok(workOrder);
    }

    private static async Task<IResult> UpdateWorkOrderStatusAsync(
        string id,
        UpdateStatusRequest request,
        ISchedulingAppService schedulingService,
        CancellationToken ct)
    {
        var workOrder = await schedulingService.UpdateWorkOrderStatusAsync(id, request.Status, ct);
        return TypedResults.Ok(workOrder);
    }

    private static async Task<IResult> DeleteWorkOrderAsync(
        string id,
        ISchedulingAppService schedulingService,
        CancellationToken ct)
    {
        var workOrder = await schedulingService.GetWorkOrderByIdAsync(id, ct);
        if (workOrder is null)
            return TypedResults.NotFound();

        await schedulingService.DeleteWorkOrderAsync(id, ct);
        return TypedResults.NoContent();
    }

    private static async Task<IResult> BatchOptimizeAsync(
        BatchOptimizeRequest request,
        ISchedulingAppService schedulingService,
        CancellationToken ct)
    {
        var result = await schedulingService.BatchOptimizeAsync(request, ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> SubmitAdoptionFeedbackAsync(
        AdoptionFeedbackRequest request,
        HttpContext httpContext,
        ISchedulingAppService schedulingService,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.SchedulePlanId))
            return TypedResults.BadRequest(new { message = "排产计划ID不能为空" });
        if (string.IsNullOrWhiteSpace(request.WorkshopId))
            return TypedResults.BadRequest(new { message = "车间ID不能为空" });
        if (string.IsNullOrWhiteSpace(request.ReasonCategory))
            return TypedResults.BadRequest(new { message = "修改原因分类不能为空" });

        var operatorUser = httpContext.User.Identity?.Name ?? "unknown";
        await schedulingService.RecordAdoptionFeedbackAsync(request, operatorUser, ct);
        return TypedResults.Created();
    }

    private static async Task<IResult> GetLatestAdoptionFeedbackAsync(
        ISchedulingAppService schedulingService,
        CancellationToken ct)
    {
        var result = await schedulingService.GetLatestAdoptionFeedbackAsync(ct);
        return result is null ? TypedResults.NotFound() : TypedResults.Ok(result);
    }

    private static async Task<IResult> QueryOtdEvidenceAsync(
        int take,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.QueryOtdEvidenceAsync(take <= 0 ? 24 : take, ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> UpsertOtdEvidenceAsync(
        OtdEvidenceChainItemDto item,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.UpsertOtdEvidenceAsync(item, GetActor(httpContext), ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> GetLatestEquipmentDowntimeAsync(
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.GetLatestEquipmentDowntimeAsync(ct);
        return result is null ? TypedResults.NotFound() : TypedResults.Ok(result);
    }

    private static async Task<IResult> UpsertEquipmentDowntimeAsync(
        EquipmentDowntimeEventDto item,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.UpsertEquipmentDowntimeAsync(item, GetActor(httpContext), ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> GetLatestCustomerEquipmentFaultAsync(
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.GetLatestCustomerEquipmentFaultAsync(ct);
        return result is null ? TypedResults.NotFound() : TypedResults.Ok(result);
    }

    private static async Task<IResult> UpsertCustomerEquipmentFaultAsync(
        CustomerEquipmentFaultEvidenceDto item,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.UpsertCustomerEquipmentFaultAsync(item, GetActor(httpContext), ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> GetLatestShortageKittingAsync(
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.GetLatestShortageKittingAsync(ct);
        return result is null ? TypedResults.NotFound() : TypedResults.Ok(result);
    }

    private static async Task<IResult> UpsertShortageKittingAsync(
        ShortageKittingEventDto item,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.UpsertShortageKittingAsync(item, GetActor(httpContext), ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> GetLatestShortageRiskResolutionAsync(
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.GetLatestShortageRiskResolutionAsync(ct);
        return result is null ? TypedResults.NotFound() : TypedResults.Ok(result);
    }

    private static async Task<IResult> UpsertShortageRiskResolutionAsync(
        ShortageRiskResolutionDto item,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.UpsertShortageRiskResolutionAsync(item, GetActor(httpContext), ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> GetLatestBomKittingPackageAsync(
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.GetLatestBomKittingPackageAsync(ct);
        return result is null ? TypedResults.NotFound() : TypedResults.Ok(result);
    }

    private static async Task<IResult> UpsertBomKittingPackageAsync(
        BomKittingPackageDto item,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.UpsertBomKittingPackageAsync(item, GetActor(httpContext), ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> GetLatestSupplyRiskEscalationAsync(
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.GetLatestSupplyRiskEscalationAsync(ct);
        return result is null ? TypedResults.NotFound() : TypedResults.Ok(result);
    }

    private static async Task<IResult> UpsertSupplyRiskEscalationAsync(
        SupplyRiskEscalationDto item,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.UpsertSupplyRiskEscalationAsync(item, GetActor(httpContext), ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> GetLatestSupplierNetworkDecisionAsync(
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.GetLatestSupplierNetworkDecisionAsync(ct);
        return result is null ? TypedResults.NotFound() : TypedResults.Ok(result);
    }

    private static async Task<IResult> UpsertSupplierNetworkDecisionAsync(
        SupplierNetworkDecisionDto item,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.UpsertSupplierNetworkDecisionAsync(item, GetActor(httpContext), ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> QueryOutsourcingCommitmentsAsync(
        int take,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.QueryOutsourcingCommitmentsAsync(take <= 0 ? 8 : take, ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> GetLatestOutsourcingCommitmentAsync(
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.GetLatestOutsourcingCommitmentAsync(ct);
        return result is null ? TypedResults.NotFound() : TypedResults.Ok(result);
    }

    private static async Task<IResult> UpsertOutsourcingCommitmentAsync(
        OutsourcingCommitmentPackageDto item,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.UpsertOutsourcingCommitmentAsync(item, GetActor(httpContext), ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> GetLatestQualityReworkImpactAsync(
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.GetLatestQualityReworkImpactAsync(ct);
        return result is null ? TypedResults.NotFound() : TypedResults.Ok(result);
    }

    private static async Task<IResult> UpsertQualityReworkImpactAsync(
        QualityReworkImpactDto item,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.UpsertQualityReworkImpactAsync(item, GetActor(httpContext), ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> GetLatestQualityMrbDispositionAsync(
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.GetLatestQualityMrbDispositionAsync(ct);
        return result is null ? TypedResults.NotFound() : TypedResults.Ok(result);
    }

    private static async Task<IResult> UpsertQualityMrbDispositionAsync(
        QualityMrbDispositionRecordDto item,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.UpsertQualityMrbDispositionAsync(item, GetActor(httpContext), ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> GetLatestAlternateMaterialApprovalAsync(
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.GetLatestAlternateMaterialApprovalAsync(ct);
        return result is null ? TypedResults.NotFound() : TypedResults.Ok(result);
    }

    private static async Task<IResult> UpsertAlternateMaterialApprovalAsync(
        AlternateMaterialApprovalDto item,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.UpsertAlternateMaterialApprovalAsync(item, GetActor(httpContext), ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> GetLatestEngineeringChangeImpactAsync(
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.GetLatestEngineeringChangeImpactAsync(ct);
        return result is null ? TypedResults.NotFound() : TypedResults.Ok(result);
    }

    private static async Task<IResult> UpsertEngineeringChangeImpactAsync(
        EngineeringChangeImpactAnalysisDto item,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.UpsertEngineeringChangeImpactAsync(item, GetActor(httpContext), ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> GetLatestRouteCapabilityValidationAsync(
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.GetLatestRouteCapabilityValidationAsync(ct);
        return result is null ? TypedResults.NotFound() : TypedResults.Ok(result);
    }

    private static async Task<IResult> UpsertRouteCapabilityValidationAsync(
        RouteCapabilityValidationDto item,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.UpsertRouteCapabilityValidationAsync(item, GetActor(httpContext), ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> GetLatestProductionAnomalyEventAsync(
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.GetLatestProductionAnomalyEventAsync(ct);
        return result is null ? TypedResults.NotFound() : TypedResults.Ok(result);
    }

    private static async Task<IResult> UpsertProductionAnomalyEventAsync(
        ProductionAnomalyEventDto item,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.UpsertProductionAnomalyEventAsync(item, GetActor(httpContext), ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> QueryAnomalyDispatchRecordsAsync(
        int take,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.QueryAnomalyDispatchRecordsAsync(take <= 0 ? 12 : take, ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> UpsertAnomalyDispatchRecordAsync(
        AnomalyDispatchRecordDto item,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.UpsertAnomalyDispatchRecordAsync(item, GetActor(httpContext), ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> QueryMonitoringSituationEscalationsAsync(
        int take,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.QueryMonitoringSituationEscalationsAsync(take <= 0 ? 8 : take, ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> UpsertMonitoringSituationEscalationAsync(
        MonitoringSituationEscalationDto item,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.UpsertMonitoringSituationEscalationAsync(item, GetActor(httpContext), ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> GetLatestRiskSlaReviewAsync(
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.GetLatestRiskSlaReviewAsync(ct);
        return result is null ? TypedResults.NotFound() : TypedResults.Ok(result);
    }

    private static async Task<IResult> UpsertRiskSlaReviewAsync(
        RiskSlaReviewRecordDto item,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.UpsertRiskSlaReviewAsync(item, GetActor(httpContext), ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> QueryRiskActionTracesAsync(
        int take,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.QueryRiskActionTracesAsync(take <= 0 ? 12 : take, ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> UpsertRiskActionTraceAsync(
        RiskActionTraceDto item,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.UpsertRiskActionTraceAsync(item, GetActor(httpContext), ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> QueryAssistantActionAuditsAsync(
        int take,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.QueryAssistantActionAuditsAsync(take <= 0 ? 12 : take, ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> UpsertAssistantActionAuditAsync(
        AssistantActionAuditRecordDto item,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.UpsertAssistantActionAuditAsync(item, GetActor(httpContext), ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> QueryAssistantRecoveryPackagesAsync(
        int take,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.QueryAssistantRecoveryPackagesAsync(take <= 0 ? 8 : take, ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> UpsertAssistantRecoveryPackageAsync(
        AssistantRecoveryPackageDto item,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.UpsertAssistantRecoveryPackageAsync(item, GetActor(httpContext), ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> QueryAssistantAnomalyPackagesAsync(
        int take,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.QueryAssistantAnomalyPackagesAsync(take <= 0 ? 8 : take, ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> UpsertAssistantAnomalyPackageAsync(
        AssistantAnomalyDispositionPackageDto item,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.UpsertAssistantAnomalyPackageAsync(item, GetActor(httpContext), ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> QueryAssistantEngineeringConstraintPackagesAsync(
        int take,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.QueryAssistantEngineeringConstraintPackagesAsync(take <= 0 ? 8 : take, ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> UpsertAssistantEngineeringConstraintPackageAsync(
        AssistantEngineeringConstraintPackageDto item,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.UpsertAssistantEngineeringConstraintPackageAsync(item, GetActor(httpContext), ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> GetLatestCustomerOrderImportAsync(
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.GetLatestCustomerOrderImportAsync(ct);
        return result is null ? TypedResults.NotFound() : TypedResults.Ok(result);
    }

    private static async Task<IResult> UpsertCustomerOrderImportAsync(
        CustomerOrderImportEvidenceDto item,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.UpsertCustomerOrderImportAsync(item, GetActor(httpContext), ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> GetLatestPocReviewSignoffAsync(
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.GetLatestPocReviewSignoffAsync(ct);
        return result is null ? TypedResults.NotFound() : TypedResults.Ok(result);
    }

    private static async Task<IResult> UpsertPocReviewSignoffAsync(
        PocReviewSignoffRecordDto item,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.UpsertPocReviewSignoffAsync(item, GetActor(httpContext), ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> GetLatestPocRolloutPackageAsync(
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.GetLatestPocRolloutPackageAsync(ct);
        return result is null ? TypedResults.NotFound() : TypedResults.Ok(result);
    }

    private static async Task<IResult> UpsertPocRolloutPackageAsync(
        PocRolloutPackageDto item,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.UpsertPocRolloutPackageAsync(item, GetActor(httpContext), ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> GetLatestPocPilotRunAsync(
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.GetLatestPocPilotRunAsync(ct);
        return result is null ? TypedResults.NotFound() : TypedResults.Ok(result);
    }

    private static async Task<IResult> UpsertPocPilotRunAsync(
        PocPilotRunRecordDto item,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.UpsertPocPilotRunAsync(item, GetActor(httpContext), ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> GetLatestPocHypercareAcceptanceAsync(
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.GetLatestPocHypercareAcceptanceAsync(ct);
        return result is null ? TypedResults.NotFound() : TypedResults.Ok(result);
    }

    private static async Task<IResult> UpsertPocHypercareAcceptanceAsync(
        PocHypercareAcceptanceDto item,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.UpsertPocHypercareAcceptanceAsync(item, GetActor(httpContext), ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> QueryKnowledgeGovernanceReviewsAsync(
        int take,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.QueryKnowledgeGovernanceReviewsAsync(take <= 0 ? 12 : take, ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> UpsertKnowledgeGovernanceReviewAsync(
        KnowledgeGovernanceReviewRecordDto item,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.UpsertKnowledgeGovernanceReviewAsync(item, GetActor(httpContext), ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> QueryLaborReassignmentsAsync(
        int take,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.QueryLaborReassignmentsAsync(take <= 0 ? 12 : take, ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> UpsertLaborReassignmentAsync(
        LaborReassignmentRecordDto item,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.UpsertLaborReassignmentAsync(item, GetActor(httpContext), ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> QueryLaborQualificationBlocksAsync(
        int take,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.QueryLaborQualificationBlocksAsync(take <= 0 ? 12 : take, ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> UpsertLaborQualificationBlockAsync(
        LaborQualificationBlockRecordDto item,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.UpsertLaborQualificationBlockAsync(item, GetActor(httpContext), ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> QueryBarcodeScanEvidenceAsync(
        int take,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.QueryBarcodeScanEvidenceAsync(take <= 0 ? 20 : take, ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> UpsertBarcodeScanEvidenceAsync(
        BarcodeScanEvidenceRecordDto item,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.UpsertBarcodeScanEvidenceAsync(item, GetActor(httpContext), ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> GetLatestQualityCapaClosureAsync(
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.GetLatestQualityCapaClosureAsync(ct);
        return result is null ? TypedResults.NotFound() : TypedResults.Ok(result);
    }

    private static async Task<IResult> UpsertQualityCapaClosureAsync(
        QualityCapaClosureDto item,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.UpsertQualityCapaClosureAsync(item, GetActor(httpContext), ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> QueryAgentConfigApprovalsAsync(
        int take,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.QueryAgentConfigApprovalsAsync(take <= 0 ? 12 : take, ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> UpsertAgentConfigApprovalAsync(
        AgentConfigApprovalRecordDto item,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.UpsertAgentConfigApprovalAsync(item, GetActor(httpContext), ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> QueryOtdKpiCommitmentsAsync(
        int take,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.QueryOtdKpiCommitmentsAsync(take <= 0 ? 8 : take, ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> GetLatestOtdKpiCommitmentAsync(
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.GetLatestOtdKpiCommitmentAsync(ct);
        return result is null ? TypedResults.NotFound() : TypedResults.Ok(result);
    }

    private static async Task<IResult> UpsertOtdKpiCommitmentAsync(
        OtdKpiCommitmentPackageDto item,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.UpsertOtdKpiCommitmentAsync(item, GetActor(httpContext), ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> QueryQualityKnowledgeEvidenceAsync(
        string? evidenceType,
        int take,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.QueryQualityKnowledgeEvidenceAsync(evidenceType, take <= 0 ? 20 : take, ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> UpsertQualityKnowledgeEvidenceAsync(
        QualityKnowledgeEvidenceRecordDto item,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.UpsertQualityKnowledgeEvidenceAsync(item, GetActor(httpContext), ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> RecommendAgentDecisionAsync(
        AgentRecommendRequest request,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        try
        {
            var actor = GetActor(httpContext);
            var result = await agentService.RecommendAsync(request, actor, ct);
            return TypedResults.Created($"/api/v1/scheduling/agent/{result.Id}", result);
        }
        catch (InvalidOperationException ex)
        {
            return TypedResults.BadRequest(new { message = ex.Message });
        }
    }

    private static async Task<IResult> QueryAgentDecisionsAsync(
        int take,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.QueryRecentAsync(take <= 0 ? 20 : take, ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> GetAgentDecisionAsync(
        string decisionId,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var result = await agentService.GetDecisionAsync(decisionId, ct);
        return result is null
            ? TypedResults.NotFound(new { message = $"Agent 决策 {decisionId} 不存在" })
            : TypedResults.Ok(result);
    }

    private static async Task<IResult> AdoptAgentDecisionAsync(
        string decisionId,
        AgentDecisionActionRequest request,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var actor = GetActor(httpContext);
        var role = GetPrimaryRole(httpContext);
        if (!AgentPermissionPolicy.CanExecute(role, AgentActionType.AdoptScheduling))
        {
            await agentService.RecordPolicyRejectionAsync(
                AgentActionType.AdoptScheduling, decisionId, actor, role,
                AgentPermissionPolicy.GetDenialReason(AgentActionType.AdoptScheduling), ct);
            return TypedResults.Forbid();
        }

        try
        {
            var result = await agentService.AdoptAsync(decisionId, request.ScenarioId, request.Reason, actor, role, ct);
            return TypedResults.Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return TypedResults.BadRequest(new { message = ex.Message });
        }
    }

    private static async Task<IResult> RejectAgentDecisionAsync(
        string decisionId,
        AgentDecisionRejectRequest request,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var actor = GetActor(httpContext);
        var role = GetPrimaryRole(httpContext);
        if (!AgentPermissionPolicy.CanExecute(role, AgentActionType.RejectScheduling))
        {
            await agentService.RecordPolicyRejectionAsync(
                AgentActionType.RejectScheduling, decisionId, actor, role,
                AgentPermissionPolicy.GetDenialReason(AgentActionType.RejectScheduling), ct);
            return TypedResults.Forbid();
        }

        try
        {
            var result = await agentService.RejectAsync(decisionId, request.Reason, actor, role, ct);
            return TypedResults.Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return TypedResults.BadRequest(new { message = ex.Message });
        }
    }

    private static Task<IResult> ExecuteQualityDispositionAsync(
        string decisionId,
        AgentExecuteActionRequest request,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
        => ExecuteCrossDomainAsync(decisionId, AgentActionType.ExecuteQualityDisposition, request, httpContext, agentService, ct);

    private static Task<IResult> ExecutePurchaseActionAsync(
        string decisionId,
        AgentExecuteActionRequest request,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
        => ExecuteCrossDomainAsync(decisionId, AgentActionType.ExecutePurchaseAction, request, httpContext, agentService, ct);

    private static Task<IResult> ExecuteMaintenanceActionAsync(
        string decisionId,
        AgentExecuteActionRequest request,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
        => ExecuteCrossDomainAsync(decisionId, AgentActionType.ExecuteMaintenanceAction, request, httpContext, agentService, ct);

    private static async Task<IResult> ExecuteCrossDomainAsync(
        string decisionId,
        AgentActionType action,
        AgentExecuteActionRequest request,
        HttpContext httpContext,
        IScheduleAgentService agentService,
        CancellationToken ct)
    {
        var actor = GetActor(httpContext);
        var role = GetPrimaryRole(httpContext);
        if (!AgentPermissionPolicy.CanExecute(role, action))
        {
            await agentService.RecordPolicyRejectionAsync(
                action, decisionId, actor, role,
                AgentPermissionPolicy.GetDenialReason(action), ct);
            return TypedResults.Forbid();
        }

        try
        {
            var result = await agentService.ExecuteCrossDomainActionAsync(decisionId, action, request, actor, role, ct);
            return TypedResults.Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return TypedResults.BadRequest(new { message = ex.Message });
        }
    }

    private static string GetActor(HttpContext httpContext)
    {
        return httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? httpContext.User.Identity?.Name
            ?? "unknown";
    }

    private static string GetPrimaryRole(HttpContext httpContext)
    {
        return httpContext.User.FindFirstValue(ClaimTypes.Role) ?? "unknown";
    }

    private static async Task<List<Domain.Entities.Production.WorkOrder>> LoadWorkOrdersByIds(
        IWorkOrderRepository repo, List<string> ids, CancellationToken ct)
    {
        var result = new List<Domain.Entities.Production.WorkOrder>();
        foreach (var id in ids)
        {
            var wo = await repo.GetByIdAsync(id, ct);
            if (wo != null) result.Add(wo);
        }
        return result;
    }

    private static SchedulePlanDto MapToPlanDto(Domain.Entities.Scheduling.SchedulePlan p) => new()
    {
        Id = p.Id,
        PlanName = p.PlanName,
        PlanStartDate = p.PlanStartDate,
        PlanEndDate = p.PlanEndDate,
        OverallUtilizationRate = p.OverallUtilizationRate,
        OnTimeDeliveryRate = p.OnTimeDeliveryRate,
        OptimizationNotes = p.OptimizationNotes,
        CreatedAt = p.CreatedAt,
        Items = p.Items.Select(i => new ScheduleItemDto
        {
            Id = i.Id,
            WorkOrderId = i.WorkOrderId,
            EquipmentId = i.EquipmentId,
            PlannedStartTime = i.PlannedStartTime,
            PlannedEndTime = i.PlannedEndTime,
            Sequence = i.Sequence,
            SetupTime = i.SetupTime,
            DependentItems = i.DependentItems,
        }).ToList(),
    };
}
