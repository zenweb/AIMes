using System.Text.Json;
using FluentAssertions;
using MES.AI.Core.Models;
using MES.AI.Core.Scheduling;
using MES.Application.DTOs;
using MES.Application.Services;
using MES.Domain.Authorization;
using MES.Domain.Entities;
using MES.Domain.Entities.Agent;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Interfaces.Repositories;
using MES.Domain.Interfaces.Services;
using Moq;

namespace MES.Tests.Unit.Application;

public class ScheduleAgentServiceTests
{
    private readonly Mock<IWorkOrderRepository> _workOrderRepoMock = new();
    private readonly Mock<IEquipmentRepository> _equipmentRepoMock = new();
    private readonly Mock<ISchedulingContextProvider> _contextProviderMock = new();
    private readonly Mock<ISchedulingRuleEngine> _ruleEngineMock = new();
    private readonly Mock<IAgentDecisionRepository> _decisionRepoMock = new();
    private readonly Mock<IAuditLogRepository> _auditLogRepoMock = new();
    private readonly Mock<IScheduleRepository> _scheduleRepoMock = new();
    private readonly Mock<IPurchaseOrderRepository> _purchaseOrderRepoMock = new();
    private readonly Mock<IQualityInspectionRepository> _qualityInspectionRepoMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly ScheduleAgentService _sut;

