using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using MES.Application.Services;
using MES.Domain.Entities.Agent;
using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Purchase;
using MES.Domain.Entities.Quality;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Enums;
using MES.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Xunit;

namespace MES.Tests.Integration.Controllers;

[Collection("IntegrationSerial")]
public class SchedulingControllerTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly TestWebApplicationFactory _factory;

    public SchedulingControllerTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetWorkOrders_ShouldReturnPagedResult()
    {
        var response = await _client.GetAsync("/api/v1/scheduling/workorders");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<PagedResultResponse<WorkOrderResponse>>();
        result.Should().NotBeNull();
        result!.Items.Should().NotBeNull();
        result.TotalCount.Should().BeGreaterThanOrEqualTo(0);
        result.Page.Should().Be(1);
    }

    [Fact]
    public async Task GetWorkOrders_WithPaging_ShouldRespectParameters()
    {
        var response = await _client.GetAsync("/api/v1/scheduling/workorders?page=2&pageSize=5");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<PagedResultResponse<WorkOrderResponse>>();
        result!.Page.Should().Be(2);
        result.PageSize.Should().Be(5);
    }

    [Fact]
    public async Task GetWorkOrderById_WhenNotExists_ShouldReturnNotFound()
    {
        var response = await _client.GetAsync("/api/v1/scheduling/workorders/non-existent");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task CreateWorkOrder_ShouldReturnCreatedWithDto()
    {
        var request = new
        {
            OrderNumber = "WO-TEST-001",
            ProductCode = "PROD-001",
            ProductName = "Test Product",
            PlannedQuantity = 100,
            PlannedStartDate = DateTime.UtcNow,
            PlannedEndDate = DateTime.UtcNow.AddDays(7),
            WorkshopId = "ws-001",
            Priority = 10
        };

        var response = await _client.PostAsJsonAsync("/api/v1/scheduling/workorders", request);

        response.StatusCode.Should().Be(HttpStatusCode.Created, await response.Content.ReadAsStringAsync());
        var result = await response.Content.ReadFromJsonAsync<WorkOrderResponse>();
        result.Should().NotBeNull();
        result!.OrderNumber.Should().Be("WO-TEST-001");
        result.ProductCode.Should().Be("PROD-001");
        result.PlannedQuantity.Should().Be(100);
        result.Status.Should().Be("Created");
    }

    [Fact]
    public async Task CreateWorkOrder_WithMissingRequiredFields_ShouldReturnBadRequest()
    {
        var request = new { ProductName = "Missing Fields" };

        var response = await _client.PostAsJsonAsync("/api/v1/scheduling/workorders", request);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetAllPlans_ShouldReturnOkWithList()
    {
        var response = await _client.GetAsync("/api/v1/scheduling/plans");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<List<SchedulePlanResponse>>();
        result.Should().NotBeNull();
    }

    [Fact]
    public async Task GetPlanById_WhenNotExists_ShouldReturnNotFound()
    {
        var response = await _client.GetAsync("/api/v1/scheduling/plans/non-existent");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetCurrentPlan_ShouldReturnSeededCurrentPlan()
    {
        var response = await _client.GetAsync("/api/v1/scheduling/current");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<SchedulePlanResponse>();
        result.Should().NotBeNull();
        result!.Items.Should().NotBeEmpty();
    }

    [Fact]
    public async Task BatchOptimize_WithDueDate_ShouldReturnCompareResults()
    {
        var request = new
        {
            WorkshopId = "WS-001",
            Objectives = new[] { "due_date", "utilization" },
            WorkOrderIds = new[] { "WO-001", "WO-002" },
            ConsiderHistoricalData = false
        };

        var response = await _client.PostAsJsonAsync("/api/v1/scheduling/optimize-compare", request);

        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.InternalServerError);
        if (response.StatusCode != HttpStatusCode.OK) return; // AI 依赖可能不可用

        var result = await response.Content.ReadFromJsonAsync<BatchOptimizeResponse>();
        result.Should().NotBeNull();
        result!.Items.Should().NotBeEmpty();
        result.RecommendationScoreFormula.Should().NotBeNull();
        result.RecommendationScoreFormula!.Version.Should().Be("v1-weighted-kpi-40-40-20");
        result.RecommendationScoreFormula.UtilizationWeight.Should().Be(0.4);
        result.RecommendationScoreFormula.OnTimeDeliveryWeight.Should().Be(0.4);
        result.RecommendationScoreFormula.ChangeoverWeight.Should().Be(0.2);
        result.RecommendationScoreFormula.ChangeoverNormalizationMinutes.Should().Be(1000);
        result.RecommendationScoreFormula.Description.Should().Contain("利用率 40%");
        result.Items.Should().HaveCount(2);
        result.Items.Should().Contain(i => i.Objective == "due_date");
        result.Items.Should().Contain(i => i.Objective == "utilization");
        result.Items.Should().OnlyContain(i => i.RecommendationScore >= 0.0001 && i.RecommendationScore <= 1);
        result.Items.Should().OnlyContain(i => i.RecommendationScoreBreakdown != null);
        result.Items.Should().OnlyContain(i =>
            i.RecommendationScoreBreakdown!.UtilizationContribution >= 0
            && i.RecommendationScoreBreakdown.OnTimeDeliveryContribution >= 0
            && i.RecommendationScoreBreakdown.ChangeoverContribution >= 0);
    }

    [Fact]
    public async Task RescheduleItem_WhenPlanNotExists_ShouldReturnNotFound()
    {
        var request = new
        {
            PlannedStartTime = DateTime.UtcNow.AddHours(1),
            PlannedEndTime = DateTime.UtcNow.AddHours(9)
        };

        var response = await _client.PatchAsJsonAsync(
            "/api/v1/scheduling/plans/non-existent/items/non-existent", request);

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task RescheduleItem_WhenItemNotExists_ShouldReturnNotFound()
    {
        // 先创建一个排产计划
        var createResponse = await _client.PostAsJsonAsync("/api/v1/scheduling/optimize", new
        {
            WorkshopId = "WS-001",
            WorkOrderIds = new[] { "WO-001", "WO-002" },
            ConsiderHistoricalData = false
        });
        if (createResponse.StatusCode != HttpStatusCode.OK) return; // AI 依赖不可用

        var planResult = await createResponse.Content.ReadFromJsonAsync<SchedulingResultResponse>();
        planResult.Should().NotBeNull();

        var request = new
        {
            PlannedStartTime = DateTime.UtcNow.AddHours(1),
            PlannedEndTime = DateTime.UtcNow.AddHours(9)
        };

        var response = await _client.PatchAsJsonAsync(
            $"/api/v1/scheduling/plans/{planResult!.Plan.Id}/items/non-existent", request);

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task RescheduleItem_WhenSaved_ShouldPersistDraggedWindowToDatabaseAndPlanReadModel()
    {
        var planStart = new DateTime(2026, 6, 1, 8, 0, 0, DateTimeKind.Utc);
        var planEnd = planStart.AddHours(12);
        var originalStart = planStart.AddHours(1);
        var originalEnd = originalStart.AddHours(4);
        var draggedStart = planStart.AddHours(3);
        var draggedEnd = draggedStart.AddHours(4);
        var plan = SchedulePlan.Create("真实拖拽持久化计划", planStart, planEnd);
        var item = ScheduleItem.Create(
            "wo-real-drag-persist",
            "eq-real-drag-persist",
            originalStart,
            originalEnd,
            1,
            "20 分钟");
        plan.AddItem(item);

        _factory.SeedData(db =>
        {
            db.SchedulePlans.Add(plan);
        });

        var response = await _client.PatchAsJsonAsync(
            $"/api/v1/scheduling/plans/{plan.Id}/items/{item.Id}",
            new
            {
                PlannedStartTime = draggedStart,
                PlannedEndTime = draggedEnd
            });

        response.StatusCode.Should().Be(HttpStatusCode.OK, await response.Content.ReadAsStringAsync());

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
            var persisted = await db.SchedulePlans
                .AsNoTracking()
                .Include(p => p.Items)
                .SingleAsync(p => p.Id == plan.Id);
            var persistedItem = persisted.Items.Single(i => i.Id == item.Id);
            persistedItem.PlannedStartTime.Should().Be(draggedStart);
            persistedItem.PlannedEndTime.Should().Be(draggedEnd);
        }

        var getResponse = await _client.GetAsync($"/api/v1/scheduling/plans/{plan.Id}");
        getResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var readModel = await getResponse.Content.ReadFromJsonAsync<SchedulePlanResponse>();
        readModel.Should().NotBeNull();
        var readItem = readModel!.Items.Single(i => i.Id == item.Id);
        readItem.PlannedStartTime.Should().Be(draggedStart);
        readItem.PlannedEndTime.Should().Be(draggedEnd);
    }

    [Fact]
    public async Task GetPlanById_ShouldReturnItemDisplayNamesForRealGantt()
    {
        var now = new DateTime(2026, 6, 12, 8, 0, 0, DateTimeKind.Utc);
        var workOrder = WorkOrder.Create(
            "WO-LIVE-GANTT-001",
            "PROD-LIVE",
            "Live Gantt Product",
            10,
            now,
            now.AddDays(1),
            "WS-001");
        var equipment = Equipment.Create(
            "EQ-LIVE-GANTT-001",
            "Live Gantt CNC",
            "CNC",
            "WS-001",
            "Workshop A",
            100);
        var plan = SchedulePlan.Create("真实甘特展示计划", now, now.AddHours(8));
        var item = ScheduleItem.Create(
            workOrder.Id,
            equipment.Id,
            now.AddHours(1),
            now.AddHours(3),
            1,
            "20 分钟");
        plan.AddItem(item);

        _factory.SeedData(db =>
        {
            db.WorkOrders.Add(workOrder);
            db.Equipment.Add(equipment);
            db.SchedulePlans.Add(plan);
        });

        var response = await _client.GetAsync($"/api/v1/scheduling/plans/{plan.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.OK, await response.Content.ReadAsStringAsync());
        var readModel = await response.Content.ReadFromJsonAsync<SchedulePlanResponse>();
        readModel.Should().NotBeNull();
        var readItem = readModel!.Items.Single(i => i.Id == item.Id);
        readItem.WorkOrderNumber.Should().Be("WO-LIVE-GANTT-001");
        readItem.EquipmentName.Should().Be("Live Gantt CNC");
    }

    [Fact]
    public async Task AdoptionFeedback_WithEmptyPlanId_ShouldReturnValidationError()
    {
        var request = new
        {
            SchedulePlanId = "",
            WorkshopId = "WS-001",
            ReasonCategory = "manual_adjust"
        };

        var response = await _client.PostAsJsonAsync("/api/v1/scheduling/adoption-feedback", request);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task AdoptionFeedback_WithBlankReasonDetail_ShouldReturnValidationError()
    {
        var request = new
        {
            SchedulePlanId = "plan-audit-contract",
            WorkshopId = "WS-001",
            ReasonCategory = "UrgentInsertion",
            ReasonDetail = "   "
        };

        var response = await _client.PostAsJsonAsync("/api/v1/scheduling/adoption-feedback", request);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var body = await response.Content.ReadAsStringAsync();
        body.Should().Contain("修改原因说明不能为空");
    }

    [Fact]
    public async Task GetLatestAdoptionFeedback_WhenLatestRecordHasBlankReasonDetail_ShouldSkipUnauditableRecord()
    {
        var olderAuditableFeedback = new ScheduleAdoptionFeedback
        {
            SchedulePlanId = "plan-auditable",
            WorkshopId = "WS-001",
            OptimizationObjective = "balanced",
            ReasonCategory = OverrideReasonCategory.UrgentInsertion,
            ReasonDetail = "急单插入后选择综合平衡方案",
            OperatorUser = "planner",
            CreatedAt = new DateTime(2026, 6, 14, 8, 0, 0, DateTimeKind.Utc),
        };
        var latestUnauditableFeedback = new ScheduleAdoptionFeedback
        {
            SchedulePlanId = "plan-unauditable",
            WorkshopId = "WS-001",
            OptimizationObjective = "due_date",
            ReasonCategory = OverrideReasonCategory.Other,
            ReasonDetail = " ",
            OperatorUser = "planner",
            CreatedAt = new DateTime(2026, 6, 14, 9, 0, 0, DateTimeKind.Utc),
        };

        _factory.SeedData(db =>
        {
            db.ScheduleAdoptionFeedbacks.RemoveRange(db.ScheduleAdoptionFeedbacks);
            db.ScheduleAdoptionFeedbacks.AddRange(olderAuditableFeedback, latestUnauditableFeedback);
        });

        var response = await _client.GetAsync("/api/v1/scheduling/adoption-feedback/latest");

        response.StatusCode.Should().Be(HttpStatusCode.OK, await response.Content.ReadAsStringAsync());
        var latestFeedback = await response.Content.ReadFromJsonAsync<AdoptionFeedbackSnapshotResponse>();
        latestFeedback.Should().NotBeNull();
        latestFeedback!.ReasonDetail.Should().Be("急单插入后选择综合平衡方案");
        latestFeedback.ReasonCategory.Should().Be(nameof(OverrideReasonCategory.UrgentInsertion));
        latestFeedback.CategoryLabel.Should().Be("紧急插单");
        latestFeedback.ObjectiveLabel.Should().Be("综合平衡");
        latestFeedback.CreatedAt.Should().NotBe(default);
        latestFeedback.Source.Should().Be("backend");
    }

    [Fact]
    public async Task GetLatestAdoptionFeedback_ShouldReturnSeededAuditableCurrentPlanFeedback()
    {
        _factory.SeedData(db =>
        {
            var currentPlan = db.SchedulePlans
                .OrderByDescending(p => p.CreatedAt)
                .First(p => p.PlanStartDate <= DateTime.UtcNow
                    && p.PlanEndDate >= DateTime.UtcNow
                    && p.Items.Count > 0);
            db.ScheduleAdoptionFeedbacks.RemoveRange(db.ScheduleAdoptionFeedbacks);
            db.ScheduleAdoptionFeedbacks.Add(new ScheduleAdoptionFeedback
            {
                SchedulePlanId = currentPlan.Id,
                WorkshopId = "ws-001",
                OptimizationObjective = "balanced",
                ReasonCategory = OverrideReasonCategory.UrgentInsertion,
                ReasonDetail = "当前排产计划已按交付、设备负载和换型风险完成复核。",
                OperatorUser = "integration-seed",
                AiTraceId = "TRACE-INTEGRATION-SCHEDULE-CURRENT",
                InitiatedByAgent = true,
                AgentDecisionId = "agent-decision-integration-current-plan",
                AgentVersion = "integration-seed",
                CreatedAt = DateTime.UtcNow
            });
        });

        var response = await _client.GetAsync("/api/v1/scheduling/adoption-feedback/latest");

        response.StatusCode.Should().Be(HttpStatusCode.OK, await response.Content.ReadAsStringAsync());
        var latestFeedback = await response.Content.ReadFromJsonAsync<AdoptionFeedbackSnapshotResponse>();
        latestFeedback.Should().NotBeNull();
        latestFeedback!.Decision.Should().Be("accepted");
        latestFeedback.DecisionLabel.Should().Contain("Agent");
        latestFeedback.ReasonCategory.Should().Be(nameof(OverrideReasonCategory.UrgentInsertion));
        latestFeedback.CategoryLabel.Should().Be("紧急插单");
        latestFeedback.ReasonDetail.Should().Contain("当前排产计划");
        latestFeedback.ObjectiveLabel.Should().Be("综合平衡");
        latestFeedback.TraceId.Should().Be("TRACE-INTEGRATION-SCHEDULE-CURRENT");
        latestFeedback.AgentDecisionId.Should().Be("agent-decision-integration-current-plan");
        latestFeedback.Source.Should().Be("backend");
    }

    [Fact]
    public async Task GetLatestRiskSlaReview_ShouldReturnSeededAuditableReview()
    {
        var response = await _client.GetAsync("/api/v1/scheduling/risk-sla-review/latest");

        response.StatusCode.Should().Be(HttpStatusCode.OK, await response.Content.ReadAsStringAsync());
        var review = await response.Content.ReadFromJsonAsync<RiskSlaReviewResponse>();
        review.Should().NotBeNull();
        review!.Id.Should().Be("risk-sla-review-integration-current");
        review.Status.Should().Be("escalated");
        review.StatusLabel.Should().Contain("晨会");
        review.ReviewMeetingId.Should().Be("RISK-DAILY-INTEGRATION-CURRENT");
        review.TraceId.Should().Be("TRACE-RISK-SLA-INTEGRATION-CURRENT");
        review.Risks.Should().NotBeEmpty();
        review.Actions.Should().NotBeEmpty();
    }

    [Fact]
    public async Task AgentRecommend_ShouldPersistDecisionWithScenarios()
    {
        var workshopId = $"ws-agent-{Guid.NewGuid():N}";
        await CreateAgentWorkOrderAsync(workshopId, "A100", 8);
        await CreateAgentWorkOrderAsync(workshopId, "B200", 5);

        var response = await _client.PostAsJsonAsync("/api/v1/scheduling/agent/recommend", new
        {
            WorkshopId = workshopId,
            EventType = "RushOrder",
            SourceModule = "Scheduling",
            BusinessKeyType = "Workshop",
            BusinessKeyValue = workshopId,
            Severity = "Warning",
            Objective = "due_date"
        });

        response.StatusCode.Should().Be(HttpStatusCode.Created, await response.Content.ReadAsStringAsync());
        var decision = await response.Content.ReadFromJsonAsync<AgentDecisionResponse>();
        decision.Should().NotBeNull();
        decision!.BoundedContext.Should().Be("Scheduling");
        decision.Status.Should().Be("PendingReview");
        decision.Scenarios.Should().HaveCount(4);
        decision.RecommendedScenarioId.Should().NotBeNullOrWhiteSpace();

        var getResponse = await _client.GetAsync($"/api/v1/scheduling/agent/{decision.Id}");
        getResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var persisted = await getResponse.Content.ReadFromJsonAsync<AgentDecisionResponse>();
        persisted!.Scenarios.Should().HaveCount(4);

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        db.AiDecisionTraces.Should().Contain(t =>
            t.LinkedAgentDecisionId == decision.Id &&
            t.BusinessKeyType == "Workshop" &&
            t.BusinessKeyValue == workshopId &&
            !string.IsNullOrWhiteSpace(t.PromptHash) &&
            !string.IsNullOrWhiteSpace(t.ContextHash));
    }

    [Fact]
    public async Task AgentAdopt_AsNonAdmin_ShouldReturnForbiddenAndWriteAudit()
    {
        var workshopId = $"ws-agent-{Guid.NewGuid():N}";
        await CreateAgentWorkOrderAsync(workshopId, "A100", 8);

        var recommendResponse = await _client.PostAsJsonAsync("/api/v1/scheduling/agent/recommend", new
        {
            WorkshopId = workshopId,
            EventType = "ManualReview",
            SourceModule = "Scheduling",
            BusinessKeyType = "Workshop",
            BusinessKeyValue = workshopId
        });
        recommendResponse.StatusCode.Should().Be(HttpStatusCode.Created, await recommendResponse.Content.ReadAsStringAsync());
        var decision = await recommendResponse.Content.ReadFromJsonAsync<AgentDecisionResponse>();
        decision.Should().NotBeNull();

        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            $"/api/v1/scheduling/agent/{decision!.Id}/adopt");
        request.Headers.Add("X-Test-Role", "Operator");
        request.Content = JsonContent.Create(new
        {
            ScenarioId = decision.RecommendedScenarioId,
            Reason = "operator should be rejected"
        });

        var response = await _client.SendAsync(request);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);

        var auditResponse = await _client.GetAsync("/api/v1/audit-logs/?action=AgentPolicyRejected");
        auditResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var audit = await auditResponse.Content.ReadFromJsonAsync<PagedResultResponse<AuditLogResponse>>();
        audit!.Items.Should().Contain(i => i.Resource == "scheduling-agent");

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        db.AgentActionResults.Should().Contain(r =>
            r.AgentDecisionId == decision.Id &&
            r.ActionType == "Adopt" &&
            r.ResultStatus == "RejectedByPolicy" &&
            r.Role == "Operator" &&
            r.AuditLogId != null);
        db.AuditLogs.Should().Contain(l =>
            l.Action == "AgentPolicyRejected" &&
            l.ResourceId == decision.Id &&
            l.BusinessKey == $"Workshop:{workshopId}" &&
            !string.IsNullOrWhiteSpace(l.PromptHash) &&
            !string.IsNullOrWhiteSpace(l.ContextHash));
    }

    [Fact]
    public async Task AgentAdopt_AsAdmin_ShouldMarkDecisionAdopted()
    {
        var workshopId = $"ws-agent-{Guid.NewGuid():N}";
        await CreateAgentWorkOrderAsync(workshopId, "A100", 8);

        var recommendResponse = await _client.PostAsJsonAsync("/api/v1/scheduling/agent/recommend", new
        {
            WorkshopId = workshopId,
            EventType = "ManualReview",
            SourceModule = "Scheduling",
            BusinessKeyType = "Workshop",
            BusinessKeyValue = workshopId
        });
        recommendResponse.StatusCode.Should().Be(HttpStatusCode.Created, await recommendResponse.Content.ReadAsStringAsync());
        var decision = await recommendResponse.Content.ReadFromJsonAsync<AgentDecisionResponse>();
        decision.Should().NotBeNull();

        var response = await _client.PostAsJsonAsync(
            $"/api/v1/scheduling/agent/{decision!.Id}/adopt",
            new
            {
                ScenarioId = decision.RecommendedScenarioId,
                Reason = "best OTD"
            });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var adopted = await response.Content.ReadFromJsonAsync<AgentDecisionResponse>();
        adopted!.Status.Should().Be("Adopted");
        adopted.AdoptedScenarioId.Should().Be(decision.RecommendedScenarioId);

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        db.ScheduleAdoptionFeedbacks.Should().Contain(f =>
            f.AgentDecisionId == decision.Id &&
            f.InitiatedByAgent &&
            f.AiTraceId != null &&
            f.AgentVersion == "v1.5-rule-engine-baseline");
        db.AgentEvidenceLinks.Should().Contain(e =>
            e.AgentDecisionId == decision.Id &&
            e.EvidenceType == "ScheduleAdoptionFeedback" &&
            e.EvidenceSummary != null &&
            e.EvidenceSummary.Contains("accepted"));
        db.AuditLogs.Should().Contain(l =>
            l.Action == "AgentAdopt" &&
            l.ResourceId == decision.Id &&
            l.TraceId != null &&
            l.PromptHash != null &&
            l.ContextHash != null);
        db.AuditLogs.Should().Contain(l =>
            l.Action == "ScheduleAdoptionFeedbackUpsert" &&
            l.Resource == "schedule-adoption-feedback" &&
            l.BusinessKey != null &&
            l.BusinessKey.StartsWith("SchedulePlan:") &&
            l.NewValues != null &&
            l.NewValues.Contains("accepted"));

        var latestFeedbackResponse = await _client.GetAsync("/api/v1/scheduling/adoption-feedback/latest");
        latestFeedbackResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var latestFeedback = await latestFeedbackResponse.Content.ReadFromJsonAsync<AdoptionFeedbackSnapshotResponse>();
        latestFeedback!.Decision.Should().Be("accepted");
        latestFeedback.DecisionLabel.Should().NotBeNullOrWhiteSpace();
        latestFeedback.ReasonCategory.Should().NotBeNullOrWhiteSpace();
        latestFeedback.CategoryLabel.Should().NotBeNullOrWhiteSpace();
        latestFeedback.ReasonDetail.Should().NotBeNullOrWhiteSpace();
        latestFeedback.ObjectiveLabel.Should().NotBeNullOrWhiteSpace();
        latestFeedback.CreatedAt.Should().NotBe(default);
        latestFeedback.Source.Should().Be("backend");
        latestFeedback.AgentDecisionId.Should().Be(decision.Id);
        latestFeedback.TraceId.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public async Task AgentAdopt_AsPlanner_ShouldMarkDecisionAdopted()
    {
        var workshopId = $"ws-agent-{Guid.NewGuid():N}";
        await CreateAgentWorkOrderAsync(workshopId, "A100", 8);

        var recommendResponse = await _client.PostAsJsonAsync("/api/v1/scheduling/agent/recommend", new
        {
            WorkshopId = workshopId,
            EventType = "ManualReview",
            SourceModule = "Scheduling",
            BusinessKeyType = "Workshop",
            BusinessKeyValue = workshopId
        });
        recommendResponse.StatusCode.Should().Be(HttpStatusCode.Created, await recommendResponse.Content.ReadAsStringAsync());
        var decision = await recommendResponse.Content.ReadFromJsonAsync<AgentDecisionResponse>();
        decision.Should().NotBeNull();

        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            $"/api/v1/scheduling/agent/{decision!.Id}/adopt");
        request.Headers.Add("X-Test-Role", "Planner");
        request.Content = JsonContent.Create(new
        {
            ScenarioId = decision.RecommendedScenarioId,
            Reason = "planner owns scheduling execution"
        });

        var response = await _client.SendAsync(request);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var adopted = await response.Content.ReadFromJsonAsync<AgentDecisionResponse>();
        adopted!.Status.Should().Be("Adopted");
        adopted.AdoptedScenarioId.Should().Be(decision.RecommendedScenarioId);

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        db.AgentActionResults.Should().Contain(r =>
            r.AgentDecisionId == decision.Id &&
            r.ActionType == "Adopt" &&
            r.ResultStatus == "Succeeded" &&
            r.Role == "Planner" &&
            r.AuditLogId != null);
    }

    [Fact]
    public async Task AgentReject_AsAdmin_ShouldMarkDecisionRejectedAndWriteAudit()
    {
        var workshopId = $"ws-agent-{Guid.NewGuid():N}";
        await CreateAgentWorkOrderAsync(workshopId, "A100", 8);

        var recommendResponse = await _client.PostAsJsonAsync("/api/v1/scheduling/agent/recommend", new
        {
            WorkshopId = workshopId,
            EventType = "ManualReview",
            SourceModule = "Scheduling",
            BusinessKeyType = "Workshop",
            BusinessKeyValue = workshopId
        });
        recommendResponse.StatusCode.Should().Be(HttpStatusCode.Created, await recommendResponse.Content.ReadAsStringAsync());
        var decision = await recommendResponse.Content.ReadFromJsonAsync<AgentDecisionResponse>();
        decision.Should().NotBeNull();

        var response = await _client.PostAsJsonAsync(
            $"/api/v1/scheduling/agent/{decision!.Id}/reject",
            new { Reason = "planner chose manual lock window" });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var rejected = await response.Content.ReadFromJsonAsync<AgentDecisionResponse>();
        rejected!.Status.Should().Be("Rejected");

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        db.AgentActionResults.Should().Contain(r =>
            r.AgentDecisionId == decision.Id &&
            r.ActionType == "Reject" &&
            r.ResultStatus == "Succeeded" &&
            r.AuditLogId != null);
        db.AuditLogs.Should().Contain(l =>
            l.Action == "AgentReject" &&
            l.ResourceId == decision.Id &&
            l.BusinessKey == $"Workshop:{workshopId}");
    }

    [Fact]
    public async Task AgentReject_AsUnauthorizedRole_ShouldReturnForbiddenAndWritePolicyAudit()
    {
        var workshopId = $"ws-agent-{Guid.NewGuid():N}";
        await CreateAgentWorkOrderAsync(workshopId, "A100", 8);

        var recommendResponse = await _client.PostAsJsonAsync("/api/v1/scheduling/agent/recommend", new
        {
            WorkshopId = workshopId,
            EventType = "ManualReview",
            SourceModule = "Scheduling",
            BusinessKeyType = "Workshop",
            BusinessKeyValue = workshopId
        });
        recommendResponse.StatusCode.Should().Be(HttpStatusCode.Created, await recommendResponse.Content.ReadAsStringAsync());
        var decision = await recommendResponse.Content.ReadFromJsonAsync<AgentDecisionResponse>();
        decision.Should().NotBeNull();

        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            $"/api/v1/scheduling/agent/{decision!.Id}/reject");
        request.Headers.Add("X-Test-Role", "Quality");
        request.Content = JsonContent.Create(new { Reason = "quality should be rejected for scheduling execution" });

        var response = await _client.SendAsync(request);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        db.AgentActionResults.Should().Contain(r =>
            r.AgentDecisionId == decision.Id &&
            r.ActionType == "Reject" &&
            r.ResultStatus == "RejectedByPolicy" &&
            r.Role == "Quality" &&
            r.AuditLogId != null);
    }

    [Fact]
    public async Task AgentDecision_ShouldRemainQueryableFromNewClient()
    {
        var workshopId = $"ws-agent-{Guid.NewGuid():N}";
        await CreateAgentWorkOrderAsync(workshopId, "A100", 8);

        var recommendResponse = await _client.PostAsJsonAsync("/api/v1/scheduling/agent/recommend", new
        {
            WorkshopId = workshopId,
            EventType = "ManualReview",
            SourceModule = "Scheduling",
            BusinessKeyType = "Workshop",
            BusinessKeyValue = workshopId
        });
        recommendResponse.StatusCode.Should().Be(HttpStatusCode.Created, await recommendResponse.Content.ReadAsStringAsync());
        var decision = await recommendResponse.Content.ReadFromJsonAsync<AgentDecisionResponse>();
        decision.Should().NotBeNull();

        using var client = _factory.CreateClient();
        var getResponse = await client.GetAsync($"/api/v1/scheduling/agent/{decision!.Id}");
        getResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var persisted = await getResponse.Content.ReadFromJsonAsync<AgentDecisionResponse>();
        persisted!.Id.Should().Be(decision.Id);
        persisted.Scenarios.Should().HaveCount(4);
    }

    [Fact]
    public async Task SchedulerAgentEventHandler_ShouldCreateMaterialShortageDecision()
    {
        var workshopId = $"ws-agent-{Guid.NewGuid():N}";
        var materialCode = $"MAT-LOW-{Guid.NewGuid():N}";
        await CreateAgentWorkOrderAsync(workshopId, "A100", 5);

        _factory.SeedData(db =>
        {
            db.Materials.Add(Material.Create(
                materialCode,
                "低库存测试料",
                "PCS",
                safetyStock: 100,
                availableQuantity: 20));
        });

        var handler = new SchedulerAgentEventHandler(
            _factory.Services.GetRequiredService<IServiceScopeFactory>(),
            Options.Create(new SchedulerAgentOptions()),
            NullLogger<SchedulerAgentEventHandler>.Instance);

        await handler.PollOnceAsync(CancellationToken.None);

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        db.AgentTriggerEvents.Should().Contain(e =>
            e.EventType == "MaterialShortage" &&
            e.SourceModule == "Inventory" &&
            e.BusinessKeyType == "WorkshopMaterial" &&
            e.BusinessKeyValue == $"{workshopId}:{materialCode}");
        db.AgentDecisions.Should().Contain(d =>
            d.BusinessKey == $"WorkshopMaterial:{workshopId}:{materialCode}" &&
            d.AgentName == "SchedulingAgent");
    }

    [Fact]
    public async Task SchedulerAgentEventHandler_ShouldCreateNewWorkOrderDecision()
    {
        var workshopId = $"ws-agent-{Guid.NewGuid():N}";
        await CreateAgentWorkOrderAsync(workshopId, "A100", 5);

        var handler = new SchedulerAgentEventHandler(
            _factory.Services.GetRequiredService<IServiceScopeFactory>(),
            Options.Create(new SchedulerAgentOptions()),
            NullLogger<SchedulerAgentEventHandler>.Instance);

        await handler.PollOnceAsync(CancellationToken.None);

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        db.AgentTriggerEvents.Should().Contain(e =>
            e.EventType == "NewWorkOrder" &&
            e.SourceModule == "Scheduling" &&
            e.BusinessKeyType == "Workshop" &&
            e.BusinessKeyValue == workshopId);
        db.AgentDecisions.Should().Contain(d =>
            d.BusinessKey == $"Workshop:{workshopId}" &&
            d.AgentName == "SchedulingAgent");
    }

    [Fact]
    public async Task SchedulerAgentEventHandler_ShouldCreateRushOrderDecision()
    {
        var workshopId = $"ws-agent-{Guid.NewGuid():N}";
        await CreateAgentWorkOrderAsync(workshopId, "A100", 9);

        var handler = new SchedulerAgentEventHandler(
            _factory.Services.GetRequiredService<IServiceScopeFactory>(),
            Options.Create(new SchedulerAgentOptions()),
            NullLogger<SchedulerAgentEventHandler>.Instance);

        await handler.PollOnceAsync(CancellationToken.None);

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        db.AgentTriggerEvents.Should().Contain(e =>
            e.EventType == "RushOrder" &&
            e.SourceModule == "Scheduling" &&
            e.BusinessKeyType == "Workshop" &&
            e.BusinessKeyValue == workshopId);
        db.AgentDecisions.Should().Contain(d =>
            d.BusinessKey == $"Workshop:{workshopId}" &&
            d.AgentName == "SchedulingAgent");
    }

    [Fact]
    public async Task SchedulerAgentEventHandler_ShouldCreateEquipmentFailureDecision()
    {
        var workshopId = $"ws-agent-{Guid.NewGuid():N}";
        var equipmentCode = $"CNC-FAULT-{Guid.NewGuid():N}";
        await CreateAgentWorkOrderAsync(workshopId, "A100", 5);

        string equipmentId = string.Empty;
        _factory.SeedData(db =>
        {
            var equipment = Equipment.Create(
                equipmentCode,
                "故障测试设备",
                "CNC",
                workshopId,
                "测试车间",
                100);
            equipment.SetIdle();
            equipment.SetFault();
            equipmentId = equipment.Id;
            db.Equipment.Add(equipment);
        });

        var handler = new SchedulerAgentEventHandler(
            _factory.Services.GetRequiredService<IServiceScopeFactory>(),
            Options.Create(new SchedulerAgentOptions()),
            NullLogger<SchedulerAgentEventHandler>.Instance);

        await handler.PollOnceAsync(CancellationToken.None);

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        db.AgentTriggerEvents.Should().Contain(e =>
            e.EventType == "EquipmentFailure" &&
            e.SourceModule == "Equipment" &&
            e.BusinessKeyType == "Equipment" &&
            e.BusinessKeyValue == equipmentId);
        db.AgentDecisions.Should().Contain(d =>
            d.BusinessKey == $"Equipment:{equipmentId}" &&
            d.AgentName == "SchedulingAgent");
    }

    [Theory]
    [InlineData("Quality", "execute-quality-disposition", "ExecuteQualityDisposition")]
    [InlineData("Purchase", "execute-purchase-action", "ExecutePurchaseAction")]
    [InlineData("Maintenance", "execute-maintenance-action", "ExecuteMaintenanceAction")]
    public async Task AgentExecuteCrossDomain_AsAuthorizedRole_ShouldSucceedAndAudit(
        string role, string endpointSuffix, string actionType)
    {
        var workshopId = $"ws-agent-{Guid.NewGuid():N}";
        await CreateAgentWorkOrderAsync(workshopId, "A100", 8);

        var recommendResponse = await _client.PostAsJsonAsync("/api/v1/scheduling/agent/recommend", new
        {
            WorkshopId = workshopId,
            EventType = "ManualReview",
            SourceModule = "Scheduling",
            BusinessKeyType = "Workshop",
            BusinessKeyValue = workshopId
        });
        recommendResponse.StatusCode.Should().Be(HttpStatusCode.Created, await recommendResponse.Content.ReadAsStringAsync());
        var decision = await recommendResponse.Content.ReadFromJsonAsync<AgentDecisionResponse>();
        decision.Should().NotBeNull();

        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            $"/api/v1/scheduling/agent/{decision!.Id}/{endpointSuffix}");
        request.Headers.Add("X-Test-Role", role);
        request.Content = JsonContent.Create(new
        {
            ActionName = $"{role}-{endpointSuffix}",
            Reason = $"{role} executes {actionType}",
            Payload = new Dictionary<string, object> { ["sample"] = "value" }
        });

        var response = await _client.SendAsync(request);
        response.StatusCode.Should().Be(HttpStatusCode.OK, await response.Content.ReadAsStringAsync());

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        db.AgentActionResults.Should().Contain(r =>
            r.AgentDecisionId == decision.Id &&
            r.ActionType == actionType &&
            r.ResultStatus == "Succeeded" &&
            r.Role == role &&
            r.AuditLogId != null);
        db.AuditLogs.Should().Contain(l =>
            l.Action == "Agent" + actionType &&
            l.ResourceId == decision.Id &&
            l.BusinessKey == $"Workshop:{workshopId}");
    }

    [Theory]
    [InlineData("Operator", "execute-quality-disposition", "ExecuteQualityDisposition")]
    [InlineData("Operator", "execute-purchase-action", "ExecutePurchaseAction")]
    [InlineData("Operator", "execute-maintenance-action", "ExecuteMaintenanceAction")]
    [InlineData("Planner", "execute-quality-disposition", "ExecuteQualityDisposition")]
    [InlineData("Planner", "execute-purchase-action", "ExecutePurchaseAction")]
    [InlineData("Planner", "execute-maintenance-action", "ExecuteMaintenanceAction")]
    [InlineData("Quality", "execute-purchase-action", "ExecutePurchaseAction")]
    [InlineData("Quality", "execute-maintenance-action", "ExecuteMaintenanceAction")]
    [InlineData("Purchase", "execute-quality-disposition", "ExecuteQualityDisposition")]
    [InlineData("Purchase", "execute-maintenance-action", "ExecuteMaintenanceAction")]
    [InlineData("Maintenance", "execute-quality-disposition", "ExecuteQualityDisposition")]
    [InlineData("Maintenance", "execute-purchase-action", "ExecutePurchaseAction")]
    public async Task AgentExecuteCrossDomain_AsUnauthorizedRole_ShouldReturnForbiddenAndWritePolicyAudit(
        string role, string endpointSuffix, string actionType)
    {
        var workshopId = $"ws-agent-{Guid.NewGuid():N}";
        await CreateAgentWorkOrderAsync(workshopId, "A100", 8);

        var recommendResponse = await _client.PostAsJsonAsync("/api/v1/scheduling/agent/recommend", new
        {
            WorkshopId = workshopId,
            EventType = "ManualReview",
            SourceModule = "Scheduling",
            BusinessKeyType = "Workshop",
            BusinessKeyValue = workshopId
        });
        recommendResponse.StatusCode.Should().Be(HttpStatusCode.Created, await recommendResponse.Content.ReadAsStringAsync());
        var decision = await recommendResponse.Content.ReadFromJsonAsync<AgentDecisionResponse>();
        decision.Should().NotBeNull();

        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            $"/api/v1/scheduling/agent/{decision!.Id}/{endpointSuffix}");
        request.Headers.Add("X-Test-Role", role);
        request.Content = JsonContent.Create(new
        {
            ActionName = "denied",
            Reason = $"{role} should not execute {actionType}"
        });

        var response = await _client.SendAsync(request);
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        db.AgentActionResults.Should().Contain(r =>
            r.AgentDecisionId == decision.Id &&
            r.ActionType == actionType &&
            r.ResultStatus == "RejectedByPolicy" &&
            r.Role == role &&
            r.AuditLogId != null);
        db.AuditLogs.Should().Contain(l =>
            l.Action == "AgentPolicyRejected" &&
            l.ResourceId == decision.Id &&
            l.BusinessKey == $"Workshop:{workshopId}");
    }

    [Theory]
    [InlineData("execute-quality-disposition", "ExecuteQualityDisposition")]
    [InlineData("execute-purchase-action", "ExecutePurchaseAction")]
    [InlineData("execute-maintenance-action", "ExecuteMaintenanceAction")]
    public async Task AgentExecuteCrossDomain_AsAdmin_ShouldSucceedForEveryAction(
        string endpointSuffix, string actionType)
    {
        var workshopId = $"ws-agent-{Guid.NewGuid():N}";
        await CreateAgentWorkOrderAsync(workshopId, "A100", 8);

        var recommendResponse = await _client.PostAsJsonAsync("/api/v1/scheduling/agent/recommend", new
        {
            WorkshopId = workshopId,
            EventType = "ManualReview",
            SourceModule = "Scheduling",
            BusinessKeyType = "Workshop",
            BusinessKeyValue = workshopId
        });
        recommendResponse.StatusCode.Should().Be(HttpStatusCode.Created, await recommendResponse.Content.ReadAsStringAsync());
        var decision = await recommendResponse.Content.ReadFromJsonAsync<AgentDecisionResponse>();
        decision.Should().NotBeNull();

        var response = await _client.PostAsJsonAsync(
            $"/api/v1/scheduling/agent/{decision!.Id}/{endpointSuffix}",
            new
            {
                ActionName = $"admin-{endpointSuffix}",
                Reason = "admin executes any cross-domain action"
            });
        response.StatusCode.Should().Be(HttpStatusCode.OK, await response.Content.ReadAsStringAsync());

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        db.AgentActionResults.Should().Contain(r =>
            r.AgentDecisionId == decision.Id &&
            r.ActionType == actionType &&
            r.ResultStatus == "Succeeded" &&
            r.Role == "Admin" &&
            r.AuditLogId != null);
    }

    [Fact]
    public async Task AgentExecuteMaintenanceAction_WithEquipmentPayload_ShouldUpdateEquipmentStatusAndAuditBusinessWrite()
    {
        var workshopId = $"ws-agent-{Guid.NewGuid():N}";
        var equipmentCode = $"CNC-MAINT-{Guid.NewGuid():N}";
        await CreateAgentWorkOrderAsync(workshopId, "A100", 8);

        string equipmentId = string.Empty;
        _factory.SeedData(db =>
        {
            var equipment = Equipment.Create(
                equipmentCode,
                "Agent 维护执行测试设备",
                "CNC",
                workshopId,
                "测试车间",
                100);
            equipmentId = equipment.Id;
            db.Equipment.Add(equipment);
        });

        var recommendResponse = await _client.PostAsJsonAsync("/api/v1/scheduling/agent/recommend", new
        {
            WorkshopId = workshopId,
            EventType = "EquipmentFailure",
            SourceModule = "Equipment",
            BusinessKeyType = "Equipment",
            BusinessKeyValue = equipmentId
        });
        recommendResponse.StatusCode.Should().Be(HttpStatusCode.Created, await recommendResponse.Content.ReadAsStringAsync());
        var decision = await recommendResponse.Content.ReadFromJsonAsync<AgentDecisionResponse>();
        decision.Should().NotBeNull();

        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            $"/api/v1/scheduling/agent/{decision!.Id}/execute-maintenance-action");
        request.Headers.Add("X-Test-Role", "Maintenance");
        request.Content = JsonContent.Create(new
        {
            ActionName = "open-maintenance-window",
            Reason = "Agent identified spindle vibration risk",
            Payload = new Dictionary<string, object>
            {
                ["equipmentId"] = equipmentId,
                ["targetStatus"] = "Maintenance"
            }
        });

        var response = await _client.SendAsync(request);
        response.StatusCode.Should().Be(HttpStatusCode.OK, await response.Content.ReadAsStringAsync());

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        db.Equipment.Single(e => e.Id == equipmentId).Status.Should().Be(EquipmentStatus.Maintenance);
        db.AgentActionResults.Should().Contain(r =>
            r.AgentDecisionId == decision.Id &&
            r.ActionType == "ExecuteMaintenanceAction" &&
            r.ResultStatus == "Succeeded" &&
            r.Role == "Maintenance" &&
            r.AuditLogId != null &&
            r.ResultPayloadJson.Contains("\"businessWrite\"", StringComparison.OrdinalIgnoreCase) &&
            r.ResultPayloadJson.Contains(equipmentId, StringComparison.OrdinalIgnoreCase));
        db.AuditLogs.Should().Contain(l =>
            l.Action == "AgentExecuteMaintenanceAction" &&
            l.ResourceId == decision.Id &&
            l.BusinessKey == $"Equipment:{equipmentId}" &&
            l.NewValues != null &&
            l.NewValues.Contains(equipmentId, StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task AgentExecutePurchaseAction_WithReceiptPayload_ShouldReceivePurchaseOrderAndAuditBusinessWrite()
    {
        var workshopId = $"ws-agent-{Guid.NewGuid():N}";
        var materialCode = $"MAT-AGENT-{Guid.NewGuid():N}";
        await CreateAgentWorkOrderAsync(workshopId, "A100", 8);

        string purchaseOrderId = string.Empty;
        _factory.SeedData(db =>
        {
            var order = new PurchaseOrder(
                $"PO-AGENT-{Guid.NewGuid():N}",
                "Agent 测试供应商",
                "13800000000",
                DateTime.UtcNow.AddDays(3),
                "Agent purchase receipt test",
                "test");
            order.AddItem(new PurchaseOrderLineItem
            {
                MaterialCode = materialCode,
                MaterialName = "Agent 测试物料",
                Unit = "PCS",
                Quantity = 10,
                UnitPrice = 1,
            });
            order.Submit();
            order.Confirm();
            purchaseOrderId = order.Id;
            db.PurchaseOrders.Add(order);
        });

        var decision = await CreateAgentDecisionAsync(workshopId, "MaterialShortage", "Inventory", "PurchaseOrder", purchaseOrderId);

        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            $"/api/v1/scheduling/agent/{decision.Id}/execute-purchase-action");
        request.Headers.Add("X-Test-Role", "Purchase");
        request.Content = JsonContent.Create(new
        {
            ActionName = "receive-expedited-material",
            Reason = "Agent confirmed expedited supply arrival",
            Payload = new Dictionary<string, object>
            {
                ["purchaseOrderId"] = purchaseOrderId,
                ["materialCode"] = materialCode,
                ["quantity"] = 10
            }
        });

        var response = await _client.SendAsync(request);
        response.StatusCode.Should().Be(HttpStatusCode.OK, await response.Content.ReadAsStringAsync());

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        var order = db.PurchaseOrders.Include(o => o.Items).Single(o => o.Id == purchaseOrderId);
        order.Status.Should().Be(PurchaseOrderStatus.Completed);
        order.Items.Single(i => i.MaterialCode == materialCode).ReceivedQuantity.Should().Be(10);
        db.AgentActionResults.Should().Contain(r =>
            r.AgentDecisionId == decision.Id &&
            r.ActionType == "ExecutePurchaseAction" &&
            r.ResultStatus == "Succeeded" &&
            r.Role == "Purchase" &&
            r.ResultPayloadJson.Contains("\"businessWrite\"", StringComparison.OrdinalIgnoreCase) &&
            r.ResultPayloadJson.Contains(purchaseOrderId, StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task AgentExecuteQualityDisposition_WithInspectionPayload_ShouldRecordDefectAndAuditBusinessWrite()
    {
        var workshopId = $"ws-agent-{Guid.NewGuid():N}";
        await CreateAgentWorkOrderAsync(workshopId, "A100", 8);

        string inspectionId = string.Empty;
        _factory.SeedData(db =>
        {
            var inspection = QualityInspection.Create(
                $"WO-QA-{Guid.NewGuid():N}",
                "A100",
                "OP-20",
                "Torque",
                10,
                10,
                0,
                "qa-agent",
                InspectionResult.Pass);
            inspectionId = inspection.Id;
            db.QualityInspections.Add(inspection);
        });

        var decision = await CreateAgentDecisionAsync(workshopId, "QualityRework", "Quality", "Inspection", inspectionId);

        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            $"/api/v1/scheduling/agent/{decision.Id}/execute-quality-disposition");
        request.Headers.Add("X-Test-Role", "Quality");
        request.Content = JsonContent.Create(new
        {
            ActionName = "record-rework-defect",
            Reason = "Agent found torque drift in rework sample",
            Payload = new Dictionary<string, object>
            {
                ["inspectionId"] = inspectionId,
                ["defectType"] = "TorqueDrift",
                ["quantity"] = 2,
                ["severity"] = "High",
                ["correctiveAction"] = "Hold batch and rework OP-20"
            }
        });

        var response = await _client.SendAsync(request);
        response.StatusCode.Should().Be(HttpStatusCode.OK, await response.Content.ReadAsStringAsync());

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        var inspection = db.QualityInspections.Single(i => i.Id == inspectionId);
        inspection.Result.Should().Be(InspectionResult.Fail);
        inspection.DefectQuantity.Should().Be(2);
        db.AgentActionResults.Should().Contain(r =>
            r.AgentDecisionId == decision.Id &&
            r.ActionType == "ExecuteQualityDisposition" &&
            r.ResultStatus == "Succeeded" &&
            r.Role == "Quality" &&
            r.ResultPayloadJson.Contains("\"businessWrite\"", StringComparison.OrdinalIgnoreCase) &&
            r.ResultPayloadJson.Contains(inspectionId, StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task OtdEvidenceApi_ShouldUpsertAndQueryBackendEvidence()
    {
        var evidenceId = $"otd-evidence-{Guid.NewGuid():N}";
        var request = new
        {
            Id = evidenceId,
            Stage = "采购齐套",
            Title = "加急物料已到货",
            Summary = "采购 Agent 执行收货后，缺料风险关闭。",
            Object = "WO-AGENT-OTD",
            Source = "Agent execute purchase action",
            TraceId = $"TRACE-{Guid.NewGuid():N}",
            SourceTraceId = "agent-decision-test",
            Status = "ready",
            StatusLabel = "已齐套",
            CreatedAt = DateTime.UtcNow
        };

        var upsertResponse = await _client.PostAsJsonAsync("/api/v1/scheduling/otd-evidence", request);
        upsertResponse.StatusCode.Should().Be(HttpStatusCode.OK, await upsertResponse.Content.ReadAsStringAsync());

        var queryResponse = await _client.GetAsync("/api/v1/scheduling/otd-evidence?take=10");
        queryResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var records = await queryResponse.Content.ReadFromJsonAsync<List<OtdEvidenceChainItemResponse>>();
        records.Should().Contain(r =>
            r.Id == evidenceId &&
            r.Stage == "采购齐套" &&
            r.Status == "ready");

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        db.AgentEvidenceLinks.Should().Contain(e =>
            e.EvidenceType == "OtdEvidenceChain" &&
            e.EvidenceKey == evidenceId &&
            e.EvidenceSummary != null &&
            e.EvidenceSummary.Contains(evidenceId, StringComparison.OrdinalIgnoreCase));
        db.AuditLogs.Should().Contain(l =>
            l.Action == "OtdEvidenceUpsert" &&
            l.ResourceId == evidenceId);
    }

    [Fact]
    public async Task EquipmentEvidenceApi_ShouldUpsertQueryAndAuditDowntimeAndCustomerFault()
    {
        var equipmentCode = $"CNC-EQ-{Guid.NewGuid():N}";
        var downtimeRequest = new
        {
            EquipmentCode = equipmentCode,
            EquipmentName = "Agent 设备证据测试机",
            DowntimeHours = 4m,
            AffectedOrders = "WO-EQ-001 / WO-EQ-002",
            AlternativeEquipment = "CNC-002 / CNC-003",
            MaintenanceWindow = "今日夜班 22:00-02:00",
            ProtectionStrategy = "保护急单并合并同材质批次",
            CreatedAt = DateTime.UtcNow,
        };

        var downtimeUpsert = await _client.PostAsJsonAsync("/api/v1/scheduling/equipment-downtime", downtimeRequest);
        downtimeUpsert.StatusCode.Should().Be(HttpStatusCode.OK, await downtimeUpsert.Content.ReadAsStringAsync());

        var downtimeQuery = await _client.GetAsync("/api/v1/scheduling/equipment-downtime/latest");
        downtimeQuery.StatusCode.Should().Be(HttpStatusCode.OK);
        var downtime = await downtimeQuery.Content.ReadFromJsonAsync<EquipmentDowntimeEventResponse>();
        downtime.Should().NotBeNull();
        downtime!.EquipmentCode.Should().Be(equipmentCode);
        downtime.AffectedOrders.Should().Contain("WO-EQ-001");

        var batchId = $"IMP-POC-EQ-{Guid.NewGuid():N}";
        var faultRequest = new
        {
            BatchId = batchId,
            FileName = "客户真实设备故障样例.csv",
            Source = "客户设备联网平台 / 点检历史导出",
            EquipmentCode = equipmentCode,
            FaultSamples = 12,
            AffectedOrders = "WO-EQ-001 / WO-EQ-002",
            DowntimeHours = 4m,
            CapturedSignals = new[] { "主轴振动", "轴承温度", "维修工单" },
            PreparedAt = DateTime.UtcNow,
        };

        var faultUpsert = await _client.PostAsJsonAsync("/api/v1/scheduling/customer-equipment-fault", faultRequest);
        faultUpsert.StatusCode.Should().Be(HttpStatusCode.OK, await faultUpsert.Content.ReadAsStringAsync());

        var faultQuery = await _client.GetAsync("/api/v1/scheduling/customer-equipment-fault/latest");
        faultQuery.StatusCode.Should().Be(HttpStatusCode.OK);
        var fault = await faultQuery.Content.ReadFromJsonAsync<CustomerEquipmentFaultEvidenceResponse>();
        fault.Should().NotBeNull();
        fault!.BatchId.Should().Be(batchId);
        fault.CapturedSignals.Should().Contain("主轴振动");

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        db.AgentEvidenceLinks.Should().Contain(e =>
            e.EvidenceType == "EquipmentDowntimeEvent" &&
            e.EvidenceKey == equipmentCode &&
            e.EvidenceSummary != null &&
            e.EvidenceSummary.Contains(equipmentCode, StringComparison.OrdinalIgnoreCase));
        db.AgentEvidenceLinks.Should().Contain(e =>
            e.EvidenceType == "CustomerEquipmentFaultEvidence" &&
            e.EvidenceKey == batchId &&
            e.EvidenceSummary != null &&
            e.EvidenceSummary.Contains(batchId, StringComparison.OrdinalIgnoreCase));
        db.AuditLogs.Should().Contain(l =>
            l.Action == "EquipmentDowntimeUpsert" &&
            l.ResourceId == equipmentCode);
        db.AuditLogs.Should().Contain(l =>
            l.Action == "CustomerEquipmentFaultUpsert" &&
            l.ResourceId == batchId);
    }

    [Fact]
    public async Task ShortageKittingApi_ShouldUpsertQueryAndAuditBackendEvidence()
    {
        var materialCode = $"MAT-KIT-{Guid.NewGuid():N}";
        var workOrderNumber = $"WO-KIT-{Guid.NewGuid():N}";
        var request = new
        {
            MaterialCode = materialCode,
            MaterialName = "Agent 齐套测试物料",
            WorkOrderNumber = workOrderNumber,
            AffectedOrders = workOrderNumber,
            RequiredQuantity = 64m,
            AvailableQuantity = 45m,
            InboundQuantity = 20m,
            ShortageQuantity = 19m,
            Window = "今天缺",
            Suggestion = "采购加急；替代料工程确认；先排不缺料工序",
            CreatedAt = DateTime.UtcNow,
        };

        var upsertResponse = await _client.PostAsJsonAsync("/api/v1/scheduling/shortage-kitting", request);
        upsertResponse.StatusCode.Should().Be(HttpStatusCode.OK, await upsertResponse.Content.ReadAsStringAsync());

        var queryResponse = await _client.GetAsync("/api/v1/scheduling/shortage-kitting/latest");
        queryResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var latest = await queryResponse.Content.ReadFromJsonAsync<ShortageKittingEventResponse>();
        latest.Should().NotBeNull();
        latest!.MaterialCode.Should().Be(materialCode);
        latest.WorkOrderNumber.Should().Be(workOrderNumber);
        latest.ShortageQuantity.Should().Be(19m);

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        db.AgentEvidenceLinks.Should().Contain(e =>
            e.EvidenceType == "ShortageKittingEvent" &&
            e.EvidenceKey == $"{workOrderNumber}:{materialCode}" &&
            e.EvidenceSummary != null &&
            e.EvidenceSummary.Contains(materialCode, StringComparison.OrdinalIgnoreCase));
        db.AuditLogs.Should().Contain(l =>
            l.Action == "ShortageKittingUpsert" &&
            l.ResourceId == $"{workOrderNumber}:{materialCode}");
    }

    [Fact]
    public async Task ShortageRiskResolutionApi_ShouldUpsertQueryAndAuditBackendEvidence()
    {
        var materialCode = $"MAT-RES-{Guid.NewGuid():N}";
        var sourceOrderNumber = $"PO-RES-{Guid.NewGuid():N}";
        var request = new
        {
            MaterialCode = materialCode,
            MaterialName = "Agent 缺料闭环测试物料",
            AffectedOrders = "WO-RES-001 / WO-RES-002",
            SourceOrderNumber = sourceOrderNumber,
            ReceivedQuantity = 20m,
            Unit = "PCS",
            AvailableQuantity = 65m,
            ResolvedAt = DateTime.UtcNow,
            Message = "加急采购收货后缺料风险下降，可释放排产复核。",
        };

        var upsertResponse = await _client.PostAsJsonAsync("/api/v1/scheduling/shortage-risk-resolution", request);
        upsertResponse.StatusCode.Should().Be(HttpStatusCode.OK, await upsertResponse.Content.ReadAsStringAsync());

        var queryResponse = await _client.GetAsync("/api/v1/scheduling/shortage-risk-resolution/latest");
        queryResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var latest = await queryResponse.Content.ReadFromJsonAsync<ShortageRiskResolutionResponse>();
        latest.Should().NotBeNull();
        latest!.MaterialCode.Should().Be(materialCode);
        latest.SourceOrderNumber.Should().Be(sourceOrderNumber);
        latest.ReceivedQuantity.Should().Be(20m);

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        db.AgentEvidenceLinks.Should().Contain(e =>
            e.EvidenceType == "ShortageRiskResolution" &&
            e.EvidenceKey == $"{sourceOrderNumber}:{materialCode}" &&
            e.EvidenceSummary != null &&
            e.EvidenceSummary.Contains(materialCode, StringComparison.OrdinalIgnoreCase));
        db.AuditLogs.Should().Contain(l =>
            l.Action == "ShortageRiskResolutionUpsert" &&
            l.ResourceId == $"{sourceOrderNumber}:{materialCode}");
    }

    [Fact]
    public async Task BomKittingPackageApi_ShouldUpsertQueryAndAuditBackendEvidence()
    {
        var packageId = $"bom-kitting-package-{Guid.NewGuid():N}";
        var workOrderNumber = $"WO-BOM-KIT-{Guid.NewGuid():N}";
        var request = new
        {
            Id = packageId,
            BomCode = "BOM-A100",
            BomVersion = "V1.0",
            ProductName = "Agent BOM 齐套测试产品",
            WorkOrderNumber = workOrderNumber,
            ScheduleWindow = "2026-05-20 14:00-22:00",
            StatusLabel = "待库存齐套",
            Owner = "计划员 李工 / 物控 王工",
            AuditId = $"AUD-BOM-KIT-{Guid.NewGuid():N}",
            TraceId = $"TRACE-BOM-KIT-{Guid.NewGuid():N}",
            CreatedAt = DateTime.UtcNow,
            Summary = "BOM 展开后发现关键物料缺口，进入排产复核。",
            Items = new[]
            {
                new
                {
                    MaterialCode = "M-AL-6061",
                    MaterialName = "铝合金 6061",
                    RequiredQuantity = 64m,
                    AvailableQuantity = 45m,
                    InboundQuantity = 20m,
                    ShortageQuantity = 19m,
                    Unit = "件",
                    Action = "采购加急；替代料工程确认",
                },
                new
                {
                    MaterialCode = "M-SEAL-20",
                    MaterialName = "密封圈 20",
                    RequiredQuantity = 32m,
                    AvailableQuantity = 1300m,
                    InboundQuantity = 0m,
                    ShortageQuantity = 0m,
                    Unit = "件",
                    Action = "可直接齐套",
                },
            },
        };

        var upsertResponse = await _client.PostAsJsonAsync("/api/v1/scheduling/bom-kitting-package", request);
        upsertResponse.StatusCode.Should().Be(HttpStatusCode.OK, await upsertResponse.Content.ReadAsStringAsync());

        var queryResponse = await _client.GetAsync("/api/v1/scheduling/bom-kitting-package/latest");
        queryResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var latest = await queryResponse.Content.ReadFromJsonAsync<BomKittingPackageResponse>();
        latest.Should().NotBeNull();
        latest!.Id.Should().Be(packageId);
        latest.WorkOrderNumber.Should().Be(workOrderNumber);
        latest.Items.Should().Contain(item =>
            item.MaterialCode == "M-AL-6061" &&
            item.ShortageQuantity == 19m);

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        db.AgentEvidenceLinks.Should().Contain(e =>
            e.EvidenceType == "BomKittingPackage" &&
            e.EvidenceKey == packageId &&
            e.EvidenceSummary != null &&
            e.EvidenceSummary.Contains(workOrderNumber, StringComparison.OrdinalIgnoreCase));
        db.AuditLogs.Should().Contain(l =>
            l.Action == "BomKittingPackageUpsert" &&
            l.ResourceId == packageId);
    }

    [Fact]
    public async Task SupplyRiskApi_ShouldUpsertQueryAndAuditEscalationAndSupplierDecision()
    {
        var materialCode = $"MAT-SUP-{Guid.NewGuid():N}";
        var purchaseOrderNumber = $"PO-SUP-{Guid.NewGuid():N}";
        var escalationRequest = new
        {
            PurchaseOrderNumber = purchaseOrderNumber,
            MaterialCode = materialCode,
            MaterialName = "Agent 供应风险测试物料",
            SupplierName = "南方钢材集团",
            OriginalDeliveryDate = DateTime.UtcNow.Date.AddDays(2),
            PromisedDeliveryDate = DateTime.UtcNow.Date.AddDays(5),
            DelayDays = 3,
            AffectedOrders = "WO-SUP-001 / WO-SUP-002",
            AlternateSupplierName = "华东快供二厂",
            AlternatePromiseDate = "2026-05-24",
            Decision = "alternate_received",
            StatusLabel = "替代已到货",
            AuditId = $"AUD-SUP-{Guid.NewGuid():N}",
            TraceId = $"TRACE-SUP-{Guid.NewGuid():N}",
            Message = "供应延期已升级并锁定替代供应商。",
            CreatedAt = DateTime.UtcNow,
            ReceivedAt = DateTime.UtcNow,
            ReceivedQuantity = 180m,
            ReceiptAuditId = $"AUD-SUP-RECEIPT-{Guid.NewGuid():N}",
            ReceiptTraceId = $"TRACE-SUP-RECEIPT-{Guid.NewGuid():N}",
            ReceiptMessage = "替代供应商已到货，供应风险关闭。",
        };

        var escalationUpsert = await _client.PostAsJsonAsync("/api/v1/scheduling/supply-risk-escalation", escalationRequest);
        escalationUpsert.StatusCode.Should().Be(HttpStatusCode.OK, await escalationUpsert.Content.ReadAsStringAsync());

        var escalationQuery = await _client.GetAsync("/api/v1/scheduling/supply-risk-escalation/latest");
        escalationQuery.StatusCode.Should().Be(HttpStatusCode.OK);
        var escalation = await escalationQuery.Content.ReadFromJsonAsync<SupplyRiskEscalationResponse>();
        escalation.Should().NotBeNull();
        escalation!.MaterialCode.Should().Be(materialCode);
        escalation.Decision.Should().Be("alternate_received");
        escalation.ReceiptMessage.Should().Contain("供应风险关闭");

        var decisionRequest = new
        {
            MaterialCode = materialCode,
            MaterialName = "Agent 供应风险测试物料",
            AffectedOrders = "WO-SUP-001 / WO-SUP-002",
            SelectedSupplierName = "华东快供二厂",
            SelectedPromiseDate = "2026-05-24 10:00",
            SelectedPerformanceScore = 96m,
            SelectedOnTimeRate = 98m,
            SelectedQuotedPrice = 118m,
            SelectedCapacityQuantity = 180m,
            Candidates = new[]
            {
                new
                {
                    SupplierName = "华东快供二厂",
                    PromiseDate = "2026-05-24 10:00",
                    QuotedPrice = 118m,
                    CapacityQuantity = 180m,
                    OnTimeRate = 98m,
                    DefectRate = 0.6m,
                    PerformanceScore = 96m,
                    SlaLeadTimeHours = 24,
                    SlaStatus = "healthy",
                    RiskNote = "优先供应商。",
                },
                new
                {
                    SupplierName = "南方钢材集团",
                    PromiseDate = "2026-05-28 18:00",
                    QuotedPrice = 109m,
                    CapacityQuantity = 300m,
                    OnTimeRate = 81m,
                    DefectRate = 1.7m,
                    PerformanceScore = 72m,
                    SlaLeadTimeHours = 96,
                    SlaStatus = "breached",
                    RiskNote = "原供应商 SLA 违约。",
                },
            },
            StatusLabel = "供应网络已选优",
            AuditId = $"AUD-SUP-NET-{Guid.NewGuid():N}",
            TraceId = $"TRACE-SUP-NET-{Guid.NewGuid():N}",
            Message = "供应商网络选优完成，原供应商进入 SLA 复盘。",
            CreatedAt = DateTime.UtcNow,
        };

        var decisionUpsert = await _client.PostAsJsonAsync("/api/v1/scheduling/supplier-network-decision", decisionRequest);
        decisionUpsert.StatusCode.Should().Be(HttpStatusCode.OK, await decisionUpsert.Content.ReadAsStringAsync());

        var decisionQuery = await _client.GetAsync("/api/v1/scheduling/supplier-network-decision/latest");
        decisionQuery.StatusCode.Should().Be(HttpStatusCode.OK);
        var decision = await decisionQuery.Content.ReadFromJsonAsync<SupplierNetworkDecisionResponse>();
        decision.Should().NotBeNull();
        decision!.MaterialCode.Should().Be(materialCode);
        decision.SelectedSupplierName.Should().Be("华东快供二厂");
        decision.Candidates.Should().Contain(candidate => candidate.SlaStatus == "breached");

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        db.AgentEvidenceLinks.Should().Contain(e =>
            e.EvidenceType == "SupplyRiskEscalation" &&
            e.EvidenceKey == $"{purchaseOrderNumber}:{materialCode}" &&
            e.EvidenceSummary != null &&
            e.EvidenceSummary.Contains(materialCode, StringComparison.OrdinalIgnoreCase));
        db.AgentEvidenceLinks.Should().Contain(e =>
            e.EvidenceType == "SupplierNetworkDecision" &&
            e.EvidenceKey == $"{materialCode}:华东快供二厂" &&
            e.EvidenceSummary != null &&
            e.EvidenceSummary.Contains(materialCode, StringComparison.OrdinalIgnoreCase));
        db.AuditLogs.Should().Contain(l =>
            l.Action == "SupplyRiskEscalationUpsert" &&
            l.ResourceId == $"{purchaseOrderNumber}:{materialCode}");
        db.AuditLogs.Should().Contain(l =>
            l.Action == "SupplierNetworkDecisionUpsert" &&
            l.ResourceId == $"{materialCode}:华东快供二厂");
    }

    [Fact]
    public async Task OutsourcingCommitmentApi_ShouldUpsertQueryLatestListAndAuditBackendEvidence()
    {
        var sourceKpiId = $"product-flange-{Guid.NewGuid():N}";
        var packageId = $"outsourcing-commitment-{sourceKpiId}";
        var request = new
        {
            Id = packageId,
            SourceKpiId = sourceKpiId,
            DimensionLabel = "产品族",
            TargetName = "法兰外协件",
            Title = "法兰外协件 外协承诺包",
            AuditId = $"AUD-OUT-{Guid.NewGuid():N}",
            TraceId = $"TRACE-OUT-{Guid.NewGuid():N}",
            Actor = "report.viewer",
            BaselineOtd = 40m,
            AgentOtd = 56.67m,
            Lift = 16.67m,
            DelayedReduced = 4,
            StatusLabel = "排产释放已确认",
            Commitment = "外协到货已确认，排产释放结论进入 OTD 复盘。",
            Owner = "采购 / 计划联合确认",
            DueAt = "2026-05-23",
            Summary = "KPI 钻取解释转为外协承诺口径。",
            Actions = new[]
            {
                new
                {
                    Module = "外协协同",
                    Owner = "采购 / 计划",
                    Action = "锁定外协承诺日期",
                    Evidence = $"TRACE-ACTION-{Guid.NewGuid():N}",
                },
                new
                {
                    Module = "AI 排产",
                    Owner = "调度员 李工",
                    Action = "关闭厂外等待口径并确认排产释放",
                    Evidence = $"TRACE-SCHEDULE-{Guid.NewGuid():N}",
                },
            },
            PartnerName = "华东精密外协厂",
            PromiseDate = "2026-05-23",
            AffectedOrders = "WO-DEMO-1013",
            SourceTraceId = $"TRACE-KPI-{Guid.NewGuid():N}",
            CreatedAt = DateTime.UtcNow,
            ReceivedAt = DateTime.UtcNow,
            ReceivedBy = "采购 王工",
            ReceiptAuditId = $"AUD-OUT-RECEIPT-{Guid.NewGuid():N}",
            ReceiptTraceId = $"TRACE-OUT-RECEIPT-{Guid.NewGuid():N}",
            ReceiptMessage = "外协到货已确认。",
            ScheduleReleasedAt = DateTime.UtcNow,
            ScheduleReleasedBy = "调度员 李工",
            ScheduleReleaseAuditId = $"AUD-OUT-SCHEDULE-{Guid.NewGuid():N}",
            ScheduleReleaseTraceId = $"TRACE-OUT-SCHEDULE-{Guid.NewGuid():N}",
            ScheduleReleaseMessage = "排产释放已确认。",
        };

        var upsertResponse = await _client.PostAsJsonAsync("/api/v1/scheduling/outsourcing-commitments", request);
        upsertResponse.StatusCode.Should().Be(HttpStatusCode.OK, await upsertResponse.Content.ReadAsStringAsync());

        var latestResponse = await _client.GetAsync("/api/v1/scheduling/outsourcing-commitments/latest");
        latestResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var latest = await latestResponse.Content.ReadFromJsonAsync<OutsourcingCommitmentPackageResponse>();
        latest.Should().NotBeNull();
        latest!.Id.Should().Be(packageId);
        latest.ScheduleReleaseMessage.Should().Contain("排产释放");

        var listResponse = await _client.GetAsync("/api/v1/scheduling/outsourcing-commitments?take=8");
        listResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var records = await listResponse.Content.ReadFromJsonAsync<List<OutsourcingCommitmentPackageResponse>>();
        records.Should().Contain(record =>
            record.Id == packageId &&
            record.Actions.Count == 2);

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        db.AgentEvidenceLinks.Should().Contain(e =>
            e.EvidenceType == "OutsourcingCommitmentPackage" &&
            e.EvidenceKey == packageId &&
            e.EvidenceSummary != null &&
            e.EvidenceSummary.Contains(sourceKpiId, StringComparison.OrdinalIgnoreCase));
        db.AuditLogs.Should().Contain(l =>
            l.Action == "OutsourcingCommitmentUpsert" &&
            l.ResourceId == packageId);
    }

    [Fact]
    public async Task QualityEvidenceApi_ShouldUpsertQueryAndAuditReworkAndMrbDisposition()
    {
        var inspectionId = $"INS-QA-{Guid.NewGuid():N}";
        var mrbId = $"quality-mrb-{Guid.NewGuid():N}";
        var reworkRequest = new
        {
            InspectionId = inspectionId,
            WorkOrderId = "WO-QA-001",
            ProductCode = "PRD-QA",
            ProcessName = "热处理",
            EquipmentCode = "HT-01",
            MaterialBatchCode = "MAT-AL6061-B03",
            BatchCode = "WO-QA-001-HT",
            InspectionPoint = "硬度检测",
            DefectQuantity = 2,
            ReworkHours = 8m,
            OtdImpact = "WO-QA-001 延期 +1 单风险",
            RecommendedAction = "插入返工与复验窗口。",
            RootCause = "热处理参数漂移",
            Evidence = new[] { "硬度检测 rework", "HT-01 热处理" },
            CreatedAt = DateTime.UtcNow,
        };

        var reworkUpsert = await _client.PostAsJsonAsync("/api/v1/scheduling/quality-rework-impact", reworkRequest);
        reworkUpsert.StatusCode.Should().Be(HttpStatusCode.OK, await reworkUpsert.Content.ReadAsStringAsync());

        var reworkQuery = await _client.GetAsync("/api/v1/scheduling/quality-rework-impact/latest");
        reworkQuery.StatusCode.Should().Be(HttpStatusCode.OK);
        var rework = await reworkQuery.Content.ReadFromJsonAsync<QualityReworkImpactResponse>();
        rework.Should().NotBeNull();
        rework!.InspectionId.Should().Be(inspectionId);
        rework.Evidence.Should().Contain("HT-01 热处理");

        var mrbRequest = new
        {
            Id = mrbId,
            Title = "WO-QA-001 MRB 报废补料",
            InspectionId = inspectionId,
            WorkOrderId = "WO-QA-001",
            ProductCode = "PRD-QA",
            ProcessName = "装配",
            EquipmentCode = "ASM-01",
            MaterialBatchCode = "MAT-STEEL-A12",
            BatchCode = "WO-QA-001-ASM",
            InspectionPoint = "功能测试",
            DefectPattern = "装配间隙超差",
            DefectQuantity = 4,
            Disposition = "scrap_rebuild",
            DispositionLabel = "报废补料重建",
            Status = "closed",
            StatusLabel = "MRB 处置已闭环",
            Owner = "质量经理 / 生产经理",
            DueAt = "今日 15:00",
            OtdImpact = "延期 +2 单风险",
            ScheduleImpact = "冻结原装配窗口并重排补料后装配/复检。",
            RecommendedAction = "隔离不合格品并补料重建。",
            AuditId = $"AUD-QA-MRB-{Guid.NewGuid():N}",
            TraceId = $"TRACE-QA-MRB-{Guid.NewGuid():N}",
            ScheduleTraceId = $"TRACE-QA-MRB-SCHEDULE-{Guid.NewGuid():N}",
            CreatedAt = DateTime.UtcNow,
            Actions = new[]
            {
                new
                {
                    Module = "质量",
                    Owner = "质量经理",
                    Action = "隔离并判废",
                    DueAt = "今日 11:30",
                    Evidence = "Q-HOLD-QA",
                    Result = "已隔离判废",
                },
                new
                {
                    Module = "排产",
                    Owner = "生产经理",
                    Action = "冻结原装配窗口并重排",
                    DueAt = "今日 15:00",
                    Evidence = "SCHED-QA-REBUILD",
                    Result = "已重建",
                },
            },
            ClosureAuditId = $"AUD-QA-MRB-CLOSE-{Guid.NewGuid():N}",
            ClosureTraceId = $"TRACE-QA-MRB-CLOSE-{Guid.NewGuid():N}",
            ClosureSummary = "质量隔离、补料 ETA 与排产重建均已确认。",
            ClosedAt = DateTime.UtcNow,
            ClosedBy = "生产经理",
        };

        var mrbUpsert = await _client.PostAsJsonAsync("/api/v1/scheduling/quality-mrb-disposition", mrbRequest);
        mrbUpsert.StatusCode.Should().Be(HttpStatusCode.OK, await mrbUpsert.Content.ReadAsStringAsync());

        var mrbQuery = await _client.GetAsync("/api/v1/scheduling/quality-mrb-disposition/latest");
        mrbQuery.StatusCode.Should().Be(HttpStatusCode.OK);
        var mrb = await mrbQuery.Content.ReadFromJsonAsync<QualityMrbDispositionResponse>();
        mrb.Should().NotBeNull();
        mrb!.Id.Should().Be(mrbId);
        mrb.Status.Should().Be("closed");
        mrb.Actions.Should().Contain(action => action.Module == "排产" && action.Result == "已重建");

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        db.AgentEvidenceLinks.Should().Contain(e =>
            e.EvidenceType == "QualityReworkImpact" &&
            e.EvidenceKey == inspectionId &&
            e.EvidenceSummary != null &&
            e.EvidenceSummary.Contains(inspectionId, StringComparison.OrdinalIgnoreCase));
        db.AgentEvidenceLinks.Should().Contain(e =>
            e.EvidenceType == "QualityMrbDisposition" &&
            e.EvidenceKey == mrbId &&
            e.EvidenceSummary != null &&
            e.EvidenceSummary.Contains(mrbId, StringComparison.OrdinalIgnoreCase));
        db.AuditLogs.Should().Contain(l =>
            l.Action == "QualityReworkImpactUpsert" &&
            l.ResourceId == inspectionId);
        db.AuditLogs.Should().Contain(l =>
            l.Action == "QualityMrbDispositionUpsert" &&
            l.ResourceId == mrbId);
    }

    [Fact]
    public async Task EngineeringEvidenceApi_ShouldUpsertQueryAndAuditEngineeringConstraints()
    {
        var approvalId = $"alt-mat-{Guid.NewGuid():N}";
        var changeId = $"ecn-{Guid.NewGuid():N}";
        var impactId = $"engineering-impact-{Guid.NewGuid():N}";
        var routeId = $"route-capability-{Guid.NewGuid():N}";
        var approvalRequest = new
        {
            Id = approvalId,
            BomCode = "BOM-A100",
            BomVersion = "V1.0",
            SourceMaterialCode = "M-AL-6061",
            AlternateMaterialCode = "M-AL-6061B",
            AlternateMaterialName = "铝合金 6061B",
            AffectedOrders = "WO-RUSH-9001 / WO-DEMO-1002",
            ApprovedBy = "工程师 / EMP-004",
            ApprovedAt = DateTime.UtcNow,
            AuditId = $"AUD-ENG-ALT-{Guid.NewGuid():N}",
            TraceId = $"TRACE-ENG-ALT-{Guid.NewGuid():N}",
            Status = "approved",
            Summary = "替代料已完成工程确认。",
        };

        var approvalUpsert = await _client.PostAsJsonAsync("/api/v1/scheduling/alternate-material-approval", approvalRequest);
        approvalUpsert.StatusCode.Should().Be(HttpStatusCode.OK, await approvalUpsert.Content.ReadAsStringAsync());

        var approvalQuery = await _client.GetAsync("/api/v1/scheduling/alternate-material-approval/latest");
        approvalQuery.StatusCode.Should().Be(HttpStatusCode.OK);
        var approval = await approvalQuery.Content.ReadFromJsonAsync<AlternateMaterialApprovalResponse>();
        approval.Should().NotBeNull();
        approval!.Id.Should().Be(approvalId);
        approval.AlternateMaterialCode.Should().Be("M-AL-6061B");

        var impactRequest = new
        {
            Id = impactId,
            ChangeId = changeId,
            BomCode = "BOM-A100",
            BomVersion = "V1.0",
            ChangeTitle = "M-AL-6061B 替代 M-AL-6061",
            SourceMaterialCode = "M-AL-6061",
            AlternateMaterialCode = "M-AL-6061B",
            AlternateMaterialName = "铝合金 6061B",
            AffectedOrders = "WO-RUSH-9001 / WO-DEMO-1002",
            InventoryImpact = "可覆盖急单。",
            QualityImpact = "保留首件材质复核。",
            SupplierImpact = "替代供应商已承诺。",
            CostImpact = "材料成本 +1.8%。",
            OtdImpact = "OTD +7%。",
            ScheduleWindow = "锁定期后第一个 CNC 空窗",
            RecommendedDecision = "建议放行急单。",
            AnalyzedBy = "工程经理 / EMP-004",
            AnalyzedAt = DateTime.UtcNow,
            AuditId = $"AUD-ENG-ECN-{Guid.NewGuid():N}",
            TraceId = $"TRACE-ENG-ECN-{Guid.NewGuid():N}",
            Decision = "approved",
            DecisionLabel = "已批准",
            DecidedBy = "工程经理 / EMP-004",
            DecidedAt = DateTime.UtcNow,
            DecisionReason = "质量门和批次证明均满足。",
            DecisionAuditId = $"AUD-ENG-ECN-APPROVE-{Guid.NewGuid():N}",
            StatusLabel = "已批准",
            Summary = "ECN 已完成正式审批。",
        };

        var impactUpsert = await _client.PostAsJsonAsync("/api/v1/scheduling/engineering-change-impact", impactRequest);
        impactUpsert.StatusCode.Should().Be(HttpStatusCode.OK, await impactUpsert.Content.ReadAsStringAsync());

        var impactQuery = await _client.GetAsync("/api/v1/scheduling/engineering-change-impact/latest");
        impactQuery.StatusCode.Should().Be(HttpStatusCode.OK);
        var impact = await impactQuery.Content.ReadFromJsonAsync<EngineeringChangeImpactResponse>();
        impact.Should().NotBeNull();
        impact!.Id.Should().Be(impactId);
        impact.Decision.Should().Be("approved");

        var routeRequest = new
        {
            Id = routeId,
            RouteCode = "R-B200",
            RouteVersion = "V2.1",
            RouteName = "传动轴总成工艺路线",
            OperationCode = "OP-090",
            OperationName = "热处理",
            BottleneckResource = "热处理炉 HT-01",
            CandidateEquipment = "HT-02 夜班窗口 / 外协 HT-SUP-01",
            AffectedOrders = "WO-DEMO-1007 / WO-RUSH-9001",
            CapacityGapHours = 4.5m,
            ChangeoverMinutes = 35m,
            BatchWindow = "2026-05-21 22:00-02:00",
            Decision = "released",
            ValidatedBy = "工艺工程师 陈工",
            ValidatedAt = DateTime.UtcNow,
            ApprovedBy = "制造经理 李工",
            ApprovedAt = DateTime.UtcNow,
            AuditId = $"AUD-ROUTE-CAP-{Guid.NewGuid():N}",
            TraceId = $"TRACE-ROUTE-CAP-{Guid.NewGuid():N}",
            StatusLabel = "分流已确认",
            Summary = "热处理能力缺口已确认分流/合批方案。",
        };

        var routeUpsert = await _client.PostAsJsonAsync("/api/v1/scheduling/route-capability-validation", routeRequest);
        routeUpsert.StatusCode.Should().Be(HttpStatusCode.OK, await routeUpsert.Content.ReadAsStringAsync());

        var routeQuery = await _client.GetAsync("/api/v1/scheduling/route-capability-validation/latest");
        routeQuery.StatusCode.Should().Be(HttpStatusCode.OK);
        var route = await routeQuery.Content.ReadFromJsonAsync<RouteCapabilityValidationResponse>();
        route.Should().NotBeNull();
        route!.Id.Should().Be(routeId);
        route.Decision.Should().Be("released");

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        db.AgentEvidenceLinks.Should().Contain(e =>
            e.EvidenceType == "AlternateMaterialApproval" &&
            e.EvidenceKey == approvalId);
        db.AgentEvidenceLinks.Should().Contain(e =>
            e.EvidenceType == "EngineeringChangeImpact" &&
            e.EvidenceKey == impactId);
        db.AgentEvidenceLinks.Should().Contain(e =>
            e.EvidenceType == "RouteCapabilityValidation" &&
            e.EvidenceKey == routeId);
        db.AuditLogs.Should().Contain(l =>
            l.Action == "AlternateMaterialApprovalUpsert" &&
            l.ResourceId == approvalId);
        db.AuditLogs.Should().Contain(l =>
            l.Action == "EngineeringChangeImpactUpsert" &&
            l.ResourceId == impactId);
        db.AuditLogs.Should().Contain(l =>
            l.Action == "RouteCapabilityValidationUpsert" &&
            l.ResourceId == routeId);
    }

    [Fact]
    public async Task RiskEvidenceApi_ShouldUpsertQueryAndAuditAbnormalRiskEvents()
    {
        var anomalyId = $"prod-anomaly-{Guid.NewGuid():N}";
        var dispatchId = $"anomaly-dispatch-{Guid.NewGuid():N}";
        var escalationId = $"monitoring-situation-{Guid.NewGuid():N}";
        var reviewId = $"risk-sla-review-{Guid.NewGuid():N}";
        var traceId = $"risk-action-{Guid.NewGuid():N}";

        var anomalyRequest = new
        {
            Id = anomalyId,
            WorkOrderNumber = "WO-RISK-001",
            OperationCode = "OP-020",
            OperationName = "CNC 精加工",
            EquipmentId = "CNC-001",
            AnomalyType = "equipment",
            Severity = "Critical",
            Title = "CNC-001 主轴温升异常",
            Description = "现场上报主轴温度超过阈值，触发风险处置队列。",
            DetectedAt = DateTime.UtcNow.ToString("O"),
            DetectedBy = "operator.risk",
            SuggestedAction = "停机保护并切换 CNC-003 分流。",
        };

        var anomalyUpsert = await _client.PostAsJsonAsync("/api/v1/scheduling/production-anomaly-event", anomalyRequest);
        anomalyUpsert.StatusCode.Should().Be(HttpStatusCode.OK, await anomalyUpsert.Content.ReadAsStringAsync());

        var anomalyQuery = await _client.GetAsync("/api/v1/scheduling/production-anomaly-event/latest");
        anomalyQuery.StatusCode.Should().Be(HttpStatusCode.OK);
        var anomaly = await anomalyQuery.Content.ReadFromJsonAsync<JsonElement>();
        anomaly.GetProperty("id").GetString().Should().Be(anomalyId);

        var dispatchRequest = new
        {
            Id = dispatchId,
            AnomalyId = anomalyId,
            Type = "equipment",
            TypeLabel = "设备异常",
            Title = "CNC-001 温升异常分流",
            WorkOrderNumber = "WO-RISK-001",
            OperationCode = "OP-020",
            Route = "异常管理 -> 风险队列 -> AI 排产 -> 设备维护",
            Owner = "设备主管",
            DueAt = "今日 14:00",
            AffectedOrders = "WO-RISK-001 / WO-RISK-002",
            DeliveryImpact = "预计停机 2h",
            ScheduleWindow = "今日夜班维护窗口",
            SuggestedAction = "切换 CNC-003 并复核瓶颈设备保护。",
            AuditId = $"AUD-ANOMALY-DISPATCH-{Guid.NewGuid():N}",
            TraceId = $"TRACE-ANOMALY-DISPATCH-{Guid.NewGuid():N}",
            Status = "routed",
            StatusLabel = "设备分流已确认",
            CreatedAt = DateTime.UtcNow.ToString("O"),
            Summary = "现场事件中心确认设备异常分流。",
        };

        var dispatchUpsert = await _client.PostAsJsonAsync("/api/v1/scheduling/anomaly-dispatch-records", dispatchRequest);
        dispatchUpsert.StatusCode.Should().Be(HttpStatusCode.OK, await dispatchUpsert.Content.ReadAsStringAsync());

        var dispatchQuery = await _client.GetAsync("/api/v1/scheduling/anomaly-dispatch-records?take=5");
        dispatchQuery.StatusCode.Should().Be(HttpStatusCode.OK);
        var dispatches = await dispatchQuery.Content.ReadFromJsonAsync<List<JsonElement>>();
        dispatches.Should().Contain(item => item.GetProperty("id").GetString() == dispatchId);

        var escalationRequest = new
        {
            Id = escalationId,
            SourceEventId = "sf-cnc-load",
            Title = "瓶颈负载超过 90%",
            Source = "CNC-001",
            WorkOrders = "WO-RISK-001 / WO-RISK-002",
            Priority = "critical",
            Owner = "调度员",
            DueAt = "今日 10:30",
            AuditId = $"AUD-MONITORING-SITUATION-{Guid.NewGuid():N}",
            TraceId = $"TRACE-MONITORING-SITUATION-{Guid.NewGuid():N}",
            Status = "escalated",
            StatusLabel = "跨模块处置中",
            ScheduleWindow = "未来 8 小时",
            ScheduleAction = "重排 CNC 精加工窗口。",
            RiskImpact = "瓶颈负载继续上升会扩大延期风险。",
            RiskSuggestion = "立即复核分流设备和夜班加班窗口。",
            OtdImpact = "-4% OTD 风险",
            DelayImpact = "+2 单延期风险",
            ChangeoverImpact = "+12min",
            Summary = "实时监控态势升级为风险处置包。",
            Evidence = new[] { "CNC-001 负载", "WO-RISK-001" },
            DispatchSteps = new[] { "调度员复核", "设备主管确认" },
            CreatedAt = DateTime.UtcNow.ToString("O"),
            ClosedAt = (string?)null,
            ClosureTrace = (string?)null,
        };

        var escalationUpsert = await _client.PostAsJsonAsync("/api/v1/scheduling/monitoring-situation-escalations", escalationRequest);
        escalationUpsert.StatusCode.Should().Be(HttpStatusCode.OK, await escalationUpsert.Content.ReadAsStringAsync());

        var escalationQuery = await _client.GetAsync("/api/v1/scheduling/monitoring-situation-escalations?take=5");
        escalationQuery.StatusCode.Should().Be(HttpStatusCode.OK);
        var escalations = await escalationQuery.Content.ReadFromJsonAsync<List<JsonElement>>();
        escalations.Should().Contain(item => item.GetProperty("id").GetString() == escalationId);

        var reviewRequest = new
        {
            Id = reviewId,
            Title = "风险 SLA 晨会复核包",
            Status = "escalated",
            StatusLabel = "已升级晨会复核",
            ReviewMeetingId = $"RISK-DAILY-{Guid.NewGuid():N}",
            Owner = "生产经理 / 调度主管",
            OverdueCount = 1,
            CriticalCount = 2,
            AffectedOrders = "WO-RISK-001 / WO-RISK-002",
            OtdImpact = "+6% OTD 恢复动作待锁定",
            AuditId = $"AUD-RISK-SLA-{Guid.NewGuid():N}",
            TraceId = $"TRACE-RISK-SLA-{Guid.NewGuid():N}",
            CreatedAt = DateTime.UtcNow.ToString("O"),
            Summary = "风险处置队列升级为晨会复核。",
            Risks = new[]
            {
                new
                {
                    Id = "risk-equipment-cnc001",
                    Type = "设备健康",
                    Title = "CNC-001 温升异常",
                    Owner = "设备主管",
                    DueAt = "今日 14:00",
                    WorkOrders = "WO-RISK-001",
                    DeliveryImpact = "停机 2h",
                    StatusLabel = "已升级",
                    SlaStatus = "overdue",
                    RequiredAction = "确认分流设备和维护窗口。",
                },
            },
            Actions = new[]
            {
                new
                {
                    Module = "AI 排产",
                    Owner = "调度主管",
                    DueAt = "今日 10:30",
                    Action = "生成锁定期后保护建议。",
                    Evidence = "TRACE-RISK-SLA-SCHEDULE",
                    Result = (string?)null,
                },
            },
            ClosedAt = (string?)null,
            ClosureAuditId = (string?)null,
            ClosureTraceId = (string?)null,
            ClosureSummary = (string?)null,
        };

        var reviewUpsert = await _client.PostAsJsonAsync("/api/v1/scheduling/risk-sla-review", reviewRequest);
        reviewUpsert.StatusCode.Should().Be(HttpStatusCode.OK, await reviewUpsert.Content.ReadAsStringAsync());

        var reviewQuery = await _client.GetAsync("/api/v1/scheduling/risk-sla-review/latest");
        reviewQuery.StatusCode.Should().Be(HttpStatusCode.OK);
        var review = await reviewQuery.Content.ReadFromJsonAsync<JsonElement>();
        review.GetProperty("id").GetString().Should().Be(reviewId);

        var traceRequest = new
        {
            Id = traceId,
            Title = "CNC-001 温升异常已升级",
            Type = "设备健康",
            Status = "escalated",
            StatusLabel = "已升级",
            Owner = "生产经理",
            WorkOrders = "WO-RISK-001 / WO-RISK-002",
            DeliveryImpact = "+2 单延期风险",
            Suggestion = "锁定 CNC-003 分流窗口。",
            Trace = "风险处置队列已升级为生产经理审批。",
            CreatedAt = DateTime.UtcNow.ToString("O"),
        };

        var traceUpsert = await _client.PostAsJsonAsync("/api/v1/scheduling/risk-action-traces", traceRequest);
        traceUpsert.StatusCode.Should().Be(HttpStatusCode.OK, await traceUpsert.Content.ReadAsStringAsync());

        var traceQuery = await _client.GetAsync("/api/v1/scheduling/risk-action-traces?take=5");
        traceQuery.StatusCode.Should().Be(HttpStatusCode.OK);
        var traces = await traceQuery.Content.ReadFromJsonAsync<List<JsonElement>>();
        traces.Should().Contain(item => item.GetProperty("id").GetString() == traceId);

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        db.AgentEvidenceLinks.Should().Contain(e => e.EvidenceType == "ProductionAnomalyEvent" && e.EvidenceKey == anomalyId);
        db.AgentEvidenceLinks.Should().Contain(e => e.EvidenceType == "AnomalyDispatchRecord" && e.EvidenceKey == dispatchId);
        db.AgentEvidenceLinks.Should().Contain(e => e.EvidenceType == "MonitoringSituationEscalation" && e.EvidenceKey == escalationId);
        db.AgentEvidenceLinks.Should().Contain(e => e.EvidenceType == "RiskSlaReview" && e.EvidenceKey == reviewId);
        db.AgentEvidenceLinks.Should().Contain(e => e.EvidenceType == "RiskActionTrace" && e.EvidenceKey == $"{traceId}:escalated");
        db.AuditLogs.Should().Contain(l => l.Action == "ProductionAnomalyEventUpsert" && l.ResourceId == anomalyId);
        db.AuditLogs.Should().Contain(l => l.Action == "AnomalyDispatchRecordUpsert" && l.ResourceId == dispatchId);
        db.AuditLogs.Should().Contain(l => l.Action == "MonitoringSituationEscalationUpsert" && l.ResourceId == escalationId);
        db.AuditLogs.Should().Contain(l => l.Action == "RiskSlaReviewUpsert" && l.ResourceId == reviewId);
        db.AuditLogs.Should().Contain(l => l.Action == "RiskActionTraceUpsert" && l.ResourceId == $"{traceId}:escalated");
    }

    [Fact]
    public async Task AssistantEvidenceApi_ShouldUpsertQueryAndAuditAssistantActionsAndPackages()
    {
        var actionAuditId = $"assistant-action-audit-{Guid.NewGuid():N}";
        var recoveryPackageId = $"assistant-recovery-{Guid.NewGuid():N}";
        var anomalyPackageId = $"assistant-anomaly-{Guid.NewGuid():N}";
        var engineeringPackageId = $"assistant-engineering-{Guid.NewGuid():N}";

        var actionAuditRequest = new
        {
            Id = actionAuditId,
            ActionId = "approve-shortage-recovery",
            Label = "确认交期恢复执行包",
            Type = "approve",
            Actor = "scheduler.demo",
            Role = "调度主管",
            TargetRoute = "/scheduling",
            AuditCode = $"AUD-ASSISTANT-ACTION-{Guid.NewGuid():N}",
            TraceId = $"TRACE-ASSISTANT-ACTION-{Guid.NewGuid():N}",
            ResultMessage = "助手动作已确认，执行包进入跨模块闭环。",
            Permitted = true,
            CreatedAt = DateTime.UtcNow.ToString("O"),
        };

        var actionAuditUpsert = await _client.PostAsJsonAsync("/api/v1/scheduling/assistant-action-audits", actionAuditRequest);
        actionAuditUpsert.StatusCode.Should().Be(HttpStatusCode.OK, await actionAuditUpsert.Content.ReadAsStringAsync());

        var actionAuditQuery = await _client.GetAsync("/api/v1/scheduling/assistant-action-audits?take=5");
        actionAuditQuery.StatusCode.Should().Be(HttpStatusCode.OK);
        var actionAudits = await actionAuditQuery.Content.ReadFromJsonAsync<List<JsonElement>>();
        actionAudits.Should().Contain(item => item.GetProperty("id").GetString() == actionAuditId);

        var dispatchSteps = new[]
        {
            new
            {
                Module = "采购",
                Owner = "采购经理",
                Action = "确认供应商加急承诺。",
                Evidence = "PO-RUSH-9001",
                Status = "open",
                Result = (string?)null,
                ClosedAt = (string?)null,
            },
            new
            {
                Module = "质量",
                Owner = "质量工程师",
                Action = "首件复核替代料装配结果。",
                Evidence = "FAI-RUSH-9001",
                Status = "open",
                Result = (string?)null,
                ClosedAt = (string?)null,
            },
        };

        var recoveryRequest = new
        {
            Id = recoveryPackageId,
            Title = "WO-RUSH-9001 交期恢复执行包",
            AuditCode = $"AUD-ASSISTANT-RECOVERY-{Guid.NewGuid():N}",
            TraceId = $"TRACE-ASSISTANT-RECOVERY-{Guid.NewGuid():N}",
            Actor = "ai-assistant",
            Role = "AI 调度助手",
            WorkOrders = "WO-RUSH-9001 / WO-RUSH-9002",
            Priority = "critical",
            Owner = "调度主管",
            DueAt = "今日 16:00",
            ScheduleWindow = "今日夜班",
            ScheduleAction = "锁定 CNC-003 分流与夜班窗口。",
            RiskImpact = "物料短缺风险已转执行包跟踪。",
            RiskSuggestion = "采购与质量动作闭合后再释放计划。",
            OtdImpact = "+6% OTD 恢复机会",
            DelayImpact = "-4 单延期风险",
            ChangeoverImpact = "+18min",
            Status = "open",
            StatusLabel = "待跨模块闭环",
            PurchaseActionStatus = "open",
            PurchaseActionAuditCode = (string?)null,
            PurchaseActionTraceId = (string?)null,
            PurchaseActionSummary = (string?)null,
            PurchaseActionClosedAt = (string?)null,
            PurchaseActionClosedBy = (string?)null,
            PurchaseOrderNumber = (string?)null,
            QualityActionStatus = "open",
            QualityActionAuditCode = (string?)null,
            QualityActionTraceId = (string?)null,
            QualityActionSummary = (string?)null,
            QualityActionClosedAt = (string?)null,
            QualityActionClosedBy = (string?)null,
            FirstArticleRecord = (string?)null,
            ClosureAuditCode = (string?)null,
            ClosureTraceId = (string?)null,
            ClosureSummary = (string?)null,
            ClosedAt = (string?)null,
            ClosedBy = (string?)null,
            Summary = "助手执行包将采购、质量、排产动作绑定为同一证据链。",
            DispatchSteps = dispatchSteps,
            CreatedAt = DateTime.UtcNow.ToString("O"),
        };

        var recoveryUpsert = await _client.PostAsJsonAsync("/api/v1/scheduling/assistant-recovery-packages", recoveryRequest);
        recoveryUpsert.StatusCode.Should().Be(HttpStatusCode.OK, await recoveryUpsert.Content.ReadAsStringAsync());

        var recoveryQuery = await _client.GetAsync("/api/v1/scheduling/assistant-recovery-packages?take=5");
        recoveryQuery.StatusCode.Should().Be(HttpStatusCode.OK);
        var recoveryPackages = await recoveryQuery.Content.ReadFromJsonAsync<List<JsonElement>>();
        recoveryPackages.Should().Contain(item => item.GetProperty("id").GetString() == recoveryPackageId);

        var anomalyRequest = new
        {
            Id = anomalyPackageId,
            Title = "CNC-001 温升异常处置包",
            AuditCode = $"AUD-ASSISTANT-ANOMALY-{Guid.NewGuid():N}",
            TraceId = $"TRACE-ASSISTANT-ANOMALY-{Guid.NewGuid():N}",
            Actor = "ai-assistant",
            Role = "AI 调度助手",
            WorkOrders = "WO-ANOMALY-001 / WO-ANOMALY-002",
            Priority = "high",
            Owner = "设备主管",
            DueAt = "今日 14:30",
            AnomalyTitle = "CNC-001 主轴温升异常",
            OperationCode = "OP-020",
            EquipmentId = "CNC-001",
            DeliveryImpact = "+2 单延期风险",
            ScheduleWindow = "今日夜班维护窗口",
            StatusLabel = "异常处置已派发",
            Summary = "助手将现场异常生成设备、排产和风险协同处置包。",
            DispatchSteps = dispatchSteps,
            CreatedAt = DateTime.UtcNow.ToString("O"),
        };

        var anomalyUpsert = await _client.PostAsJsonAsync("/api/v1/scheduling/assistant-anomaly-packages", anomalyRequest);
        anomalyUpsert.StatusCode.Should().Be(HttpStatusCode.OK, await anomalyUpsert.Content.ReadAsStringAsync());

        var anomalyQuery = await _client.GetAsync("/api/v1/scheduling/assistant-anomaly-packages?take=5");
        anomalyQuery.StatusCode.Should().Be(HttpStatusCode.OK);
        var anomalyPackages = await anomalyQuery.Content.ReadFromJsonAsync<List<JsonElement>>();
        anomalyPackages.Should().Contain(item => item.GetProperty("id").GetString() == anomalyPackageId);

        var engineeringRequest = new
        {
            Id = engineeringPackageId,
            Title = "BOM/ECN 工程约束执行包",
            AuditCode = $"AUD-ASSISTANT-ENGINEERING-{Guid.NewGuid():N}",
            TraceId = $"TRACE-ASSISTANT-ENGINEERING-{Guid.NewGuid():N}",
            Actor = "ai-assistant",
            Role = "AI 调度助手",
            WorkOrders = "WO-ENG-001 / WO-ENG-002",
            Priority = "medium",
            Owner = "工艺工程师",
            DueAt = "明日 10:00",
            BomCode = "BOM-AXLE-2026",
            EcnCode = "ECN-2026-051",
            RouteCode = "R-CNC-ALT",
            OperationCode = "OP-030",
            OtdImpact = "工程约束未确认将影响 +3 单交付风险",
            StatusLabel = "工程约束待确认",
            Summary = "助手将 BOM、ECN、工艺路线约束绑定到排产可执行动作。",
            DispatchSteps = dispatchSteps,
            CreatedAt = DateTime.UtcNow.ToString("O"),
        };

        var engineeringUpsert = await _client.PostAsJsonAsync("/api/v1/scheduling/assistant-engineering-constraint-packages", engineeringRequest);
        engineeringUpsert.StatusCode.Should().Be(HttpStatusCode.OK, await engineeringUpsert.Content.ReadAsStringAsync());

        var engineeringQuery = await _client.GetAsync("/api/v1/scheduling/assistant-engineering-constraint-packages?take=5");
        engineeringQuery.StatusCode.Should().Be(HttpStatusCode.OK);
        var engineeringPackages = await engineeringQuery.Content.ReadFromJsonAsync<List<JsonElement>>();
        engineeringPackages.Should().Contain(item => item.GetProperty("id").GetString() == engineeringPackageId);

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        db.AgentEvidenceLinks.Should().Contain(e => e.EvidenceType == "AssistantActionAudit" && e.EvidenceKey == actionAuditId);
        db.AgentEvidenceLinks.Should().Contain(e => e.EvidenceType == "AssistantRecoveryPackage" && e.EvidenceKey == recoveryPackageId);
        db.AgentEvidenceLinks.Should().Contain(e => e.EvidenceType == "AssistantAnomalyPackage" && e.EvidenceKey == anomalyPackageId);
        db.AgentEvidenceLinks.Should().Contain(e => e.EvidenceType == "AssistantEngineeringConstraintPackage" && e.EvidenceKey == engineeringPackageId);
        db.AuditLogs.Should().Contain(l => l.Action == "AssistantActionAuditUpsert" && l.ResourceId == actionAuditId);
        db.AuditLogs.Should().Contain(l => l.Action == "AssistantRecoveryPackageUpsert" && l.ResourceId == recoveryPackageId);
        db.AuditLogs.Should().Contain(l => l.Action == "AssistantAnomalyPackageUpsert" && l.ResourceId == anomalyPackageId);
        db.AuditLogs.Should().Contain(l => l.Action == "AssistantEngineeringConstraintPackageUpsert" && l.ResourceId == engineeringPackageId);
    }

    [Fact]
    public async Task PocEvidenceApi_ShouldUpsertQueryAndAuditCustomerPilotAndHypercareEvidence()
    {
        var importBatchId = $"IMP-POC-{Guid.NewGuid():N}";
        var signoffId = $"poc-signoff-{Guid.NewGuid():N}";
        var rolloutId = $"poc-rollout-{Guid.NewGuid():N}";
        var pilotRunId = $"poc-pilot-{Guid.NewGuid():N}";
        var hypercareId = $"poc-hypercare-{Guid.NewGuid():N}";

        var importRequest = new
        {
            BatchId = importBatchId,
            FileName = "客户真实工单导入样例_30单.csv",
            Source = "客户 IT / ERP 导出样例",
            ImportedOrders = 30,
            HighRiskOrders = 6,
            MappedFields = new[] { "工单号", "产品", "交期", "工艺路线", "物料缺口", "设备约束" },
            PreparedAt = DateTime.UtcNow,
        };

        var importUpsert = await _client.PostAsJsonAsync("/api/v1/scheduling/customer-order-import", importRequest);
        importUpsert.StatusCode.Should().Be(HttpStatusCode.OK, await importUpsert.Content.ReadAsStringAsync());

        var importQuery = await _client.GetAsync("/api/v1/scheduling/customer-order-import/latest");
        importQuery.StatusCode.Should().Be(HttpStatusCode.OK);
        var importRecord = await importQuery.Content.ReadFromJsonAsync<JsonElement>();
        importRecord.GetProperty("batchId").GetString().Should().Be(importBatchId);

        var signoffRequest = new
        {
            Id = signoffId,
            MeetingId = $"POC-REVIEW-{Guid.NewGuid():N}",
            TargetCustomer = "离散制造工厂 POC",
            TotalScore = 92,
            PassScore = 85,
            Result = "approved",
            SignedBy = "项目经理 / 客户代表",
            SignedAt = DateTime.UtcNow,
            Reviewers = new[] { "客户厂长", "MES 项目经理", "调度主管", "设备主管" },
            EvidenceBatches = new[] { importBatchId, "EQ-FAULT-DEMO" },
            AuditId = $"AUD-POC-REVIEW-{Guid.NewGuid():N}",
            Summary = "POC 验收证据齐套，评分达到通过线，进入复盘签署。",
        };

        var signoffUpsert = await _client.PostAsJsonAsync("/api/v1/scheduling/poc-review-signoff", signoffRequest);
        signoffUpsert.StatusCode.Should().Be(HttpStatusCode.OK, await signoffUpsert.Content.ReadAsStringAsync());

        var signoffQuery = await _client.GetAsync("/api/v1/scheduling/poc-review-signoff/latest");
        signoffQuery.StatusCode.Should().Be(HttpStatusCode.OK);
        var signoff = await signoffQuery.Content.ReadFromJsonAsync<JsonElement>();
        signoff.GetProperty("id").GetString().Should().Be(signoffId);

        var rolloutActions = new[]
        {
            new
            {
                Module = "交付项目",
                Owner = "交付经理",
                Action = "组织 POC 转上线启动会。",
                DueAt = "T+1",
                Evidence = "TRACE-POC-ROLLOUT-KICKOFF",
            },
            new
            {
                Module = "治理审计",
                Owner = "项目经理",
                Action = "复核 OTD、责任动作、AI 建议采纳和审计导出。",
                DueAt = "T+14",
                Evidence = "TRACE-POC-ROLLOUT-GOVERNANCE",
            },
        };

        var rolloutRequest = new
        {
            Id = rolloutId,
            Title = "POC 成功转上线交付行动包",
            TargetCustomer = "离散制造工厂 POC",
            SourceMeetingId = signoffRequest.MeetingId,
            SourceAuditId = signoffRequest.AuditId,
            Status = "ready",
            StatusLabel = "待客户交付启动会确认",
            RolloutWindow = "T+7 天完成试点上线准备，T+14 天进入首批真实工单运行",
            GoLiveGate = "POC 评分通过、客户工单/设备样例齐套、OTD 证据链可审计",
            Owner = "交付经理 / 客户厂长 / IT 负责人",
            SuccessCriteria = new[] { "首批真实工单 >= 30 单", "责任动作均能回写统一证据链" },
            Actions = rolloutActions,
            AuditId = $"AUD-POC-ROLLOUT-{Guid.NewGuid():N}",
            TraceId = $"TRACE-POC-ROLLOUT-{Guid.NewGuid():N}",
            CreatedAt = DateTime.UtcNow,
            Summary = "POC 已从签署进入试点上线准备。",
        };

        var rolloutUpsert = await _client.PostAsJsonAsync("/api/v1/scheduling/poc-rollout-package", rolloutRequest);
        rolloutUpsert.StatusCode.Should().Be(HttpStatusCode.OK, await rolloutUpsert.Content.ReadAsStringAsync());

        var rolloutQuery = await _client.GetAsync("/api/v1/scheduling/poc-rollout-package/latest");
        rolloutQuery.StatusCode.Should().Be(HttpStatusCode.OK);
        var rollout = await rolloutQuery.Content.ReadFromJsonAsync<JsonElement>();
        rollout.GetProperty("id").GetString().Should().Be(rolloutId);

        var pilotRunRequest = new
        {
            Id = pilotRunId,
            Title = "POC 首批真实工单试点运行确认",
            TargetCustomer = "离散制造工厂 POC",
            SourcePackageId = rolloutId,
            SourceAuditId = rolloutRequest.AuditId,
            Status = "closed",
            StatusLabel = "首批真实工单已跑通",
            RunWindow = "T+14 首批真实工单上线班次",
            BatchId = $"PILOT-WO-BATCH-{Guid.NewGuid():N}",
            SampleSize = 30,
            OtdTarget = ">= 96%",
            ActualOtd = "97%",
            Owner = "调度主管 / 生产班组长 / 交付经理",
            WorkOrders = new[]
            {
                new
                {
                    WorkOrderNumber = "WO-PILOT-2101",
                    ProductName = "急单阀体组件",
                    Quantity = 12,
                    Route = "CNC 精加工 -> OP-20 装配 -> 首件复检",
                    ScheduleDecision = "采纳 Agent 锁定期后插入建议",
                    ExecutionStatus = "已完工回写",
                },
            },
            Checkpoints = new[]
            {
                new
                {
                    Module = "AI 排产",
                    Owner = "调度主管",
                    Status = "closed",
                    Evidence = "TRACE-POC-PILOT-SCHEDULE",
                    Summary = "30 单真实工单已生成排产建议，关键建议均有人工采纳原因。",
                },
            },
            AcceptanceCriteria = new[] { "30 单真实工单样本全部完成排产建议、人工确认和执行回写。" },
            AuditId = $"AUD-POC-PILOT-{Guid.NewGuid():N}",
            TraceId = $"TRACE-POC-PILOT-{Guid.NewGuid():N}",
            CreatedAt = DateTime.UtcNow,
            Summary = "首批 30 单真实工单已跑通排产建议采纳、生产执行、异常回写和审计复盘。",
        };

        var pilotRunUpsert = await _client.PostAsJsonAsync("/api/v1/scheduling/poc-pilot-run", pilotRunRequest);
        pilotRunUpsert.StatusCode.Should().Be(HttpStatusCode.OK, await pilotRunUpsert.Content.ReadAsStringAsync());

        var pilotRunQuery = await _client.GetAsync("/api/v1/scheduling/poc-pilot-run/latest");
        pilotRunQuery.StatusCode.Should().Be(HttpStatusCode.OK);
        var pilotRun = await pilotRunQuery.Content.ReadFromJsonAsync<JsonElement>();
        pilotRun.GetProperty("id").GetString().Should().Be(pilotRunId);

        var hypercareRequest = new
        {
            Id = hypercareId,
            Title = "POC 正式上线验收与 Hypercare 稳定运行监控包",
            TargetCustomer = "离散制造工厂 POC",
            SourcePilotRunId = pilotRunId,
            SourcePilotAuditId = pilotRunRequest.AuditId,
            Status = "active",
            StatusLabel = "Hypercare 7 天稳定运行中",
            GoLiveWindow = "T+15 正式上线，T+21 完成 7 天 Hypercare 验收",
            HypercareDays = 7,
            OtdTarget = ">= 96%",
            ActualOtd = "97%",
            OeeTarget = ">= 78%",
            CurrentOee = "82%",
            IncidentCount = 1,
            UnresolvedP1P2 = 0,
            AcceptanceGate = "首批真实工单 OTD >= 96%、P1/P2 未关闭事件 = 0、审计导出可交付",
            Owner = "客户厂长 / 交付经理 / 调度主管",
            Monitors = new[]
            {
                new
                {
                    Label = "OTD 稳定性",
                    Target = ">= 96%",
                    Current = "97%",
                    Status = "stable",
                    StatusLabel = "达标",
                    Evidence = "TRACE-POC-HYPERCARE-OTD",
                },
            },
            Checkpoints = new[]
            {
                new
                {
                    Module = "治理审计",
                    Owner = "交付经理",
                    Action = "导出上线验收、指标快照、责任动作和审计追踪给客户复盘。",
                    Status = "active",
                    Evidence = "TRACE-POC-HYPERCARE-AUDIT",
                    Summary = "上线验收记录写入统一 OTD 证据链。",
                },
            },
            AuditId = $"AUD-POC-HYPERCARE-{Guid.NewGuid():N}",
            TraceId = $"TRACE-POC-HYPERCARE-{Guid.NewGuid():N}",
            CreatedAt = DateTime.UtcNow,
            Summary = "POC 已进入正式上线验收，Hypercare 监控跟踪 OTD、OEE、P1/P2 和 AI 建议采纳率。",
        };

        var hypercareUpsert = await _client.PostAsJsonAsync("/api/v1/scheduling/poc-hypercare-acceptance", hypercareRequest);
        hypercareUpsert.StatusCode.Should().Be(HttpStatusCode.OK, await hypercareUpsert.Content.ReadAsStringAsync());

        var hypercareQuery = await _client.GetAsync("/api/v1/scheduling/poc-hypercare-acceptance/latest");
        hypercareQuery.StatusCode.Should().Be(HttpStatusCode.OK);
        var hypercare = await hypercareQuery.Content.ReadFromJsonAsync<JsonElement>();
        hypercare.GetProperty("id").GetString().Should().Be(hypercareId);

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        db.AgentEvidenceLinks.Should().Contain(e => e.EvidenceType == "CustomerOrderImportEvidence" && e.EvidenceKey == importBatchId);
        db.AgentEvidenceLinks.Should().Contain(e => e.EvidenceType == "PocReviewSignoff" && e.EvidenceKey == signoffId);
        db.AgentEvidenceLinks.Should().Contain(e => e.EvidenceType == "PocRolloutPackage" && e.EvidenceKey == rolloutId);
        db.AgentEvidenceLinks.Should().Contain(e => e.EvidenceType == "PocPilotRun" && e.EvidenceKey == pilotRunId);
        db.AgentEvidenceLinks.Should().Contain(e => e.EvidenceType == "PocHypercareAcceptance" && e.EvidenceKey == hypercareId);
        db.AuditLogs.Should().Contain(l => l.Action == "CustomerOrderImportUpsert" && l.ResourceId == importBatchId);
        db.AuditLogs.Should().Contain(l => l.Action == "PocReviewSignoffUpsert" && l.ResourceId == signoffId);
        db.AuditLogs.Should().Contain(l => l.Action == "PocRolloutPackageUpsert" && l.ResourceId == rolloutId);
        db.AuditLogs.Should().Contain(l => l.Action == "PocPilotRunUpsert" && l.ResourceId == pilotRunId);
        db.AuditLogs.Should().Contain(l => l.Action == "PocHypercareAcceptanceUpsert" && l.ResourceId == hypercareId);
    }

    [Fact]
    public async Task PocLatestEvidence_ShouldReturnSeededAuditableChain()
    {
        var endpoints = new[]
        {
            (Path: "/api/v1/scheduling/poc-review-signoff/latest", EvidenceType: "PocReviewSignoff", SeedKey: "poc-review-signoff-integration-current"),
            (Path: "/api/v1/scheduling/poc-rollout-package/latest", EvidenceType: "PocRolloutPackage", SeedKey: "poc-rollout-package-integration-current"),
            (Path: "/api/v1/scheduling/poc-pilot-run/latest", EvidenceType: "PocPilotRun", SeedKey: "poc-pilot-run-integration-current"),
            (Path: "/api/v1/scheduling/poc-hypercare-acceptance/latest", EvidenceType: "PocHypercareAcceptance", SeedKey: "poc-hypercare-acceptance-integration-current"),
        };

        foreach (var endpoint in endpoints)
        {
            var response = await _client.GetAsync(endpoint.Path);

            response.StatusCode.Should().Be(HttpStatusCode.OK, await response.Content.ReadAsStringAsync());
            var payload = await response.Content.ReadFromJsonAsync<JsonElement>();
            payload.GetProperty("id").GetString().Should().NotBeNullOrWhiteSpace();
            payload.GetProperty("auditId").GetString().Should().NotBeNullOrWhiteSpace();
            payload.GetProperty("summary").GetString().Should().NotBeNullOrWhiteSpace();
        }

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        foreach (var endpoint in endpoints)
        {
            db.AgentEvidenceLinks.Should().Contain(e =>
                e.EvidenceType == endpoint.EvidenceType
                && e.EvidenceKey == endpoint.SeedKey);
        }
    }

    [Fact]
    public async Task CustomerPocLatestEvidence_ShouldReturnSeededImportAndEquipmentFault()
    {
        var importResponse = await _client.GetAsync("/api/v1/scheduling/customer-order-import/latest");
        importResponse.StatusCode.Should().Be(HttpStatusCode.OK, await importResponse.Content.ReadAsStringAsync());
        var importEvidence = await importResponse.Content.ReadFromJsonAsync<CustomerOrderImportEvidenceResponse>();
        importEvidence.Should().NotBeNull();
        importEvidence!.BatchId.Should().NotBeNullOrWhiteSpace();
        importEvidence.ImportedOrders.Should().BeGreaterThan(0);
        importEvidence.MappedFields.Should().NotBeEmpty();

        var faultResponse = await _client.GetAsync("/api/v1/scheduling/customer-equipment-fault/latest");
        faultResponse.StatusCode.Should().Be(HttpStatusCode.OK, await faultResponse.Content.ReadAsStringAsync());
        var faultEvidence = await faultResponse.Content.ReadFromJsonAsync<CustomerEquipmentFaultEvidenceResponse>();
        faultEvidence.Should().NotBeNull();
        faultEvidence!.BatchId.Should().NotBeNullOrWhiteSpace();
        faultEvidence.EquipmentCode.Should().NotBeNullOrWhiteSpace();
        faultEvidence.CapturedSignals.Should().NotBeEmpty();

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        db.AgentEvidenceLinks.Should().Contain(e =>
            e.EvidenceType == "CustomerOrderImportEvidence"
            && e.EvidenceKey == "IMP-POC-INTEGRATION-CURRENT");
        db.AgentEvidenceLinks.Should().Contain(e =>
            e.EvidenceType == "CustomerEquipmentFaultEvidence"
            && e.EvidenceKey == "IMP-POC-EQ-FAULT-INTEGRATION-CURRENT");
    }

    [Fact]
    public async Task QualityLatestEvidence_ShouldReturnSeededAuditableRecords()
    {
        var reworkResponse = await _client.GetAsync("/api/v1/scheduling/quality-rework-impact/latest");
        reworkResponse.StatusCode.Should().Be(HttpStatusCode.OK, await reworkResponse.Content.ReadAsStringAsync());
        var rework = await reworkResponse.Content.ReadFromJsonAsync<QualityReworkImpactResponse>();
        rework.Should().NotBeNull();
        rework!.InspectionId.Should().Be("quality-rework-impact-integration-current");
        rework.WorkOrderId.Should().NotBeNullOrWhiteSpace();
        rework.Evidence.Should().NotBeEmpty();

        var mrbResponse = await _client.GetAsync("/api/v1/scheduling/quality-mrb-disposition/latest");
        mrbResponse.StatusCode.Should().Be(HttpStatusCode.OK, await mrbResponse.Content.ReadAsStringAsync());
        var mrb = await mrbResponse.Content.ReadFromJsonAsync<QualityMrbDispositionResponse>();
        mrb.Should().NotBeNull();
        mrb!.Id.Should().Be("quality-mrb-disposition-integration-current");
        mrb.AuditId.Should().NotBeNullOrWhiteSpace();
        mrb.TraceId.Should().NotBeNullOrWhiteSpace();
        mrb.Actions.Should().NotBeEmpty();

        var capaResponse = await _client.GetAsync("/api/v1/scheduling/quality-capa-closure/latest");
        capaResponse.StatusCode.Should().Be(HttpStatusCode.OK, await capaResponse.Content.ReadAsStringAsync());
        var capa = await capaResponse.Content.ReadFromJsonAsync<QualityCapaClosureResponse>();
        capa.Should().NotBeNull();
        capa!.InspectionId.Should().Be("quality-capa-closure-integration-current");
        capa.TraceId.Should().NotBeNullOrWhiteSpace();
        capa.RootCause.Should().NotBeNullOrWhiteSpace();
        capa.ReviewAction.Should().NotBeNullOrWhiteSpace();

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        db.AgentEvidenceLinks.Should().Contain(e =>
            e.EvidenceType == "QualityReworkImpact"
            && e.EvidenceKey == "quality-rework-impact-integration-current");
        db.AgentEvidenceLinks.Should().Contain(e =>
            e.EvidenceType == "QualityMrbDisposition"
            && e.EvidenceKey == "quality-mrb-disposition-integration-current");
        db.AgentEvidenceLinks.Should().Contain(e =>
            e.EvidenceType == "QualityCapaClosure"
            && e.EvidenceKey == "quality-capa-closure-integration-current");
    }

    [Fact]
    public async Task ShortageSupplyLatestEvidence_ShouldReturnSeededAuditableRecords()
    {
        var kittingResponse = await _client.GetAsync("/api/v1/scheduling/shortage-kitting/latest");
        kittingResponse.StatusCode.Should().Be(HttpStatusCode.OK, await kittingResponse.Content.ReadAsStringAsync());
        var kitting = await kittingResponse.Content.ReadFromJsonAsync<ShortageKittingEventResponse>();
        kitting.Should().NotBeNull();
        kitting!.MaterialCode.Should().NotBeNullOrWhiteSpace();
        kitting.WorkOrderNumber.Should().NotBeNullOrWhiteSpace();
        kitting.ShortageQuantity.Should().BeGreaterThan(0);

        var resolutionResponse = await _client.GetAsync("/api/v1/scheduling/shortage-risk-resolution/latest");
        resolutionResponse.StatusCode.Should().Be(HttpStatusCode.OK, await resolutionResponse.Content.ReadAsStringAsync());
        var resolution = await resolutionResponse.Content.ReadFromJsonAsync<ShortageRiskResolutionResponse>();
        resolution.Should().NotBeNull();
        resolution!.MaterialCode.Should().NotBeNullOrWhiteSpace();
        resolution.SourceOrderNumber.Should().NotBeNullOrWhiteSpace();
        resolution.Message.Should().NotBeNullOrWhiteSpace();

        var supplyResponse = await _client.GetAsync("/api/v1/scheduling/supply-risk-escalation/latest");
        supplyResponse.StatusCode.Should().Be(HttpStatusCode.OK, await supplyResponse.Content.ReadAsStringAsync());
        var supply = await supplyResponse.Content.ReadFromJsonAsync<SupplyRiskEscalationResponse>();
        supply.Should().NotBeNull();
        supply!.PurchaseOrderNumber.Should().NotBeNullOrWhiteSpace();
        supply.MaterialCode.Should().NotBeNullOrWhiteSpace();
        supply.TraceId.Should().NotBeNullOrWhiteSpace();

        var supplierResponse = await _client.GetAsync("/api/v1/scheduling/supplier-network-decision/latest");
        supplierResponse.StatusCode.Should().Be(HttpStatusCode.OK, await supplierResponse.Content.ReadAsStringAsync());
        var supplier = await supplierResponse.Content.ReadFromJsonAsync<SupplierNetworkDecisionResponse>();
        supplier.Should().NotBeNull();
        supplier!.MaterialCode.Should().NotBeNullOrWhiteSpace();
        supplier.SelectedSupplierName.Should().NotBeNullOrWhiteSpace();
        supplier.Candidates.Should().NotBeEmpty();

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        db.AgentEvidenceLinks.Should().Contain(e =>
            e.EvidenceType == "ShortageKittingEvent"
            && e.EvidenceKey == "WO-SHORTAGE-INTEGRATION-001:MAT-SHORTAGE-INTEGRATION");
        db.AgentEvidenceLinks.Should().Contain(e =>
            e.EvidenceType == "ShortageRiskResolution"
            && e.EvidenceKey == "PO-SHORTAGE-INTEGRATION-001:MAT-SHORTAGE-INTEGRATION");
        db.AgentEvidenceLinks.Should().Contain(e =>
            e.EvidenceType == "SupplyRiskEscalation"
            && e.EvidenceKey == "PO-SUPPLY-INTEGRATION-001:MAT-SUPPLY-INTEGRATION");
        db.AgentEvidenceLinks.Should().Contain(e =>
            e.EvidenceType == "SupplierNetworkDecision"
            && e.EvidenceKey == "MAT-SUPPLY-INTEGRATION:华东快供二厂");
    }

    [Fact]
    public async Task EngineeringBomLatestEvidence_ShouldReturnSeededAuditableRecords()
    {
        var bomResponse = await _client.GetAsync("/api/v1/scheduling/bom-kitting-package/latest");
        bomResponse.StatusCode.Should().Be(HttpStatusCode.OK, await bomResponse.Content.ReadAsStringAsync());
        var bom = await bomResponse.Content.ReadFromJsonAsync<BomKittingPackageResponse>();
        bom.Should().NotBeNull();
        bom!.Id.Should().NotBeNullOrWhiteSpace();
        bom.TraceId.Should().NotBeNullOrWhiteSpace();
        bom.Items.Should().NotBeEmpty();

        var approvalResponse = await _client.GetAsync("/api/v1/scheduling/alternate-material-approval/latest");
        approvalResponse.StatusCode.Should().Be(HttpStatusCode.OK, await approvalResponse.Content.ReadAsStringAsync());
        var approval = await approvalResponse.Content.ReadFromJsonAsync<AlternateMaterialApprovalResponse>();
        approval.Should().NotBeNull();
        approval!.Id.Should().NotBeNullOrWhiteSpace();
        approval.TraceId.Should().NotBeNullOrWhiteSpace();
        approval.Summary.Should().NotBeNullOrWhiteSpace();

        var changeResponse = await _client.GetAsync("/api/v1/scheduling/engineering-change-impact/latest");
        changeResponse.StatusCode.Should().Be(HttpStatusCode.OK, await changeResponse.Content.ReadAsStringAsync());
        var change = await changeResponse.Content.ReadFromJsonAsync<EngineeringChangeImpactResponse>();
        change.Should().NotBeNull();
        change!.Id.Should().NotBeNullOrWhiteSpace();
        change.TraceId.Should().NotBeNullOrWhiteSpace();
        change.Summary.Should().NotBeNullOrWhiteSpace();

        var routeResponse = await _client.GetAsync("/api/v1/scheduling/route-capability-validation/latest");
        routeResponse.StatusCode.Should().Be(HttpStatusCode.OK, await routeResponse.Content.ReadAsStringAsync());
        var route = await routeResponse.Content.ReadFromJsonAsync<RouteCapabilityValidationResponse>();
        route.Should().NotBeNull();
        route!.Id.Should().NotBeNullOrWhiteSpace();
        route.TraceId.Should().NotBeNullOrWhiteSpace();
        route.Summary.Should().NotBeNullOrWhiteSpace();

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        db.AgentEvidenceLinks.Should().Contain(e =>
            e.EvidenceType == "BomKittingPackage"
            && e.EvidenceKey == "bom-kitting-package-integration-current");
        db.AgentEvidenceLinks.Should().Contain(e =>
            e.EvidenceType == "AlternateMaterialApproval"
            && e.EvidenceKey == "alternate-material-approval-integration-current");
        db.AgentEvidenceLinks.Should().Contain(e =>
            e.EvidenceType == "EngineeringChangeImpact"
            && e.EvidenceKey == "engineering-change-impact-integration-current");
        db.AgentEvidenceLinks.Should().Contain(e =>
            e.EvidenceType == "RouteCapabilityValidation"
            && e.EvidenceKey == "route-capability-validation-integration-current");
    }

    [Fact]
    public async Task ProductionAnomalyLatestEvidence_ShouldReturnSeededAuditableEvent()
    {
        var response = await _client.GetAsync("/api/v1/scheduling/production-anomaly-event/latest");

        response.StatusCode.Should().Be(HttpStatusCode.OK, await response.Content.ReadAsStringAsync());
        var anomaly = await response.Content.ReadFromJsonAsync<JsonElement>();
        anomaly.GetProperty("id").GetString().Should().NotBeNullOrWhiteSpace();
        anomaly.GetProperty("workOrderNumber").GetString().Should().NotBeNullOrWhiteSpace();
        anomaly.GetProperty("operationCode").GetString().Should().NotBeNullOrWhiteSpace();
        anomaly.GetProperty("severity").GetString().Should().NotBeNullOrWhiteSpace();
        anomaly.GetProperty("suggestedAction").GetString().Should().NotBeNullOrWhiteSpace();

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        db.AgentEvidenceLinks.Should().Contain(e =>
            e.EvidenceType == "ProductionAnomalyEvent"
            && e.EvidenceKey == "production-anomaly-event-integration-current");
    }

    [Fact]
    public async Task KnowledgeGovernanceEvidenceApi_ShouldUpsertQueryAndAuditReviews()
    {
        var reviewId = $"knowledge-governance-review-{Guid.NewGuid():N}";
        var documentId = $"kg-doc-{Guid.NewGuid():N}";

        var request = new
        {
            Id = reviewId,
            DocumentId = documentId,
            DocumentTitle = "CNC-01 主轴维护手册",
            Version = "V1.1",
            ReviewedVersion = "V1.2",
            ValidUntil = "2026-12-31",
            Reviewer = "设备主管 / 知识库管理员",
            ReviewedAt = DateTime.UtcNow,
            AuditId = $"AUD-KG-REINDEX-{Guid.NewGuid():N}",
            TraceId = $"TRACE-KG-REINDEX-{Guid.NewGuid():N}",
            Action = "复核有效期并重建 RAG 索引",
            Status = "approved",
            Summary = "CNC-01 主轴维护手册已复核并完成分块索引。",
            References = new[] { "AI 生产助手", "设备维护", "风险预警", "AI 排产" },
        };

        var upsert = await _client.PostAsJsonAsync("/api/v1/scheduling/knowledge-governance-reviews", request);
        upsert.StatusCode.Should().Be(HttpStatusCode.OK, await upsert.Content.ReadAsStringAsync());

        var query = await _client.GetAsync("/api/v1/scheduling/knowledge-governance-reviews?take=5");
        query.StatusCode.Should().Be(HttpStatusCode.OK);
        var records = await query.Content.ReadFromJsonAsync<List<JsonElement>>();
        records.Should().Contain(item => item.GetProperty("id").GetString() == reviewId);

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        db.AgentEvidenceLinks.Should().Contain(e => e.EvidenceType == "KnowledgeGovernanceReview" && e.EvidenceKey == reviewId);
        db.AuditLogs.Should().Contain(l => l.Action == "KnowledgeGovernanceReviewUpsert" && l.ResourceId == reviewId);
    }

    [Fact]
    public async Task ExecutionEvidenceApi_ShouldUpsertQueryAndAuditLaborBarcodeAndCapa()
    {
        var reassignmentId = $"labor-reassignment-{Guid.NewGuid():N}";
        var blockId = $"labor-block-{Guid.NewGuid():N}";
        var barcodeId = $"barcode-scan-{Guid.NewGuid():N}";
        var inspectionId = $"INS-CAPA-{Guid.NewGuid():N}";

        var reassignmentRequest = new
        {
            Id = reassignmentId,
            WorkOrderNumber = "WO-013",
            OperationCode = "OP-10",
            OperationCodes = new[] { "OP-10", "OP-20" },
            OperationName = "淬火 / 回火",
            BlockedEmployeeNumber = "EMP-003",
            BlockedEmployeeName = "王五",
            BlockedCertification = "热处理上岗证",
            BlockedExpiresAt = "2026-05-25",
            ReplacementEmployeeNumber = "EMP-006",
            ReplacementEmployeeName = "孙八",
            ReplacementTeam = "甲班",
            ReplacementShift = "白班",
            ReplacementSkill = "热处理替班复核 / 派工确认",
            ReplacementCertification = "班组长授权",
            ReplacementExpiresAt = "2026-09-30",
            ReviewerEmployeeNumber = "EMP-004",
            ReviewerName = "赵六",
            ReviewerRole = "工程放行",
            Reason = "资质临期替班已确认。",
            AuditId = $"AUD-LABOR-REASSIGN-{Guid.NewGuid():N}",
            TraceId = $"TRACE-LABOR-REASSIGN-{Guid.NewGuid():N}",
            CreatedAt = DateTime.UtcNow.ToString("O"),
            Status = "approved",
        };

        var reassignmentUpsert = await _client.PostAsJsonAsync("/api/v1/scheduling/labor-reassignments", reassignmentRequest);
        reassignmentUpsert.StatusCode.Should().Be(HttpStatusCode.OK, await reassignmentUpsert.Content.ReadAsStringAsync());

        var reassignmentQuery = await _client.GetAsync("/api/v1/scheduling/labor-reassignments?take=5");
        reassignmentQuery.StatusCode.Should().Be(HttpStatusCode.OK);
        var reassignments = await reassignmentQuery.Content.ReadFromJsonAsync<List<JsonElement>>();
        reassignments.Should().Contain(item => item.GetProperty("id").GetString() == reassignmentId);

        var blockRequest = new
        {
            Id = blockId,
            WorkOrderNumber = "WO-013",
            OperationCode = "OP-10",
            OperationCodes = new[] { "OP-10", "OP-20" },
            OperationName = "淬火 / 回火",
            BlockedEmployeeNumber = "EMP-003",
            BlockedEmployeeName = "王五",
            BlockedCertification = "热处理上岗证",
            BlockedExpiresAt = "2026-05-25",
            RequiredSkill = "热处理",
            RequiredTeam = "乙班",
            RequiredShift = "夜班",
            ReviewerEmployeeNumber = "EMP-004",
            ReviewerName = "赵六",
            ReviewerRole = "工程放行",
            Reason = "未找到有效替班候选，必须停工复核。",
            AuditId = $"AUD-LABOR-BLOCK-{Guid.NewGuid():N}",
            TraceId = $"TRACE-LABOR-BLOCK-{Guid.NewGuid():N}",
            CreatedAt = DateTime.UtcNow.ToString("O"),
            Status = "active",
            ReviewedAt = (string?)null,
            ReleasedAt = (string?)null,
            ReleaseAuditId = (string?)null,
            ReleaseTraceId = (string?)null,
            ReleaseReason = (string?)null,
        };

        var blockUpsert = await _client.PostAsJsonAsync("/api/v1/scheduling/labor-qualification-blocks", blockRequest);
        blockUpsert.StatusCode.Should().Be(HttpStatusCode.OK, await blockUpsert.Content.ReadAsStringAsync());

        await using (var duplicateScope = _factory.Services.CreateAsyncScope())
        {
            var duplicateDb = duplicateScope.ServiceProvider.GetRequiredService<MesDbContext>();
            duplicateDb.AgentEvidenceLinks.Add(new AgentEvidenceLink
            {
                AgentDecisionId = $"labor-qualification-block-{blockId}-duplicate",
                EvidenceType = "LaborQualificationBlock",
                EvidenceKey = blockId,
                EvidenceSummary = JsonSerializer.Serialize(blockRequest),
                CreatedAt = DateTime.UtcNow.AddMinutes(-5),
            });
            await duplicateDb.SaveChangesAsync();
        }

        var reviewingBlockRequest = blockRequest with
        {
            Status = "reviewing",
            ReviewedAt = DateTime.UtcNow.ToString("O"),
        };
        var reviewingBlockUpsert = await _client.PostAsJsonAsync("/api/v1/scheduling/labor-qualification-blocks", reviewingBlockRequest);
        reviewingBlockUpsert.StatusCode.Should().Be(HttpStatusCode.OK, await reviewingBlockUpsert.Content.ReadAsStringAsync());

        var blockQuery = await _client.GetAsync("/api/v1/scheduling/labor-qualification-blocks?take=5");
        blockQuery.StatusCode.Should().Be(HttpStatusCode.OK);
        var blocks = await blockQuery.Content.ReadFromJsonAsync<List<JsonElement>>();
        blocks.Should().ContainSingle(item => item.GetProperty("id").GetString() == blockId)
            .Which.GetProperty("status").GetString().Should().Be("reviewing");

        var barcodeRequest = new
        {
            Id = barcodeId,
            Code = "WO-013",
            Type = "WorkOrder",
            Title = "WO-013 工单扫码到站已确认",
            Action = "工单到站报工入口确认",
            Actor = "operator.demo",
            Object = "WO-013",
            Source = "条码扫描 / 现场工位",
            Summary = "现场扫描 WO-013 流转卡并确认已到达报工入口。",
            TraceId = $"TRACE-QR-{Guid.NewGuid():N}",
            StatusLabel = "到站已确认",
            CreatedAt = DateTime.UtcNow.ToString("O"),
            NextCheck = "生产报工开工校验",
        };

        var barcodeUpsert = await _client.PostAsJsonAsync("/api/v1/scheduling/barcode-scan-evidence", barcodeRequest);
        barcodeUpsert.StatusCode.Should().Be(HttpStatusCode.OK, await barcodeUpsert.Content.ReadAsStringAsync());

        var barcodeQuery = await _client.GetAsync("/api/v1/scheduling/barcode-scan-evidence?take=5");
        barcodeQuery.StatusCode.Should().Be(HttpStatusCode.OK);
        var barcodes = await barcodeQuery.Content.ReadFromJsonAsync<List<JsonElement>>();
        barcodes.Should().Contain(item => item.GetProperty("id").GetString() == barcodeId);

        var capaRequest = new
        {
            InspectionId = inspectionId,
            WorkOrderId = "WO-003",
            TraceId = $"TRACE-QA-CAPA-{Guid.NewGuid():N}",
            RootCause = "硬度不足 / 热处理参数漂移",
            EvidenceStrength = 0.72m,
            TaskTitle = "复核 HT-01 炉温曲线并锁定返工参数",
            TaskKind = "纠正措施",
            Owner = "质量工程师 周工",
            DueAt = "今日 15:00",
            Verification = "返工后硬度 HB95+",
            VerifiedAt = DateTime.UtcNow.ToString("O"),
            AuditState = "CAPA 已验证，根因证据、责任人、验证标准和 OTD 复盘已归档",
            OtdImpact = "WO-003 热处理返工风险从 +1 单延期降为待复验观察",
            ReviewAction = "报表中心需在 OTD 复盘中标注质量 CAPA 验证结果。",
        };

        var capaUpsert = await _client.PostAsJsonAsync("/api/v1/scheduling/quality-capa-closure", capaRequest);
        capaUpsert.StatusCode.Should().Be(HttpStatusCode.OK, await capaUpsert.Content.ReadAsStringAsync());

        var capaQuery = await _client.GetAsync("/api/v1/scheduling/quality-capa-closure/latest");
        capaQuery.StatusCode.Should().Be(HttpStatusCode.OK);
        var capa = await capaQuery.Content.ReadFromJsonAsync<JsonElement>();
        capa.GetProperty("inspectionId").GetString().Should().Be(inspectionId);

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        db.AgentEvidenceLinks.Should().Contain(e => e.EvidenceType == "LaborReassignment" && e.EvidenceKey == reassignmentId);
        db.AgentEvidenceLinks.Should().Contain(e => e.EvidenceType == "LaborQualificationBlock" && e.EvidenceKey == blockId);
        db.AgentEvidenceLinks.Should().Contain(e => e.EvidenceType == "BarcodeScanEvidence" && e.EvidenceKey == barcodeId);
        db.AgentEvidenceLinks.Should().Contain(e => e.EvidenceType == "QualityCapaClosure" && e.EvidenceKey == inspectionId);
        db.AuditLogs.Should().Contain(l => l.Action == "LaborReassignmentUpsert" && l.ResourceId == reassignmentId);
        db.AuditLogs.Should().Contain(l => l.Action == "LaborQualificationBlockUpsert" && l.ResourceId == blockId);
        db.AuditLogs.Should().Contain(l => l.Action == "BarcodeScanEvidenceUpsert" && l.ResourceId == barcodeId);
        db.AuditLogs.Should().Contain(l => l.Action == "QualityCapaClosureUpsert" && l.ResourceId == inspectionId);
    }

    [Fact]
    public async Task GovernanceEvidenceApi_ShouldUpsertQueryAndAuditAgentConfigApprovals()
    {
        var approvalId = $"cfg-approval-{Guid.NewGuid():N}";

        var request = new
        {
            Id = approvalId,
            Title = "Agent 自动建议置信度阈值 0.72 -> 0.80",
            ReplayTitle = "Agent 自动建议置信度阈值从 0.72 调整为 0.80",
            ConfigKey = "Agent.RecommendationConfidenceThreshold",
            FromValue = "0.72",
            ToValue = "0.80",
            Reason = "降低低置信建议进入调度员队列的概率。",
            Owner = "MES 管理员复核",
            Status = "approved",
            AuditId = $"TRACE-CFG-{Guid.NewGuid():N}",
            SubmittedBy = "admin",
            SubmittedAt = DateTime.UtcNow.ToString("O"),
            Risk = "置信度阈值提高可能漏掉少量可用排产方案。",
            DecidedBy = "admin",
            DecidedAt = DateTime.UtcNow.ToString("O"),
            PolicyArea = "ai",
            PolicyMetrics = new[]
            {
                new
                {
                    Label = "置信度阈值",
                    FromValue = "0.72",
                    ToValue = "0.80",
                },
            },
            ControlSummary = "审批通过后低置信建议不得直接进入自动建议队列。",
        };

        var upsert = await _client.PostAsJsonAsync("/api/v1/scheduling/agent-config-approvals", request);
        upsert.StatusCode.Should().Be(HttpStatusCode.OK, await upsert.Content.ReadAsStringAsync());

        var query = await _client.GetAsync("/api/v1/scheduling/agent-config-approvals?take=5");
        query.StatusCode.Should().Be(HttpStatusCode.OK);
        var records = await query.Content.ReadFromJsonAsync<List<JsonElement>>();
        records.Should().Contain(item => item.GetProperty("id").GetString() == approvalId);

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        db.AgentEvidenceLinks.Should().Contain(e => e.EvidenceType == "AgentConfigApproval" && e.EvidenceKey == approvalId);
        db.AuditLogs.Should().Contain(l => l.Action == "AgentConfigApprovalUpsert" && l.ResourceId == approvalId);
    }

    [Fact]
    public async Task OtdKpiCommitmentApi_ShouldUpsertQueryLatestAndAuditCommitmentPackages()
    {
        var commitmentId = $"otd-kpi-commitment-{Guid.NewGuid():N}";

        var request = new
        {
            Id = commitmentId,
            SourceKpiId = "customer-huadong",
            DimensionLabel = "客户",
            TargetName = "华东客户群",
            Title = "华东客户群交付恢复承诺包",
            AuditId = $"AUD-KPI-COMMITMENT-{Guid.NewGuid():N}",
            TraceId = $"TRACE-KPI-COMMITMENT-{Guid.NewGuid():N}",
            Actor = "sales.demo",
            BaselineOtd = 40.00m,
            AgentOtd = 56.67m,
            Lift = 16.67m,
            DelayedReduced = 5,
            StatusLabel = "待客户确认",
            Commitment = "华东客户群交付恢复口径：Agent OTD 56.67%（基线 40.00%），提升 +16.67%，延期减少 5 单。",
            Owner = "客户成功 / 调度主管联合确认",
            DueAt = "今日 17:30 前",
            Summary = "KPI 钻取解释已转为客户可复盘承诺包。",
            Actions = new[]
            {
                new
                {
                    Module = "客户交付",
                    Owner = "客户成功 / 售前顾问",
                    Action = "输出 OTD 恢复承诺口径。",
                    Evidence = "TRACE-KPI-COMMITMENT-CUSTOMER",
                },
            },
            CreatedAt = DateTime.UtcNow,
        };

        var upsert = await _client.PostAsJsonAsync("/api/v1/scheduling/otd-kpi-commitments", request);
        upsert.StatusCode.Should().Be(HttpStatusCode.OK, await upsert.Content.ReadAsStringAsync());

        var query = await _client.GetAsync("/api/v1/scheduling/otd-kpi-commitments?take=5");
        query.StatusCode.Should().Be(HttpStatusCode.OK);
        var records = await query.Content.ReadFromJsonAsync<List<JsonElement>>();
        records.Should().Contain(item => item.GetProperty("id").GetString() == commitmentId);

        var latestQuery = await _client.GetAsync("/api/v1/scheduling/otd-kpi-commitments/latest");
        latestQuery.StatusCode.Should().Be(HttpStatusCode.OK);
        var latest = await latestQuery.Content.ReadFromJsonAsync<JsonElement>();
        latest.GetProperty("id").GetString().Should().Be(commitmentId);

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        db.AgentEvidenceLinks.Should().Contain(e => e.EvidenceType == "OtdKpiCommitmentPackage" && e.EvidenceKey == commitmentId);
        db.AuditLogs.Should().Contain(l => l.Action == "OtdKpiCommitmentPackageUpsert" && l.ResourceId == commitmentId);
    }

    [Fact]
    public async Task QualityKnowledgeEvidenceApi_ShouldUpsertQueryAndAuditEvidenceEnvelope()
    {
        var sampleId = $"quality-knowledge-sample-{Guid.NewGuid():N}";
        var retrainingId = $"quality-retraining-version-{Guid.NewGuid():N}";
        var grayDecisionId = $"quality-gray-release-decision-{Guid.NewGuid():N}";

        var sample = new
        {
            Id = sampleId,
            EvidenceType = "QualityKnowledgeSample",
            Title = "WO-DEMO-1018 OP-20 质量知识样本",
            AuditId = $"AUD-KG-SAMPLE-{Guid.NewGuid():N}",
            TraceId = $"TRACE-KG-SAMPLE-{Guid.NewGuid():N}",
            Status = "closed",
            CreatedAt = DateTime.UtcNow,
            Payload = new
            {
                Id = sampleId,
                WorkOrderId = "WO-DEMO-1018",
                OperationCode = "OP-20",
                DefectPattern = "装配扭矩偏移",
                AuditId = $"AUD-KG-SAMPLE-PAYLOAD-{Guid.NewGuid():N}",
                TraceId = $"TRACE-KG-SAMPLE-PAYLOAD-{Guid.NewGuid():N}",
            },
        };
        var retraining = new
        {
            Id = retrainingId,
            EvidenceType = "QualityKnowledgeRetrainingVersion",
            Title = "QK-TRAIN-20260521-R3 装配扭矩再训练集",
            AuditId = $"AUD-KG-RETRAINING-{Guid.NewGuid():N}",
            TraceId = $"TRACE-KG-RETRAINING-{Guid.NewGuid():N}",
            Status = "gray_published",
            CreatedAt = DateTime.UtcNow,
            Payload = new
            {
                Id = retrainingId,
                TrainingSetVersion = "QK-TRAIN-20260521-R3",
                Status = "gray_published",
                PositiveSampleCount = 8,
                NegativeSampleCount = 3,
            },
        };
        var grayDecision = new
        {
            Id = grayDecisionId,
            EvidenceType = "QualityKnowledgeGrayReleaseDecision",
            Title = "QK-TRAIN-20260521-R3 扩大灰度范围",
            AuditId = $"AUD-KG-GRAY-{Guid.NewGuid():N}",
            TraceId = $"TRACE-KG-GRAY-{Guid.NewGuid():N}",
            Status = "expanded",
            CreatedAt = DateTime.UtcNow,
            Payload = new
            {
                Id = grayDecisionId,
                TrainingSetVersion = "QK-TRAIN-20260521-R3",
                Decision = "expanded",
                ApprovalStatus = "approved",
            },
        };

        foreach (var request in new object[] { sample, retraining, grayDecision })
        {
            var upsert = await _client.PostAsJsonAsync("/api/v1/scheduling/quality-knowledge-evidence", request);
            upsert.StatusCode.Should().Be(HttpStatusCode.OK, await upsert.Content.ReadAsStringAsync());
        }

        var query = await _client.GetAsync("/api/v1/scheduling/quality-knowledge-evidence?evidenceType=QualityKnowledgeSample&take=10");
        query.StatusCode.Should().Be(HttpStatusCode.OK);
        var records = await query.Content.ReadFromJsonAsync<List<JsonElement>>();
        records.Should().ContainSingle(item =>
            item.GetProperty("id").GetString() == sampleId
            && item.GetProperty("evidenceType").GetString() == "QualityKnowledgeSample");

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        db.AgentEvidenceLinks.Should().Contain(e => e.EvidenceType == "QualityKnowledgeEvidence" && e.EvidenceKey == $"QualityKnowledgeSample:{sampleId}");
        db.AgentEvidenceLinks.Should().Contain(e => e.EvidenceType == "QualityKnowledgeEvidence" && e.EvidenceKey == $"QualityKnowledgeRetrainingVersion:{retrainingId}");
        db.AgentEvidenceLinks.Should().Contain(e => e.EvidenceType == "QualityKnowledgeEvidence" && e.EvidenceKey == $"QualityKnowledgeGrayReleaseDecision:{grayDecisionId}");
        db.AuditLogs.Should().Contain(l => l.Action == "QualityKnowledgeEvidenceUpsert" && l.ResourceId == $"QualityKnowledgeSample:{sampleId}");
        db.AuditLogs.Should().Contain(l => l.Action == "QualityKnowledgeEvidenceUpsert" && l.ResourceId == $"QualityKnowledgeRetrainingVersion:{retrainingId}");
        db.AuditLogs.Should().Contain(l => l.Action == "QualityKnowledgeEvidenceUpsert" && l.ResourceId == $"QualityKnowledgeGrayReleaseDecision:{grayDecisionId}");
    }

    private async Task CreateAgentWorkOrderAsync(string workshopId, string productCode, int priority)
    {
        var request = new
        {
            OrderNumber = $"WO-AGENT-{Guid.NewGuid():N}",
            ProductCode = productCode,
            ProductName = $"Agent Test {productCode}",
            PlannedQuantity = 50,
            PlannedStartDate = DateTime.UtcNow,
            PlannedEndDate = DateTime.UtcNow.AddDays(priority),
            WorkshopId = workshopId,
            Priority = priority,
            RouteCode = "R-CNC-STD"
        };

        var response = await _client.PostAsJsonAsync("/api/v1/scheduling/workorders", request);
        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    private async Task<AgentDecisionResponse> CreateAgentDecisionAsync(
        string workshopId,
        string eventType,
        string sourceModule,
        string businessKeyType,
        string businessKeyValue)
    {
        var recommendResponse = await _client.PostAsJsonAsync("/api/v1/scheduling/agent/recommend", new
        {
            WorkshopId = workshopId,
            EventType = eventType,
            SourceModule = sourceModule,
            BusinessKeyType = businessKeyType,
            BusinessKeyValue = businessKeyValue
        });
        recommendResponse.StatusCode.Should().Be(HttpStatusCode.Created, await recommendResponse.Content.ReadAsStringAsync());
        var decision = await recommendResponse.Content.ReadFromJsonAsync<AgentDecisionResponse>();
        decision.Should().NotBeNull();
        return decision!;
    }

    private class BatchOptimizeResponse
    {
        public List<ObjectiveCompareItemResponse> Items { get; set; } = new();
        public string? BestOverallObjective { get; set; }
        public RecommendationScoreFormulaResponse? RecommendationScoreFormula { get; set; }
    }

    private class ObjectiveCompareItemResponse
    {
        public string Objective { get; set; } = string.Empty;
        public string ObjectiveLabel { get; set; } = string.Empty;
        public double UtilizationRate { get; set; }
        public double OnTimeDeliveryRate { get; set; }
        public double TotalChangeoverMinutes { get; set; }
        public int GroupCount { get; set; }
        public int TotalWorkOrders { get; set; }
        public double RecommendationScore { get; set; }
        public RecommendationScoreBreakdownResponse? RecommendationScoreBreakdown { get; set; }
    }

    private class RecommendationScoreBreakdownResponse
    {
        public double UtilizationContribution { get; set; }
        public double OnTimeDeliveryContribution { get; set; }
        public double ChangeoverContribution { get; set; }
    }

    private class RecommendationScoreFormulaResponse
    {
        public string Version { get; set; } = string.Empty;
        public double UtilizationWeight { get; set; }
        public double OnTimeDeliveryWeight { get; set; }
        public double ChangeoverWeight { get; set; }
        public double ChangeoverNormalizationMinutes { get; set; }
        public string Description { get; set; } = string.Empty;
    }

    private class SchedulingResultResponse
    {
        public SchedulePlanResponse Plan { get; set; } = new();
        public List<ScheduleAssignmentResponse> Assignments { get; set; } = new();
    }

    private class ScheduleAssignmentResponse
    {
        public string WorkOrderId { get; set; } = string.Empty;
        public string EquipmentId { get; set; } = string.Empty;
    }

    private class PagedResultResponse<T>
    {
        public List<T> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    private class WorkOrderResponse
    {
        public string Id { get; set; } = string.Empty;
        public string OrderNumber { get; set; } = string.Empty;
        public string ProductCode { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public int PlannedQuantity { get; set; }
        public string Status { get; set; } = string.Empty;
        public string WorkshopId { get; set; } = string.Empty;
        public int Priority { get; set; }
    }

    private class SchedulePlanResponse
    {
        public string Id { get; set; } = string.Empty;
        public string PlanName { get; set; } = string.Empty;
        public DateTime PlanStartDate { get; set; }
        public DateTime PlanEndDate { get; set; }
        public int GroupCount { get; set; }
        public List<ScheduleItemResponse> Items { get; set; } = new();
    }

    private class ScheduleItemResponse
    {
        public string Id { get; set; } = string.Empty;
        public string WorkOrderNumber { get; set; } = string.Empty;
        public string EquipmentName { get; set; } = string.Empty;
        public DateTime PlannedStartTime { get; set; }
        public DateTime PlannedEndTime { get; set; }
    }

    private class AgentDecisionResponse
    {
        public string Id { get; set; } = string.Empty;
        public string BoundedContext { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? RecommendedScenarioId { get; set; }
        public string? AdoptedScenarioId { get; set; }
        public List<AgentDecisionScenarioResponse> Scenarios { get; set; } = new();
    }

    private class AgentDecisionScenarioResponse
    {
        public string Id { get; set; } = string.Empty;
        public string StrategyName { get; set; } = string.Empty;
    }

    private class AdoptionFeedbackSnapshotResponse
    {
        public string Decision { get; set; } = string.Empty;
        public string DecisionLabel { get; set; } = string.Empty;
        public string ReasonCategory { get; set; } = string.Empty;
        public string CategoryLabel { get; set; } = string.Empty;
        public string? ReasonDetail { get; set; }
        public string ObjectiveLabel { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string? TraceId { get; set; }
        public string Source { get; set; } = string.Empty;
        public string? AgentDecisionId { get; set; }
    }

    private class RiskSlaReviewResponse
    {
        public string Id { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string StatusLabel { get; set; } = string.Empty;
        public string ReviewMeetingId { get; set; } = string.Empty;
        public string TraceId { get; set; } = string.Empty;
        public List<object> Risks { get; set; } = new();
        public List<object> Actions { get; set; } = new();
    }

    private class OtdEvidenceChainItemResponse
    {
        public string Id { get; set; } = string.Empty;
        public string Stage { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public string Object { get; set; } = string.Empty;
        public string Source { get; set; } = string.Empty;
        public string TraceId { get; set; } = string.Empty;
        public string? SourceTraceId { get; set; }
        public string Status { get; set; } = string.Empty;
        public string StatusLabel { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    private class EquipmentDowntimeEventResponse
    {
        public string EquipmentCode { get; set; } = string.Empty;
        public string EquipmentName { get; set; } = string.Empty;
        public decimal DowntimeHours { get; set; }
        public string AffectedOrders { get; set; } = string.Empty;
        public string AlternativeEquipment { get; set; } = string.Empty;
        public string MaintenanceWindow { get; set; } = string.Empty;
        public string ProtectionStrategy { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    private class CustomerOrderImportEvidenceResponse
    {
        public string BatchId { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string Source { get; set; } = string.Empty;
        public int ImportedOrders { get; set; }
        public int HighRiskOrders { get; set; }
        public List<string> MappedFields { get; set; } = new();
        public DateTime PreparedAt { get; set; }
    }

    private class CustomerEquipmentFaultEvidenceResponse
    {
        public string BatchId { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string Source { get; set; } = string.Empty;
        public string EquipmentCode { get; set; } = string.Empty;
        public int FaultSamples { get; set; }
        public string AffectedOrders { get; set; } = string.Empty;
        public decimal DowntimeHours { get; set; }
        public List<string> CapturedSignals { get; set; } = new();
        public DateTime PreparedAt { get; set; }
    }

    private class ShortageKittingEventResponse
    {
        public string MaterialCode { get; set; } = string.Empty;
        public string MaterialName { get; set; } = string.Empty;
        public string WorkOrderNumber { get; set; } = string.Empty;
        public string AffectedOrders { get; set; } = string.Empty;
        public decimal RequiredQuantity { get; set; }
        public decimal AvailableQuantity { get; set; }
        public decimal InboundQuantity { get; set; }
        public decimal ShortageQuantity { get; set; }
        public string Window { get; set; } = string.Empty;
        public string Suggestion { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    private class ShortageRiskResolutionResponse
    {
        public string MaterialCode { get; set; } = string.Empty;
        public string MaterialName { get; set; } = string.Empty;
        public string AffectedOrders { get; set; } = string.Empty;
        public string SourceOrderNumber { get; set; } = string.Empty;
        public decimal ReceivedQuantity { get; set; }
        public string Unit { get; set; } = string.Empty;
        public decimal AvailableQuantity { get; set; }
        public DateTime ResolvedAt { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    private class BomKittingPackageResponse
    {
        public string Id { get; set; } = string.Empty;
        public string BomCode { get; set; } = string.Empty;
        public string BomVersion { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string WorkOrderNumber { get; set; } = string.Empty;
        public string ScheduleWindow { get; set; } = string.Empty;
        public string StatusLabel { get; set; } = string.Empty;
        public string Owner { get; set; } = string.Empty;
        public string AuditId { get; set; } = string.Empty;
        public string TraceId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string Summary { get; set; } = string.Empty;
        public List<BomKittingPackageItemResponse> Items { get; set; } = new();
    }

    private class BomKittingPackageItemResponse
    {
        public string MaterialCode { get; set; } = string.Empty;
        public string MaterialName { get; set; } = string.Empty;
        public decimal RequiredQuantity { get; set; }
        public decimal AvailableQuantity { get; set; }
        public decimal InboundQuantity { get; set; }
        public decimal ShortageQuantity { get; set; }
        public string Unit { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
    }

    private class SupplyRiskEscalationResponse
    {
        public string PurchaseOrderNumber { get; set; } = string.Empty;
        public string MaterialCode { get; set; } = string.Empty;
        public string MaterialName { get; set; } = string.Empty;
        public string SupplierName { get; set; } = string.Empty;
        public DateTime OriginalDeliveryDate { get; set; }
        public DateTime PromisedDeliveryDate { get; set; }
        public int DelayDays { get; set; }
        public string AffectedOrders { get; set; } = string.Empty;
        public string AlternateSupplierName { get; set; } = string.Empty;
        public string AlternatePromiseDate { get; set; } = string.Empty;
        public string Decision { get; set; } = string.Empty;
        public string StatusLabel { get; set; } = string.Empty;
        public string AuditId { get; set; } = string.Empty;
        public string TraceId { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? ReceivedAt { get; set; }
        public decimal? ReceivedQuantity { get; set; }
        public string? ReceiptAuditId { get; set; }
        public string? ReceiptTraceId { get; set; }
        public string? ReceiptMessage { get; set; }
    }

    private class SupplierNetworkDecisionResponse
    {
        public string MaterialCode { get; set; } = string.Empty;
        public string MaterialName { get; set; } = string.Empty;
        public string AffectedOrders { get; set; } = string.Empty;
        public string SelectedSupplierName { get; set; } = string.Empty;
        public string SelectedPromiseDate { get; set; } = string.Empty;
        public decimal SelectedPerformanceScore { get; set; }
        public decimal SelectedOnTimeRate { get; set; }
        public decimal SelectedQuotedPrice { get; set; }
        public decimal SelectedCapacityQuantity { get; set; }
        public List<SupplierNetworkCandidateResponse> Candidates { get; set; } = new();
        public string StatusLabel { get; set; } = string.Empty;
        public string AuditId { get; set; } = string.Empty;
        public string TraceId { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    private class SupplierNetworkCandidateResponse
    {
        public string SupplierName { get; set; } = string.Empty;
        public string PromiseDate { get; set; } = string.Empty;
        public decimal QuotedPrice { get; set; }
        public decimal CapacityQuantity { get; set; }
        public decimal OnTimeRate { get; set; }
        public decimal DefectRate { get; set; }
        public decimal PerformanceScore { get; set; }
        public int SlaLeadTimeHours { get; set; }
        public string SlaStatus { get; set; } = string.Empty;
        public string RiskNote { get; set; } = string.Empty;
    }

    private class OutsourcingCommitmentPackageResponse
    {
        public string Id { get; set; } = string.Empty;
        public string SourceKpiId { get; set; } = string.Empty;
        public string DimensionLabel { get; set; } = string.Empty;
        public string TargetName { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string AuditId { get; set; } = string.Empty;
        public string TraceId { get; set; } = string.Empty;
        public string Actor { get; set; } = string.Empty;
        public decimal BaselineOtd { get; set; }
        public decimal AgentOtd { get; set; }
        public decimal Lift { get; set; }
        public int DelayedReduced { get; set; }
        public string StatusLabel { get; set; } = string.Empty;
        public string Commitment { get; set; } = string.Empty;
        public string Owner { get; set; } = string.Empty;
        public string DueAt { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public List<OutsourcingCommitmentActionResponse> Actions { get; set; } = new();
        public string PartnerName { get; set; } = string.Empty;
        public string PromiseDate { get; set; } = string.Empty;
        public string AffectedOrders { get; set; } = string.Empty;
        public string SourceTraceId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? ReceivedAt { get; set; }
        public string? ReceivedBy { get; set; }
        public string? ReceiptAuditId { get; set; }
        public string? ReceiptTraceId { get; set; }
        public string? ReceiptMessage { get; set; }
        public DateTime? ScheduleReleasedAt { get; set; }
        public string? ScheduleReleasedBy { get; set; }
        public string? ScheduleReleaseAuditId { get; set; }
        public string? ScheduleReleaseTraceId { get; set; }
        public string? ScheduleReleaseMessage { get; set; }
    }

    private class OutsourcingCommitmentActionResponse
    {
        public string Module { get; set; } = string.Empty;
        public string Owner { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string Evidence { get; set; } = string.Empty;
    }

    private class QualityReworkImpactResponse
    {
        public string InspectionId { get; set; } = string.Empty;
        public string WorkOrderId { get; set; } = string.Empty;
        public string ProductCode { get; set; } = string.Empty;
        public string ProcessName { get; set; } = string.Empty;
        public string EquipmentCode { get; set; } = string.Empty;
        public string MaterialBatchCode { get; set; } = string.Empty;
        public string BatchCode { get; set; } = string.Empty;
        public string InspectionPoint { get; set; } = string.Empty;
        public int DefectQuantity { get; set; }
        public decimal ReworkHours { get; set; }
        public string OtdImpact { get; set; } = string.Empty;
        public string RecommendedAction { get; set; } = string.Empty;
        public string RootCause { get; set; } = string.Empty;
        public List<string> Evidence { get; set; } = new();
        public DateTime CreatedAt { get; set; }
    }

    private class QualityMrbDispositionResponse
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string InspectionId { get; set; } = string.Empty;
        public string WorkOrderId { get; set; } = string.Empty;
        public string ProductCode { get; set; } = string.Empty;
        public string ProcessName { get; set; } = string.Empty;
        public string EquipmentCode { get; set; } = string.Empty;
        public string MaterialBatchCode { get; set; } = string.Empty;
        public string BatchCode { get; set; } = string.Empty;
        public string InspectionPoint { get; set; } = string.Empty;
        public string DefectPattern { get; set; } = string.Empty;
        public int DefectQuantity { get; set; }
        public string Disposition { get; set; } = string.Empty;
        public string DispositionLabel { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string StatusLabel { get; set; } = string.Empty;
        public string Owner { get; set; } = string.Empty;
        public string DueAt { get; set; } = string.Empty;
        public string OtdImpact { get; set; } = string.Empty;
        public string ScheduleImpact { get; set; } = string.Empty;
        public string RecommendedAction { get; set; } = string.Empty;
        public string AuditId { get; set; } = string.Empty;
        public string TraceId { get; set; } = string.Empty;
        public string ScheduleTraceId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public List<QualityMrbDispositionActionResponse> Actions { get; set; } = new();
        public string? ClosureAuditId { get; set; }
        public string? ClosureTraceId { get; set; }
        public string? ClosureSummary { get; set; }
        public DateTime? ClosedAt { get; set; }
        public string? ClosedBy { get; set; }
    }

    private class QualityMrbDispositionActionResponse
    {
        public string Module { get; set; } = string.Empty;
        public string Owner { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string DueAt { get; set; } = string.Empty;
        public string Evidence { get; set; } = string.Empty;
        public string? Result { get; set; }
    }

    private class QualityCapaClosureResponse
    {
        public string InspectionId { get; set; } = string.Empty;
        public string WorkOrderId { get; set; } = string.Empty;
        public string TraceId { get; set; } = string.Empty;
        public string RootCause { get; set; } = string.Empty;
        public decimal EvidenceStrength { get; set; }
        public string TaskTitle { get; set; } = string.Empty;
        public string TaskKind { get; set; } = string.Empty;
        public string Owner { get; set; } = string.Empty;
        public string DueAt { get; set; } = string.Empty;
        public string Verification { get; set; } = string.Empty;
        public string VerifiedAt { get; set; } = string.Empty;
        public string AuditState { get; set; } = string.Empty;
        public string OtdImpact { get; set; } = string.Empty;
        public string ReviewAction { get; set; } = string.Empty;
    }

    private class AlternateMaterialApprovalResponse
    {
        public string Id { get; set; } = string.Empty;
        public string BomCode { get; set; } = string.Empty;
        public string BomVersion { get; set; } = string.Empty;
        public string SourceMaterialCode { get; set; } = string.Empty;
        public string AlternateMaterialCode { get; set; } = string.Empty;
        public string AlternateMaterialName { get; set; } = string.Empty;
        public string AffectedOrders { get; set; } = string.Empty;
        public string ApprovedBy { get; set; } = string.Empty;
        public DateTime ApprovedAt { get; set; }
        public string AuditId { get; set; } = string.Empty;
        public string TraceId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
    }

    private class EngineeringChangeImpactResponse
    {
        public string Id { get; set; } = string.Empty;
        public string ChangeId { get; set; } = string.Empty;
        public string BomCode { get; set; } = string.Empty;
        public string BomVersion { get; set; } = string.Empty;
        public string ChangeTitle { get; set; } = string.Empty;
        public string SourceMaterialCode { get; set; } = string.Empty;
        public string AlternateMaterialCode { get; set; } = string.Empty;
        public string AlternateMaterialName { get; set; } = string.Empty;
        public string AffectedOrders { get; set; } = string.Empty;
        public string InventoryImpact { get; set; } = string.Empty;
        public string QualityImpact { get; set; } = string.Empty;
        public string SupplierImpact { get; set; } = string.Empty;
        public string CostImpact { get; set; } = string.Empty;
        public string OtdImpact { get; set; } = string.Empty;
        public string ScheduleWindow { get; set; } = string.Empty;
        public string RecommendedDecision { get; set; } = string.Empty;
        public string AnalyzedBy { get; set; } = string.Empty;
        public DateTime AnalyzedAt { get; set; }
        public string AuditId { get; set; } = string.Empty;
        public string TraceId { get; set; } = string.Empty;
        public string Decision { get; set; } = string.Empty;
        public string DecisionLabel { get; set; } = string.Empty;
        public string? DecidedBy { get; set; }
        public DateTime? DecidedAt { get; set; }
        public string? DecisionReason { get; set; }
        public string? DecisionAuditId { get; set; }
        public string StatusLabel { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
    }

    private class RouteCapabilityValidationResponse
    {
        public string Id { get; set; } = string.Empty;
        public string RouteCode { get; set; } = string.Empty;
        public string RouteVersion { get; set; } = string.Empty;
        public string RouteName { get; set; } = string.Empty;
        public string OperationCode { get; set; } = string.Empty;
        public string OperationName { get; set; } = string.Empty;
        public string BottleneckResource { get; set; } = string.Empty;
        public string CandidateEquipment { get; set; } = string.Empty;
        public string AffectedOrders { get; set; } = string.Empty;
        public decimal CapacityGapHours { get; set; }
        public decimal ChangeoverMinutes { get; set; }
        public string BatchWindow { get; set; } = string.Empty;
        public string Decision { get; set; } = string.Empty;
        public string ValidatedBy { get; set; } = string.Empty;
        public DateTime ValidatedAt { get; set; }
        public string? ApprovedBy { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public string AuditId { get; set; } = string.Empty;
        public string TraceId { get; set; } = string.Empty;
        public string StatusLabel { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
    }

    private class AuditLogResponse
    {
        public string Id { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string Resource { get; set; } = string.Empty;
    }
}