    public ScheduleAgentServiceTests()
    {
        _unitOfWorkMock
            .Setup(u => u.ExecuteAsync(It.IsAny<Func<CancellationToken, Task>>(), It.IsAny<CancellationToken>()))
            .Returns<Func<CancellationToken, Task>, CancellationToken>((action, ct) => action(ct));

        _sut = new ScheduleAgentService(
            _workOrderRepoMock.Object,
            _equipmentRepoMock.Object,
            _contextProviderMock.Object,
            _ruleEngineMock.Object,
            _decisionRepoMock.Object,
            _auditLogRepoMock.Object,
            _scheduleRepoMock.Object,
            _purchaseOrderRepoMock.Object,
            _qualityInspectionRepoMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task RecordPolicyRejectionAsync_WhenDecisionIsMissing_ShouldPersistFallbackAuditWithDenialReason()
    {
        using var cts = new CancellationTokenSource();
        var ct = cts.Token;
        AgentActionResult? capturedAction = null;
        AuditLog? capturedAudit = null;
        var decisionId = "decision-missing-001";
        var expectedReason = AgentPermissionPolicy.GetDenialReason(AgentActionType.ExecutePurchaseAction);
        _decisionRepoMock.Setup(r => r.GetByIdAsync(decisionId, ct)).ReturnsAsync((AgentDecision?)null);
        _decisionRepoMock
            .Setup(r => r.AddActionResultAsync(It.IsAny<AgentActionResult>(), ct))
            .Callback<AgentActionResult, CancellationToken>((result, _) => capturedAction = result)
            .Returns(Task.CompletedTask);
        _auditLogRepoMock
            .Setup(r => r.AddAsync(It.IsAny<AuditLog>(), ct))
            .Callback<AuditLog, CancellationToken>((log, _) => capturedAudit = log)
            .Returns(Task.CompletedTask);

        await _sut.RecordPolicyRejectionAsync(
            AgentActionType.ExecutePurchaseAction,
            decisionId,
            "operator-001",
            Roles.Operator,
            reason: null,
            ct);

        capturedAction.Should().NotBeNull();
        capturedAction!.AgentDecisionId.Should().Be(decisionId);
        capturedAction.ActionType.Should().Be("ExecutePurchaseAction");
        capturedAction.ResultStatus.Should().Be("RejectedByPolicy");
        capturedAction.Actor.Should().Be("operator-001");
        capturedAction.Role.Should().Be(Roles.Operator);
        capturedAction.Reason.Should().Be(expectedReason);
        capturedAudit.Should().NotBeNull();
        capturedAudit!.Action.Should().Be("AgentPolicyRejected");
        capturedAudit.ResourceId.Should().Be(decisionId);
        capturedAudit.BusinessKey.Should().Be($"AgentDecision:{decisionId}");
        capturedAudit.NewValues.Should().Contain(expectedReason, "审计回放 payload 必须包含默认拒绝原因");
    }

    [Fact]
    public async Task QueryRecentAsync_ShouldRequestSchedulingDecisionsAndMapScenarios()
    {
        using var cts = new CancellationTokenSource();
        var ct = cts.Token;
        var decision = CreateDecision("decision-001");
        _decisionRepoMock
            .Setup(r => r.QueryRecentAsync("Scheduling", 5, ct))
            .ReturnsAsync([decision]);

        var result = await _sut.QueryRecentAsync(5, ct);

        result.Should().ContainSingle();
        result[0].Id.Should().Be(decision.Id);
        result[0].BusinessKey.Should().Be("Workshop:WS-001");
        result[0].Scenarios.Should().ContainSingle().Which.StrategyName.Should().Be("EDD");
        _decisionRepoMock.Verify(r => r.QueryRecentAsync("Scheduling", 5, ct), Times.Once);
    }

    [Fact]
    public async Task ExecuteCrossDomainActionAsync_WhenDecisionIsMissing_ShouldFailWithoutWritingAuditOrAction()
    {
        using var cts = new CancellationTokenSource();
        var ct = cts.Token;
        _decisionRepoMock.Setup(r => r.GetByIdAsync("missing-decision", ct)).ReturnsAsync((AgentDecision?)null);

        var act = async () => await _sut.ExecuteCrossDomainActionAsync(
            "missing-decision",
            AgentActionType.ExecuteMaintenanceAction,
            new AgentExecuteActionRequest { ActionName = "maintenance-window" },
            "maintainer-001",
            Roles.Maintenance,
            ct);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Agent decision missing-decision not found.");
        _auditLogRepoMock.Verify(r => r.AddAsync(It.IsAny<AuditLog>(), It.IsAny<CancellationToken>()), Times.Never);
        _decisionRepoMock.Verify(r => r.AddActionResultAsync(It.IsAny<AgentActionResult>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task RecommendAsync_ShouldPersistScheduleRequestEvidenceWithDecisionTimestamp()
    {
        using var cts = new CancellationTokenSource();
        var ct = cts.Token;
        AgentDecision? capturedDecision = null;
        AgentEvidenceLink? capturedEvidence = null;
        var now = new DateTime(2026, 5, 31, 8, 0, 0, DateTimeKind.Utc);
        var workOrder = WorkOrder.Create("WO-AGENT-001", "PROD-A1", "Product A", 10,
            now, now.AddDays(1), "WS-001", 5, "R-A100");
        var request = new AgentRecommendRequest
        {
            WorkshopId = "WS-001",
            BusinessKeyType = "Workshop",
            BusinessKeyValue = "WS-001",
            Objective = "due_date",
            WorkOrderIds = [workOrder.Id],
        };
        var engineResult = new RuleEngineResult
        {
            Assignments =
            [
                new ScheduleAssignment
                {
                    WorkOrderId = workOrder.Id,
                    EquipmentId = "CNC-001",
                    StartTime = now,
                    EndTime = now.AddHours(2),
                }
            ],
            EstimatedCompletion = now.AddHours(2),
            UtilizationRate = 80,
            OnTimeDeliveryRate = 95,
            TotalChangeoverMinutes = 10,
            GroupCount = 1,
        };
        _workOrderRepoMock.Setup(r => r.GetByIdAsync(workOrder.Id, ct)).ReturnsAsync(workOrder);
        _contextProviderMock
            .Setup(r => r.GetContextAsync("WS-001", ct))
            .ThrowsAsync(new InvalidOperationException("context unavailable"));
        _equipmentRepoMock.Setup(r => r.GetAllAsync(ct)).ReturnsAsync([]);
        _ruleEngineMock
            .Setup(r => r.GenerateInitialScheduleAsync(
                It.IsAny<ScheduleRequest>(),
                It.IsAny<SchedulingContextSnapshot>(),
                It.IsAny<PriorityRule>(),
                It.IsAny<CapacitySelectionStrategy>(),
                ct))
            .ReturnsAsync(engineResult);
        _decisionRepoMock
            .Setup(r => r.AddTriggerEventAsync(It.IsAny<AgentTriggerEvent>(), ct))
            .Returns(Task.CompletedTask);
        _decisionRepoMock
            .Setup(r => r.AddDecisionAsync(It.IsAny<AgentDecision>(), ct))
            .Callback<AgentDecision, CancellationToken>((decision, _) => capturedDecision = decision)
            .Returns(Task.CompletedTask);
        _decisionRepoMock
            .Setup(r => r.AddEvidenceLinkAsync(It.IsAny<AgentEvidenceLink>(), ct))
            .Callback<AgentEvidenceLink, CancellationToken>((link, _) => capturedEvidence = link)
            .Returns(Task.CompletedTask);
        _decisionRepoMock
            .Setup(r => r.AddTraceAsync(It.IsAny<AiDecisionTraceEntity>(), ct))
            .Returns(Task.CompletedTask);
        _auditLogRepoMock
            .Setup(r => r.AddAsync(It.IsAny<AuditLog>(), ct))
            .Returns(Task.CompletedTask);

        var result = await _sut.RecommendAsync(request, "planner-001", ct);

        result.BusinessKey.Should().Be("Workshop:WS-001");
        var decision = capturedDecision ?? throw new InvalidOperationException("Agent decision was not captured.");
        var evidence = capturedEvidence ?? throw new InvalidOperationException("Schedule request evidence was not captured.");
        evidence.EvidenceType.Should().Be("ScheduleRequest");
        evidence.AgentDecisionId.Should().Be(decision.Id);
        evidence.EvidenceKey.Should().Be("Workshop:WS-001");
        evidence.CreatedAt.Should().Be(decision.CreatedAt,
            "schedule request evidence is replayed by CreatedAt and must stay aligned with the decision event timestamp");
    }

    [Fact]
    public async Task UpsertRiskActionTraceAsync_ShouldPersistEventTimestampForEvidenceOrdering()
    {
        using var cts = new CancellationTokenSource();
        var ct = cts.Token;
        AgentEvidenceLink? capturedEvidence = null;
        AuditLog? capturedAudit = null;
        var trace = new RiskActionTraceDto(
            "RISK-001",
            "物料短缺处置",
            "shortage",
            "assigned",
            "已派工",
            "计划员",
            "WO-001",
            "TRACE-RISK-001",
            "调拨替代料",
            "短缺风险已派发现场处置",
            "2026-05-31T08:00:00.000Z");
        _decisionRepoMock
            .Setup(r => r.UpsertEvidenceLinkAsync(It.IsAny<AgentEvidenceLink>(), ct))
            .Callback<AgentEvidenceLink, CancellationToken>((link, _) => capturedEvidence = link)
            .Returns(Task.CompletedTask);
        _auditLogRepoMock
            .Setup(r => r.AddAsync(It.IsAny<AuditLog>(), ct))
            .Callback<AuditLog, CancellationToken>((log, _) => capturedAudit = log)
            .Returns(Task.CompletedTask);

        var result = await _sut.UpsertRiskActionTraceAsync(trace, "planner-001", ct);

        result.Should().Be(trace);
        capturedEvidence.Should().NotBeNull();
        capturedEvidence!.EvidenceType.Should().Be("RiskActionTrace");
        capturedEvidence.EvidenceKey.Should().Be("RISK-001:assigned");
        capturedEvidence.CreatedAt.Should().Be(new DateTime(2026, 5, 31, 8, 0, 0, DateTimeKind.Utc),
            "risk evidence queries sort by CreatedAt, so replay order must use the event timestamp");
        capturedEvidence.EvidenceSummary.Should().Contain("\"deliveryImpact\":\"TRACE-RISK-001\"");
        capturedAudit.Should().NotBeNull();
        capturedAudit!.Action.Should().Be("RiskActionTraceUpsert");
        capturedAudit.ResourceId.Should().Be("RISK-001:assigned");
        capturedAudit.BusinessKey.Should().Be("WO-001");
        capturedAudit.TraceId.Should().Be("TRACE-RISK-001");
    }

    [Fact]
    public async Task QueryRiskActionTracesAsync_ShouldSkipInvalidEvidenceAndUseDefaultTake()
    {
        using var cts = new CancellationTokenSource();
        var ct = cts.Token;
        var validTrace = new RiskActionTraceDto(
            "RISK-VALID",
            "急单交付风险处置",
            "order",
            "closed",
            "已闭环",
            "planner-001",
            "WO-RUSH-9001",
            "-3.2% OTD",
            "复核调拨结果",
            "TRACE-RISK-VALID-20260531",
            "2026-05-31T09:30:00.000Z");
        _decisionRepoMock
            .Setup(r => r.QueryEvidenceLinksAsync("RiskActionTrace", 12, ct))
            .ReturnsAsync(
            [
                new AgentEvidenceLink
                {
                    EvidenceType = "RiskActionTrace",
                    EvidenceKey = "risk-trace-invalid",
                    EvidenceSummary = "{not-json",
                    CreatedAt = new DateTime(2026, 5, 31, 10, 0, 0, DateTimeKind.Utc)
                },
                new AgentEvidenceLink
                {
                    EvidenceType = "RiskActionTrace",
                    EvidenceKey = validTrace.Id,
                    EvidenceSummary = JsonSerializer.Serialize(validTrace),
                    CreatedAt = new DateTime(2026, 5, 31, 9, 30, 0, DateTimeKind.Utc)
                }
            ]);

        var result = await _sut.QueryRiskActionTracesAsync(0, ct);

        result.Should().ContainSingle();
        result[0].Should().BeEquivalentTo(validTrace);
        _decisionRepoMock.Verify(r => r.QueryEvidenceLinksAsync("RiskActionTrace", 12, ct), Times.Once);
    }

    [Fact]
    public async Task UpsertProductionAnomalyEventAsync_ShouldPersistDetectedTimestampForEvidenceOrdering()
    {
        using var cts = new CancellationTokenSource();
        var ct = cts.Token;
        AgentEvidenceLink? capturedEvidence = null;
        AuditLog? capturedAudit = null;
        var anomaly = new ProductionAnomalyEventDto(
            "prod-anomaly-chat-cnc001-temp",
            "WO-RUSH-9001",
            "OP-020",
            "CNC 精加工",
            "CNC-001",
            "equipment",
            "Critical",
            "CNC-001 主轴温升异常",
            "预计影响 2h 瓶颈设备窗口",
            "2026-05-31T07:45:00.000Z",
            "planner-001",
            "立即冻结 CNC-001 当前窗口并通知设备主管复核");
        _decisionRepoMock
            .Setup(r => r.UpsertEvidenceLinkAsync(It.IsAny<AgentEvidenceLink>(), ct))
            .Callback<AgentEvidenceLink, CancellationToken>((link, _) => capturedEvidence = link)
            .Returns(Task.CompletedTask);
        _auditLogRepoMock
            .Setup(r => r.AddAsync(It.IsAny<AuditLog>(), ct))
            .Callback<AuditLog, CancellationToken>((log, _) => capturedAudit = log)
            .Returns(Task.CompletedTask);

        var result = await _sut.UpsertProductionAnomalyEventAsync(anomaly, "planner-001", ct);

        result.Should().Be(anomaly);
        var evidence = capturedEvidence ?? throw new InvalidOperationException("Production anomaly evidence was not captured.");
        evidence.EvidenceType.Should().Be("ProductionAnomalyEvent");
        evidence.EvidenceKey.Should().Be("prod-anomaly-chat-cnc001-temp");
        evidence.CreatedAt.Should().Be(new DateTime(2026, 5, 31, 7, 45, 0, DateTimeKind.Utc),
            "production anomaly evidence is replayed by CreatedAt and must keep the detected event timestamp");
        evidence.EvidenceSummary.Should().Contain("\"detectedAt\":\"2026-05-31T07:45:00.000Z\"");
        var audit = capturedAudit ?? throw new InvalidOperationException("Production anomaly audit was not captured.");
        audit.Action.Should().Be("ProductionAnomalyEventUpsert");
        audit.ResourceId.Should().Be("prod-anomaly-chat-cnc001-temp");
        audit.BusinessKey.Should().Be("WO-RUSH-9001");
        audit.TraceId.Should().Be("prod-anomaly-chat-cnc001-temp");
    }

    [Fact]
    public async Task UpsertLaborReassignmentAsync_ShouldPersistEventTimestampForEvidenceOrdering()
    {
        using var cts = new CancellationTokenSource();
        var ct = cts.Token;
        AgentEvidenceLink? capturedEvidence = null;
        AuditLog? capturedAudit = null;
        var reassignment = new LaborReassignmentRecordDto(
            "labor-reassign-WO-013-OP-10",
            "WO-013",
            "OP-10",
            ["OP-10", "OP-20"],
            "CNC 精加工",
            "EMP-007",
            "王五",
            "CNC-A",
            "2026-05-31",
            "EMP-011",
            "赵六",
            "A 组",
            "白班",
            "CNC-A",
            "CNC-A",
            "2027-05-31",
            "EMP-099",
            "生产经理",
            "生产经理",
            "原操作工资质即将过期，需替换为有效资质人员",
            "AUD-LABOR-REASSIGN-WO-013-OP-10",
            "TRACE-LABOR-REASSIGN-WO-013-OP-10",
            "2026-05-31T09:45:00.000Z",
            "approved");
        _decisionRepoMock
            .Setup(r => r.UpsertEvidenceLinkAsync(It.IsAny<AgentEvidenceLink>(), ct))
            .Callback<AgentEvidenceLink, CancellationToken>((link, _) => capturedEvidence = link)
            .Returns(Task.CompletedTask);
        _auditLogRepoMock
            .Setup(r => r.AddAsync(It.IsAny<AuditLog>(), ct))
            .Callback<AuditLog, CancellationToken>((log, _) => capturedAudit = log)
            .Returns(Task.CompletedTask);

        var result = await _sut.UpsertLaborReassignmentAsync(reassignment, "planner-001", ct);

        result.Should().Be(reassignment);
        var evidence = capturedEvidence ?? throw new InvalidOperationException("Labor reassignment evidence was not captured.");
        evidence.EvidenceType.Should().Be("LaborReassignment");
        evidence.EvidenceKey.Should().Be("labor-reassign-WO-013-OP-10");
        evidence.CreatedAt.Should().Be(new DateTime(2026, 5, 31, 9, 45, 0, DateTimeKind.Utc),
            "labor reassignment evidence is replayed by CreatedAt and must keep the reassignment event timestamp");
        evidence.EvidenceSummary.Should().Contain("\"traceId\":\"TRACE-LABOR-REASSIGN-WO-013-OP-10\"");
        var audit = capturedAudit ?? throw new InvalidOperationException("Labor reassignment audit was not captured.");
        audit.Action.Should().Be("LaborReassignmentUpsert");
        audit.ResourceId.Should().Be("labor-reassign-WO-013-OP-10");
        audit.BusinessKey.Should().Be("WO-013");
        audit.TraceId.Should().Be("TRACE-LABOR-REASSIGN-WO-013-OP-10");
    }

    [Fact]
    public async Task UpsertLaborQualificationBlockAsync_ShouldPersistReleasedTimestampForEvidenceOrdering()
    {
        using var cts = new CancellationTokenSource();
        var ct = cts.Token;
        AgentEvidenceLink? capturedEvidence = null;
        AuditLog? capturedAudit = null;
        var block = new LaborQualificationBlockRecordDto(
            "labor-qualification-block-WO-013-heat-treatment",
            "WO-013",
            "OP-10",
            ["OP-10", "OP-20"],
            "淬火 / 回火",
            "EMP-003",
            "王五",
            "热处理上岗证",
            "2026-05-25",
            "热处理",
            "乙班",
            "夜班",
            "EMP-004",
            "赵六",
            "工程放行",
            "热处理上岗证临期，未找到有效替班候选",
            "AUD-LABOR-BLOCK-20260531-001",
            "TRACE-LABOR-BLOCK-WO-013-OP-10",
            "2026-05-31T08:10:00.000Z",
            "released",
            "2026-05-31T09:30:00.000Z",
            "2026-05-31T10:05:00.000Z",
            "AUD-LABOR-RELEASE-20260531-001",
            "TRACE-LABOR-RELEASE-WO-013-OP-10",
            "主管确认补证/改派方案后重新放行");
        _decisionRepoMock
            .Setup(r => r.UpsertEvidenceLinkAsync(It.IsAny<AgentEvidenceLink>(), ct))
            .Callback<AgentEvidenceLink, CancellationToken>((link, _) => capturedEvidence = link)
            .Returns(Task.CompletedTask);
        _auditLogRepoMock
            .Setup(r => r.AddAsync(It.IsAny<AuditLog>(), ct))
            .Callback<AuditLog, CancellationToken>((log, _) => capturedAudit = log)
            .Returns(Task.CompletedTask);

        var result = await _sut.UpsertLaborQualificationBlockAsync(block, "planner-001", ct);

        result.Should().Be(block);
        var evidence = capturedEvidence ?? throw new InvalidOperationException("Labor qualification block evidence was not captured.");
        evidence.EvidenceType.Should().Be("LaborQualificationBlock");
        evidence.EvidenceKey.Should().Be("labor-qualification-block-WO-013-heat-treatment");
        evidence.CreatedAt.Should().Be(new DateTime(2026, 5, 31, 10, 5, 0, DateTimeKind.Utc),
            "released labor qualification blocks are replayed by CreatedAt and must keep the release event timestamp");
        evidence.EvidenceSummary.Should().Contain("\"releaseTraceId\":\"TRACE-LABOR-RELEASE-WO-013-OP-10\"");
        var audit = capturedAudit ?? throw new InvalidOperationException("Labor qualification block audit was not captured.");
        audit.Action.Should().Be("LaborQualificationBlockUpsert");
        audit.ResourceId.Should().Be("labor-qualification-block-WO-013-heat-treatment");
        audit.BusinessKey.Should().Be("WO-013");
        audit.TraceId.Should().Be("TRACE-LABOR-RELEASE-WO-013-OP-10");
    }

    [Fact]
    public async Task UpsertBarcodeScanEvidenceAsync_ShouldPersistEventTimestampForEvidenceOrdering()
    {
        using var cts = new CancellationTokenSource();
        var ct = cts.Token;
        AgentEvidenceLink? capturedEvidence = null;
        AuditLog? capturedAudit = null;
        var evidenceRecord = new BarcodeScanEvidenceRecordDto(
            "barcode-scan-WO-RUSH-9001-arrival",
            "WO-RUSH-9001",
            "WorkOrder",
            "WO-RUSH-9001 到站扫码",
            "arrival",
            "operator-001",
            "WO-RUSH-9001 / OP-020",
            "扫码枪",
            "工单到达 CNC 精加工工位",
            "TRACE-QR-WO-RUSH-9001-ARRIVAL",
            "已到站",
            "2026-05-31T10:25:00.000Z",
            "首件检验前复核");
        _decisionRepoMock
            .Setup(r => r.UpsertEvidenceLinkAsync(It.IsAny<AgentEvidenceLink>(), ct))
            .Callback<AgentEvidenceLink, CancellationToken>((link, _) => capturedEvidence = link)
            .Returns(Task.CompletedTask);
        _auditLogRepoMock
            .Setup(r => r.AddAsync(It.IsAny<AuditLog>(), ct))
            .Callback<AuditLog, CancellationToken>((log, _) => capturedAudit = log)
            .Returns(Task.CompletedTask);

        var result = await _sut.UpsertBarcodeScanEvidenceAsync(evidenceRecord, "operator-001", ct);

        result.Should().Be(evidenceRecord);
        var evidence = capturedEvidence ?? throw new InvalidOperationException("Barcode scan evidence was not captured.");
        evidence.EvidenceType.Should().Be("BarcodeScanEvidence");
        evidence.EvidenceKey.Should().Be("barcode-scan-WO-RUSH-9001-arrival");
        evidence.CreatedAt.Should().Be(new DateTime(2026, 5, 31, 10, 25, 0, DateTimeKind.Utc),
            "barcode scan evidence is replayed by CreatedAt and must keep the scan event timestamp");
        evidence.EvidenceSummary.Should().Contain("\"traceId\":\"TRACE-QR-WO-RUSH-9001-ARRIVAL\"");
        var audit = capturedAudit ?? throw new InvalidOperationException("Barcode scan audit was not captured.");
        audit.Action.Should().Be("BarcodeScanEvidenceUpsert");
        audit.ResourceId.Should().Be("barcode-scan-WO-RUSH-9001-arrival");
        audit.BusinessKey.Should().Be("WO-RUSH-9001 / OP-020");
        audit.TraceId.Should().Be("TRACE-QR-WO-RUSH-9001-ARRIVAL");
    }

    [Fact]
    public async Task UpsertQualityCapaClosureAsync_ShouldPersistVerifiedTimestampForEvidenceOrdering()
    {
        using var cts = new CancellationTokenSource();
        var ct = cts.Token;
        AgentEvidenceLink? capturedEvidence = null;
        AuditLog? capturedAudit = null;
        var closure = new QualityCapaClosureDto(
            "QI-20260531-001",
            "WO-RUSH-9001",
            "TRACE-QUALITY-CAPA-CLOSURE-20260531",
            "夹具定位偏差导致首件尺寸超差",
            0.92m,
            "首件尺寸超差 CAPA 闭环",
            "quality-capa",
            "质量工程师",
            "今日 16:00",
            "复测 3 件均满足公差",
            "2026-05-31T11:35:00.000Z",
            "closed",
            "+4% OTD 恢复",
            "CAPA 已验证闭环，可释放后续批次");
        _decisionRepoMock
            .Setup(r => r.UpsertEvidenceLinkAsync(It.IsAny<AgentEvidenceLink>(), ct))
            .Callback<AgentEvidenceLink, CancellationToken>((link, _) => capturedEvidence = link)
            .Returns(Task.CompletedTask);
        _auditLogRepoMock
            .Setup(r => r.AddAsync(It.IsAny<AuditLog>(), ct))
            .Callback<AuditLog, CancellationToken>((log, _) => capturedAudit = log)
            .Returns(Task.CompletedTask);

        var result = await _sut.UpsertQualityCapaClosureAsync(closure, "quality-001", ct);

        result.Should().Be(closure);
        var evidence = capturedEvidence ?? throw new InvalidOperationException("Quality CAPA closure evidence was not captured.");
        evidence.EvidenceType.Should().Be("QualityCapaClosure");
        evidence.EvidenceKey.Should().Be("QI-20260531-001");
        evidence.CreatedAt.Should().Be(new DateTime(2026, 5, 31, 11, 35, 0, DateTimeKind.Utc),
            "quality CAPA closure evidence is replayed by CreatedAt and must keep the verification event timestamp");
        evidence.EvidenceSummary.Should().Contain("\"verifiedAt\":\"2026-05-31T11:35:00.000Z\"");
        var audit = capturedAudit ?? throw new InvalidOperationException("Quality CAPA closure audit was not captured.");
        audit.Action.Should().Be("QualityCapaClosureUpsert");
        audit.ResourceId.Should().Be("QI-20260531-001");
        audit.BusinessKey.Should().Be("WO-RUSH-9001");
        audit.TraceId.Should().Be("TRACE-QUALITY-CAPA-CLOSURE-20260531");
    }

    [Fact]
    public async Task UpsertAgentConfigApprovalAsync_ShouldPersistDecisionTimestampForEvidenceOrdering()
    {
        using var cts = new CancellationTokenSource();
        var ct = cts.Token;
        AgentEvidenceLink? capturedEvidence = null;
        AuditLog? capturedAudit = null;
        var approval = new AgentConfigApprovalRecordDto(
            "cfg-quality-experiment-gate",
            "质量推荐实验扩大门禁 复验 100% -> >=95%",
            "质量推荐实验扩大门禁复验通过率从 100% 调整为 95%",
            "Quality.RecommendationExperimentExpansionGate",
            "采纳率 100% / 复验通过率 100% / 误召回 0 次",
            "采纳率 100% / 复验通过率 >=95% / 误召回 0 次",
            "R4 同设备族实验复验 98%、误召回 0 次，允许扩大灰度",
            "质量主管 / 知识库管理员",
            "approved",
            "TRACE-CFG-QA-EXPERIMENT-GATE-20260531-001",
            "admin",
            "2026-05-31T08:20:00.000Z",
            "复验阈值放宽必须绑定误召回 0 次和质量主管审批",
            "quality-lead-001",
            "2026-05-31T12:15:00.000Z",
            "quality",
            [
                new AgentConfigApprovalMetricDto("推荐采纳率", "100%", "100%"),
                new AgentConfigApprovalMetricDto("复验通过率", "100%", ">=95%")
            ],
            "审批通过后扩大灰度需继续保留回滚负样本");
        _decisionRepoMock
            .Setup(r => r.UpsertEvidenceLinkAsync(It.IsAny<AgentEvidenceLink>(), ct))
            .Callback<AgentEvidenceLink, CancellationToken>((link, _) => capturedEvidence = link)
            .Returns(Task.CompletedTask);
        _auditLogRepoMock
            .Setup(r => r.AddAsync(It.IsAny<AuditLog>(), ct))
            .Callback<AuditLog, CancellationToken>((log, _) => capturedAudit = log)
            .Returns(Task.CompletedTask);

        var result = await _sut.UpsertAgentConfigApprovalAsync(approval, "quality-lead-001", ct);

        result.Should().Be(approval);
        var evidence = capturedEvidence ?? throw new InvalidOperationException("Agent config approval evidence was not captured.");
        evidence.EvidenceType.Should().Be("AgentConfigApproval");
        evidence.EvidenceKey.Should().Be("cfg-quality-experiment-gate");
        evidence.CreatedAt.Should().Be(new DateTime(2026, 5, 31, 12, 15, 0, DateTimeKind.Utc),
            "decided config approvals are replayed by CreatedAt and must keep the decision event timestamp");
        evidence.EvidenceSummary.Should().Contain("\"decidedAt\":\"2026-05-31T12:15:00.000Z\"");
        var audit = capturedAudit ?? throw new InvalidOperationException("Agent config approval audit was not captured.");
        audit.Action.Should().Be("AgentConfigApprovalUpsert");
        audit.ResourceId.Should().Be("cfg-quality-experiment-gate");
        audit.BusinessKey.Should().Be("Quality.RecommendationExperimentExpansionGate");
        audit.TraceId.Should().Be("TRACE-CFG-QA-EXPERIMENT-GATE-20260531-001");
    }

    [Fact]
    public async Task UpsertAssistantActionAuditAsync_ShouldPersistEventTimestampForEvidenceOrdering()
    {
        using var cts = new CancellationTokenSource();
        var ct = cts.Token;
        AgentEvidenceLink? capturedEvidence = null;
        AuditLog? capturedAudit = null;
        var audit = new AssistantActionAuditRecordDto(
            "AUD-CHAT-001-20260531",
            "delivery-recovery",
            "生成交付恢复包",
            "delivery_recovery_package",
            "planner-001",
            Roles.Planner,
            "/scheduling",
            "AUD-CHAT-001",
            "TRACE-CHAT-RECOVERY-WO-RUSH-9001-20260521",
            "交付恢复包已生成",
            true,
            "2026-05-31T09:30:00.000Z");
        _decisionRepoMock
            .Setup(r => r.UpsertEvidenceLinkAsync(It.IsAny<AgentEvidenceLink>(), ct))
            .Callback<AgentEvidenceLink, CancellationToken>((link, _) => capturedEvidence = link)
            .Returns(Task.CompletedTask);
        _auditLogRepoMock
            .Setup(r => r.AddAsync(It.IsAny<AuditLog>(), ct))
            .Callback<AuditLog, CancellationToken>((log, _) => capturedAudit = log)
            .Returns(Task.CompletedTask);

        var result = await _sut.UpsertAssistantActionAuditAsync(audit, "planner-001", ct);

        result.Should().Be(audit);
        capturedEvidence.Should().NotBeNull();
        capturedEvidence!.EvidenceType.Should().Be("AssistantActionAudit");
        capturedEvidence.EvidenceKey.Should().Be("AUD-CHAT-001-20260531");
        capturedEvidence.CreatedAt.Should().Be(new DateTime(2026, 5, 31, 9, 30, 0, DateTimeKind.Utc),
            "assistant action audits are replayed by CreatedAt and must keep the action event timestamp");
        capturedEvidence.EvidenceSummary.Should().Contain("\"auditCode\":\"AUD-CHAT-001\"");
        capturedAudit.Should().NotBeNull();
        capturedAudit!.Action.Should().Be("AssistantActionAuditUpsert");
        capturedAudit.ResourceId.Should().Be("AUD-CHAT-001-20260531");
        capturedAudit.BusinessKey.Should().Be("delivery-recovery");
        capturedAudit.TraceId.Should().Be("TRACE-CHAT-RECOVERY-WO-RUSH-9001-20260521");
    }

    [Fact]
    public async Task UpsertAnomalyDispatchRecordAsync_ShouldPersistEventTimestampForEvidenceOrdering()
    {
        using var cts = new CancellationTokenSource();
        var ct = cts.Token;
        AgentEvidenceLink? capturedEvidence = null;
        AuditLog? capturedAudit = null;
        var dispatch = new AnomalyDispatchRecordDto(
            "anomaly-dispatch-PA-001",
            "PA-001",
            "equipment",
            "设备异常",
            "CNC 温升异常分流",
            "WO-001",
            "OP-010",
            "/anomaly",
            "设备工程师",
            "2026-05-31T12:00:00.000Z",
            "WO-001,WO-002",
            "TRACE-ANOMALY-DISPATCH-001",
            "08:00-12:00",
            "切换备用设备",
            "AUD-ANOMALY-001",
            "TRACE-ANOMALY-DISPATCH-001",
            "routed",
            "已分流",
            "2026-05-31T10:15:00.000Z",
            "异常已分流至设备工程师");
        _decisionRepoMock
            .Setup(r => r.UpsertEvidenceLinkAsync(It.IsAny<AgentEvidenceLink>(), ct))
            .Callback<AgentEvidenceLink, CancellationToken>((link, _) => capturedEvidence = link)
            .Returns(Task.CompletedTask);
        _auditLogRepoMock
            .Setup(r => r.AddAsync(It.IsAny<AuditLog>(), ct))
            .Callback<AuditLog, CancellationToken>((log, _) => capturedAudit = log)
            .Returns(Task.CompletedTask);

        var result = await _sut.UpsertAnomalyDispatchRecordAsync(dispatch, "planner-001", ct);

        result.Should().Be(dispatch);
        capturedEvidence.Should().NotBeNull();
        capturedEvidence!.EvidenceType.Should().Be("AnomalyDispatchRecord");
        capturedEvidence.EvidenceKey.Should().Be("anomaly-dispatch-PA-001");
        capturedEvidence.CreatedAt.Should().Be(new DateTime(2026, 5, 31, 10, 15, 0, DateTimeKind.Utc),
            "anomaly dispatch evidence is replayed by CreatedAt and must keep the dispatch event timestamp");
        capturedEvidence.EvidenceSummary.Should().Contain("\"traceId\":\"TRACE-ANOMALY-DISPATCH-001\"");
        capturedAudit.Should().NotBeNull();
        capturedAudit!.Action.Should().Be("AnomalyDispatchRecordUpsert");
        capturedAudit.ResourceId.Should().Be("anomaly-dispatch-PA-001");
        capturedAudit.BusinessKey.Should().Be("WO-001,WO-002");
        capturedAudit.TraceId.Should().Be("TRACE-ANOMALY-DISPATCH-001");
    }

    [Fact]
    public async Task UpsertMonitoringSituationEscalationAsync_ShouldPersistClosedTimestampForEvidenceOrdering()
    {
        using var cts = new CancellationTokenSource();
        var ct = cts.Token;
        AgentEvidenceLink? capturedEvidence = null;
        AuditLog? capturedAudit = null;
        var escalation = new MonitoringSituationEscalationDto(
            "monitoring-situation-CNC-001",
            "CNC-001",
            "CNC 瓶颈现场态势升级处置包",
            "实时监控",
            "WO-001,WO-002",
            "warning",
            "生产经理",
            "2026-05-31T11:30:00.000Z",
            "AUD-SF-ESC-CNC-001",
            "TRACE-SF-ESC-CNC-001",
            "closed",
            "已闭环",
            "锁定期后第一个 CNC 空窗",
            "冻结瓶颈任务并分流",
            "瓶颈负载已缓解",
            "风险队列关闭现场处置包",
            "+6% 已锁定",
            "-1 单延期风险已解除",
            "+10min 已纳入复盘",
            "现场态势已闭环",
            ["TRACE-SF-CNC-001"],
            ["生产经理审批", "调度复核完成"],
            "2026-05-31T10:00:00.000Z",
            "2026-05-31T11:05:00.000Z",
            "TRACE-SF-ESC-CNC-001-CLOSED");
        _decisionRepoMock
            .Setup(r => r.UpsertEvidenceLinkAsync(It.IsAny<AgentEvidenceLink>(), ct))
            .Callback<AgentEvidenceLink, CancellationToken>((link, _) => capturedEvidence = link)
            .Returns(Task.CompletedTask);
        _auditLogRepoMock
            .Setup(r => r.AddAsync(It.IsAny<AuditLog>(), ct))
            .Callback<AuditLog, CancellationToken>((log, _) => capturedAudit = log)
            .Returns(Task.CompletedTask);

        var result = await _sut.UpsertMonitoringSituationEscalationAsync(escalation, "planner-001", ct);

        result.Should().Be(escalation);
        capturedEvidence.Should().NotBeNull();
        capturedEvidence!.EvidenceType.Should().Be("MonitoringSituationEscalation");
        capturedEvidence.EvidenceKey.Should().Be("monitoring-situation-CNC-001");
        capturedEvidence.CreatedAt.Should().Be(new DateTime(2026, 5, 31, 11, 5, 0, DateTimeKind.Utc),
            "closed monitoring escalations are replayed by CreatedAt and must keep the closure event timestamp");
        capturedEvidence.EvidenceSummary.Should().Contain("\"closureTrace\":\"TRACE-SF-ESC-CNC-001-CLOSED\"");
        capturedAudit.Should().NotBeNull();
        capturedAudit!.Action.Should().Be("MonitoringSituationEscalationUpsert");
        capturedAudit.ResourceId.Should().Be("monitoring-situation-CNC-001");
        capturedAudit.BusinessKey.Should().Be("WO-001,WO-002");
        capturedAudit.TraceId.Should().Be("TRACE-SF-ESC-CNC-001-CLOSED");
    }

    [Fact]
    public async Task UpsertRiskSlaReviewAsync_ShouldPersistClosedTimestampForEvidenceOrdering()
    {
        using var cts = new CancellationTokenSource();
        var ct = cts.Token;
        AgentEvidenceLink? capturedEvidence = null;
        AuditLog? capturedAudit = null;
        var review = new RiskSlaReviewRecordDto(
            "risk-sla-review-20260531",
            "风险 SLA 逾期晨会复核包",
            "closed",
            "晨会责任动作已闭环",
            "RISK-DAILY-20260531-001",
            "生产经理",
            2,
            3,
            "WO-001 / CNC-001",
            "+6% OTD 恢复动作已锁定",
            "AUD-RISK-SLA-REVIEW-20260531",
            "TRACE-RISK-SLA-DAILY-REVIEW-20260531",
            "2026-05-31T08:20:00.000Z",
            "风险 SLA 晨会已复核",
            [
                new RiskSlaReviewRiskDto(
                    "risk-order-001",
                    "工单延期",
                    "WO-001 CNC 停机延期",
                    "生产经理",
                    "今日 14:00",
                    "WO-001",
                    "预计延期 2 天",
                    "已升级",
                    "overdue",
                    "确认 CNC 分流")
            ],
            [
                new RiskSlaReviewActionDto(
                    "AI 排产",
                    "调度主管",
                    "今日 10:30",
                    "生成排产保护建议",
                    "TRACE-RISK-SLA-SCHEDULE-REVIEW-20260531",
                    "已锁定承诺窗口")
            ],
            "2026-05-31T11:20:00.000Z",
            "AUD-RISK-SLA-CLOSURE-20260531",
            "TRACE-RISK-SLA-DAILY-REVIEW-CLOSED-20260531",
            "晨会责任动作已全部闭环");
        _decisionRepoMock
            .Setup(r => r.UpsertEvidenceLinkAsync(It.IsAny<AgentEvidenceLink>(), ct))
            .Callback<AgentEvidenceLink, CancellationToken>((link, _) => capturedEvidence = link)
            .Returns(Task.CompletedTask);
        _auditLogRepoMock
            .Setup(r => r.AddAsync(It.IsAny<AuditLog>(), ct))
            .Callback<AuditLog, CancellationToken>((log, _) => capturedAudit = log)
            .Returns(Task.CompletedTask);

        var result = await _sut.UpsertRiskSlaReviewAsync(review, "planner-001", ct);

        result.Should().Be(review);
        capturedEvidence.Should().NotBeNull();
        capturedEvidence!.EvidenceType.Should().Be("RiskSlaReview");
        capturedEvidence.EvidenceKey.Should().Be("risk-sla-review-20260531");
        capturedEvidence.CreatedAt.Should().Be(new DateTime(2026, 5, 31, 11, 20, 0, DateTimeKind.Utc),
            "closed risk SLA reviews are replayed by CreatedAt and must keep the closure event timestamp");
        capturedEvidence.EvidenceSummary.Should().Contain("\"closureTraceId\":\"TRACE-RISK-SLA-DAILY-REVIEW-CLOSED-20260531\"");
        capturedAudit.Should().NotBeNull();
        capturedAudit!.Action.Should().Be("RiskSlaReviewUpsert");
        capturedAudit.ResourceId.Should().Be("risk-sla-review-20260531");
        capturedAudit.BusinessKey.Should().Be("WO-001 / CNC-001");
        capturedAudit.TraceId.Should().Be("TRACE-RISK-SLA-DAILY-REVIEW-CLOSED-20260531");
    }

    [Fact]
    public async Task UpsertAssistantRecoveryPackageAsync_ShouldPersistClosedTimestampForEvidenceOrdering()
    {
        using var cts = new CancellationTokenSource();
        var ct = cts.Token;
        AgentEvidenceLink? capturedEvidence = null;
        AuditLog? capturedAudit = null;
        var package = new AssistantRecoveryPackageDto(
            "assistant-recovery-WO-RUSH-9001",
            "WO-RUSH-9001 交付恢复包",
            "AUD-RECOVERY-WO-RUSH-9001",
            "TRACE-RECOVERY-WO-RUSH-9001",
            "planner-001",
            Roles.Planner,
            "WO-RUSH-9001",
            "high",
            "生产计划员",
            "2026-06-01T18:00:00.000Z",
            "2026-05-31 14:00-18:00",
            "锁定 CNC 加急窗口",
            "关键订单存在延期风险",
            "采购与质量动作同步闭环",
            "+8% OTD 恢复",
            "-1 单延期风险",
            "+12min 换型",
            "closed",
            "已闭环",
            "closed",
            "AUD-PURCHASE-CLOSED",
            "TRACE-PURCHASE-CLOSED",
            "替代料已确认到料",
            "2026-05-31T11:20:00.000Z",
            "buyer-001",
            "PO-20260531-001",
            "closed",
            "AUD-QUALITY-CLOSED",
            "TRACE-QUALITY-CLOSED",
            "首件记录已补齐",
            "2026-05-31T12:40:00.000Z",
            "quality-001",
            "FAI-20260531-001",
            "AUD-RECOVERY-CLOSED",
            "TRACE-RECOVERY-CLOSED",
            "交付恢复包已完成跨域闭环",
            "2026-05-31T13:10:00.000Z",
            "planner-001",
            "交付恢复动作已闭环",
            [
                new AssistantPackageStepDto(
                    "purchase",
                    "采购员",
                    "确认替代料到货",
                    "TRACE-PURCHASE-CLOSED",
                    "closed",
                    "已到货",
                    "2026-05-31T11:20:00.000Z")
            ],
            "2026-05-31T09:00:00.000Z");
        _decisionRepoMock
            .Setup(r => r.UpsertEvidenceLinkAsync(It.IsAny<AgentEvidenceLink>(), ct))
            .Callback<AgentEvidenceLink, CancellationToken>((link, _) => capturedEvidence = link)
            .Returns(Task.CompletedTask);
        _auditLogRepoMock
            .Setup(r => r.AddAsync(It.IsAny<AuditLog>(), ct))
            .Callback<AuditLog, CancellationToken>((log, _) => capturedAudit = log)
            .Returns(Task.CompletedTask);

        var result = await _sut.UpsertAssistantRecoveryPackageAsync(package, "planner-001", ct);

        result.Should().Be(package);
        var evidence = capturedEvidence ?? throw new InvalidOperationException("Assistant recovery evidence was not captured.");
        evidence.EvidenceType.Should().Be("AssistantRecoveryPackage");
        evidence.EvidenceKey.Should().Be("assistant-recovery-WO-RUSH-9001");
        evidence.CreatedAt.Should().Be(new DateTime(2026, 5, 31, 13, 10, 0, DateTimeKind.Utc),
            "closed assistant recovery packages are replayed by CreatedAt and must keep the closure event timestamp");
        evidence.EvidenceSummary.Should().Contain("\"closureTraceId\":\"TRACE-RECOVERY-CLOSED\"");
        var audit = capturedAudit ?? throw new InvalidOperationException("Assistant recovery audit was not captured.");
        audit.Action.Should().Be("AssistantRecoveryPackageUpsert");
        audit.ResourceId.Should().Be("assistant-recovery-WO-RUSH-9001");
        audit.BusinessKey.Should().Be("WO-RUSH-9001");
        audit.TraceId.Should().Be("TRACE-RECOVERY-CLOSED");
    }

    [Fact]
    public async Task UpsertAssistantAnomalyPackageAsync_ShouldPersistEventTimestampForEvidenceOrdering()
    {
        using var cts = new CancellationTokenSource();
        var ct = cts.Token;
        AgentEvidenceLink? capturedEvidence = null;
        AuditLog? capturedAudit = null;
        var package = new AssistantAnomalyDispositionPackageDto(
            "assistant-anomaly-cnc001-temperature",
            "CNC-001 主轴温升异常处置卡",
            "AUD-CHAT-ANOMALY-20260531-001",
            "TRACE-CHAT-ANOMALY-CNC001-TEMP-20260531",
            "planner-001",
            Roles.Planner,
            "WO-RUSH-9001 / WO-20260501",
            "critical",
            "设备主管 赵工",
            "今日 14:00",
            "CNC-001 主轴温升异常",
            "OP-020",
            "CNC-001",
            "预计影响 2h 瓶颈设备窗口",
            "当前 CNC 精加工窗口立即冻结",
            "助手已创建待分流",
            "AI 生产助手把聊天中的异常创建意图转成现场异常处置卡。",
            [
                new AssistantPackageStepDto(
                    "异常管理",
                    "班组长 孙八",
                    "登记 CNC-001 主轴温升异常",
                    "TRACE-CHAT-ANOMALY-CNC001-TEMP-20260531",
                    null,
                    null,
                    null)
            ],
            "2026-05-31T14:25:00.000Z");
        _decisionRepoMock
            .Setup(r => r.UpsertEvidenceLinkAsync(It.IsAny<AgentEvidenceLink>(), ct))
            .Callback<AgentEvidenceLink, CancellationToken>((link, _) => capturedEvidence = link)
            .Returns(Task.CompletedTask);
        _auditLogRepoMock
            .Setup(r => r.AddAsync(It.IsAny<AuditLog>(), ct))
            .Callback<AuditLog, CancellationToken>((log, _) => capturedAudit = log)
            .Returns(Task.CompletedTask);

        var result = await _sut.UpsertAssistantAnomalyPackageAsync(package, "planner-001", ct);

        result.Should().Be(package);
        var evidence = capturedEvidence ?? throw new InvalidOperationException("Assistant anomaly evidence was not captured.");
        evidence.EvidenceType.Should().Be("AssistantAnomalyPackage");
        evidence.EvidenceKey.Should().Be("assistant-anomaly-cnc001-temperature");
        evidence.CreatedAt.Should().Be(new DateTime(2026, 5, 31, 14, 25, 0, DateTimeKind.Utc),
            "assistant anomaly packages are replayed by CreatedAt and must keep the package creation event timestamp");
        evidence.EvidenceSummary.Should().Contain("\"traceId\":\"TRACE-CHAT-ANOMALY-CNC001-TEMP-20260531\"");
        var audit = capturedAudit ?? throw new InvalidOperationException("Assistant anomaly audit was not captured.");
        audit.Action.Should().Be("AssistantAnomalyPackageUpsert");
        audit.ResourceId.Should().Be("assistant-anomaly-cnc001-temperature");
        audit.BusinessKey.Should().Be("WO-RUSH-9001 / WO-20260501");
        audit.TraceId.Should().Be("TRACE-CHAT-ANOMALY-CNC001-TEMP-20260531");
    }

    [Fact]
    public async Task UpsertAssistantEngineeringConstraintPackageAsync_ShouldPersistEventTimestampForEvidenceOrdering()
    {
        using var cts = new CancellationTokenSource();
        var ct = cts.Token;
        AgentEvidenceLink? capturedEvidence = null;
        AuditLog? capturedAudit = null;
        var package = new AssistantEngineeringConstraintPackageDto(
            "assistant-engineering-constraint-A100-6061B",
            "A100-6061B 工程约束联动包",
            "AUD-CHAT-ENG-CONSTRAINT-20260531",
            "TRACE-CHAT-ENG-CONSTRAINT-PACKAGE-20260531",
            "planner-001",
            Roles.Planner,
            "WO-RUSH-9001 / WO-20260501",
            "warning",
            "工艺工程师 周工",
            "今日 16:00",
            "BOM-A100",
            "ECN-6061B",
            "R-B200",
            "OP-090",
            "+5% OTD 恢复依赖工程确认",
            "助手已创建待工程复核",
            "AI 生产助手把 BOM/ECN/工艺约束创建为跨域工程处置包。",
            [
                new AssistantPackageStepDto(
                    "工程变更",
                    "工艺工程师 周工",
                    "确认 6061B 替代料对工艺参数的影响",
                    "TRACE-ENG-ECN-BOM-A100-6061B",
                    null,
                    null,
                    null)
            ],
            "2026-05-31T15:40:00.000Z");
        _decisionRepoMock
            .Setup(r => r.UpsertEvidenceLinkAsync(It.IsAny<AgentEvidenceLink>(), ct))
            .Callback<AgentEvidenceLink, CancellationToken>((link, _) => capturedEvidence = link)
            .Returns(Task.CompletedTask);
        _auditLogRepoMock
            .Setup(r => r.AddAsync(It.IsAny<AuditLog>(), ct))
            .Callback<AuditLog, CancellationToken>((log, _) => capturedAudit = log)
            .Returns(Task.CompletedTask);

        var result = await _sut.UpsertAssistantEngineeringConstraintPackageAsync(package, "planner-001", ct);

        result.Should().Be(package);
        var evidence = capturedEvidence ?? throw new InvalidOperationException("Assistant engineering evidence was not captured.");
        evidence.EvidenceType.Should().Be("AssistantEngineeringConstraintPackage");
        evidence.EvidenceKey.Should().Be("assistant-engineering-constraint-A100-6061B");
        evidence.CreatedAt.Should().Be(new DateTime(2026, 5, 31, 15, 40, 0, DateTimeKind.Utc),
            "assistant engineering constraint packages are replayed by CreatedAt and must keep the package creation event timestamp");
        evidence.EvidenceSummary.Should().Contain("\"traceId\":\"TRACE-CHAT-ENG-CONSTRAINT-PACKAGE-20260531\"");
        var audit = capturedAudit ?? throw new InvalidOperationException("Assistant engineering audit was not captured.");
        audit.Action.Should().Be("AssistantEngineeringConstraintPackageUpsert");
        audit.ResourceId.Should().Be("assistant-engineering-constraint-A100-6061B");
        audit.BusinessKey.Should().Be("WO-RUSH-9001 / WO-20260501");
        audit.TraceId.Should().Be("TRACE-CHAT-ENG-CONSTRAINT-PACKAGE-20260531");
    }

    private static AgentDecision CreateDecision(string id)
    {
        return new AgentDecision
        {
            Id = id,
            TriggerEventId = "trigger-001",
            BoundedContext = "Scheduling",
            DecisionType = "MultiScenario",
            Status = "PendingReview",
            RecommendedScenarioId = "scenario-001",
            AgentName = "SchedulingAgent",
            AgentVersion = "v1.5-rule-engine-baseline",
            TraceId = "trace-001",
            PromptHash = "prompt-hash",
            ContextHash = "context-hash",
            InputSummary = "Workshop=WS-001;Orders=1",
            OutputSummary = "Scenarios=1;Recommended=EDD",
            BusinessKey = "Workshop:WS-001",
            CreatedAt = new DateTime(2026, 5, 31, 8, 0, 0, DateTimeKind.Utc),
            Scenarios =
            [
                new AgentDecisionScenario
                {
                    Id = "scenario-001",
                    AgentDecisionId = id,
                    StrategyName = "EDD",
                    PriorityRule = "EDD",
                    CapacityStrategy = "LeastLoaded",
                    Objective = "due_date",
                    OtdProjection = 95,
                    UtilizationProjection = 82,
                    ChangeoverProjection = 30,
                    Explanation = "交期最早优先",
                    SacrificedObjectives = "无明显牺牲目标"
                }
            ]
        };
    }
}
