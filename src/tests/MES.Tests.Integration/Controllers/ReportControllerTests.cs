using System.Net;
using System.Net.Http.Json;
using ClosedXML.Excel;
using FluentAssertions;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Enums;
using MES.Infrastructure.Data;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace MES.Tests.Integration.Controllers;

[Collection("IntegrationSerial")]
public class ReportControllerTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly TestWebApplicationFactory _factory;

    public ReportControllerTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetDashboard_ShouldReturnOk()
    {
        var response = await _client.GetAsync("/api/v1/report/dashboard");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetDashboard_ShouldReturnAllSections()
    {
        var response = await _client.GetFromJsonAsync<ReportDashboardResponse>("/api/v1/report/dashboard");

        response.Should().NotBeNull();
        response!.Production.Should().NotBeNull();
        response.Quality.Should().NotBeNull();
        response.Equipment.Should().NotBeNull();
        response.Anomaly.Should().NotBeNull();
    }

    [Fact]
    public async Task GetDashboard_Values_ShouldBeInRange()
    {
        var response = await _client.GetFromJsonAsync<ReportDashboardResponse>("/api/v1/report/dashboard");
        response.Should().NotBeNull();

        response!.Production!.TotalWorkOrders.Should().BeGreaterThan(0);
        response.Production.CompletedOrders.Should().BeGreaterThanOrEqualTo(0);
        response.Production.InProgressOrders.Should().BeGreaterThanOrEqualTo(0);
        response.Production.OnTimeRate.Should().BeInRange(0, 1);

        response.Quality!.PassRate.Should().BeInRange(0, 1);
        response.Quality.DefectRate.Should().BeInRange(0, 1);
        response.Quality.TotalInspections.Should().BeGreaterThanOrEqualTo(0);

        response.Equipment!.TotalEquipment.Should().BeGreaterThan(0);
        response.Equipment.RunningCount.Should().BeGreaterThanOrEqualTo(0);
        response.Equipment.UtilizationRate.Should().BeInRange(0, 1);

        response.Anomaly!.OpenCount.Should().BeGreaterThanOrEqualTo(0);
        response.Anomaly.AvgResolveHours.Should().BeGreaterThanOrEqualTo(0);
    }

    [Fact]
    public async Task GetDashboard_WithoutAnomalies_ShouldNotReturnFabricatedAnomalyDistribution()
    {
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
            db.ProductionAnomalies.RemoveRange(db.ProductionAnomalies);
            db.SaveChanges();
        }

        var response = await _client.GetFromJsonAsync<ReportDashboardResponse>("/api/v1/report/dashboard");

        response.Should().NotBeNull();
        response!.Anomaly!.TotalAnomalies.Should().Be(0);
        response.Anomaly.OpenCount.Should().Be(0);
        response.Anomaly.ResolvedCount.Should().Be(0);
        response.Anomaly.AnomalyByType.Should().BeEmpty();
    }

    [Fact]
    public async Task GetDashboard_OnTimeRate_ShouldCountOverdueUnfinishedWorkOrdersInDenominator()
    {
        var now = DateTime.UtcNow;
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
            db.WorkOrders.RemoveRange(db.WorkOrders);

            db.WorkOrders.Add(CreateWorkOrder("WO-ONTIME", now.AddDays(-3), now.AddDays(1), WorkOrderStatus.Completed));
            db.WorkOrders.Add(CreateWorkOrder("WO-LATE", now.AddDays(-4), now.AddDays(-1), WorkOrderStatus.Completed));
            db.WorkOrders.Add(CreateWorkOrder("WO-OVERDUE", now.AddDays(-5), now.AddDays(-2), WorkOrderStatus.InProgress));
            db.WorkOrders.Add(CreateWorkOrder("WO-FUTURE", now, now.AddDays(2), WorkOrderStatus.InProgress));

            db.SaveChanges();
        }

        var response = await _client.GetFromJsonAsync<ReportDashboardResponse>("/api/v1/report/dashboard");

        response.Should().NotBeNull();
        response!.Production!.OnTimeRate.Should().Be(0.333);
    }

    [Fact]
    public async Task GetDashboard_ShouldExposeLatestAuditableScheduleFeedbackEvidence()
    {
        _factory.SeedData(db =>
        {
            db.ScheduleAdoptionFeedbacks.RemoveRange(db.ScheduleAdoptionFeedbacks);
            db.ScheduleAdoptionFeedbacks.Add(new ScheduleAdoptionFeedback
            {
                SchedulePlanId = "plan-report-evidence",
                WorkshopId = "WS-001",
                OptimizationObjective = "balanced",
                ReasonCategory = OverrideReasonCategory.UrgentInsertion,
                ReasonDetail = "急单插入后采纳综合平衡方案",
                OperatorUser = "planner.li",
                AiTraceId = "TRACE-SCH-FEEDBACK-REPORT",
                AgentDecisionId = "decision-report-balanced-001",
                InitiatedByAgent = true,
                CreatedAt = new DateTime(2026, 6, 14, 10, 30, 0, DateTimeKind.Utc),
            });
        });

        var response = await _client.GetFromJsonAsync<ReportDashboardResponse>("/api/v1/report/dashboard");

        response.Should().NotBeNull();
        response!.ScheduleFeedback.Should().NotBeNull();
        response.ScheduleFeedback!.Decision.Should().Be("accepted");
        response.ScheduleFeedback.DecisionLabel.Should().Be("已采纳 Agent 排产建议");
        response.ScheduleFeedback.CategoryLabel.Should().Be("紧急插单");
        response.ScheduleFeedback.ReasonDetail.Should().Be("急单插入后采纳综合平衡方案");
        response.ScheduleFeedback.ObjectiveLabel.Should().Be("综合平衡");
        response.ScheduleFeedback.TraceId.Should().Be("TRACE-SCH-FEEDBACK-REPORT");
        response.ScheduleFeedback.AgentDecisionId.Should().Be("decision-report-balanced-001");
    }

    [Fact]
    public async Task ExportExcel_ShouldReturnFile()
    {
        var response = await _client.GetAsync("/api/v1/report/export/excel");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        response.Content.Headers.ContentType?.MediaType.Should().Be("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        var bytes = await response.Content.ReadAsByteArrayAsync();
        bytes.Length.Should().BeGreaterThan(100);
    }

    [Fact]
    public async Task ExportExcel_ShouldIncludeAuditableScheduleFeedbackEvidence()
    {
        _factory.SeedData(db =>
        {
            db.ScheduleAdoptionFeedbacks.RemoveRange(db.ScheduleAdoptionFeedbacks);
            db.ScheduleAdoptionFeedbacks.Add(new ScheduleAdoptionFeedback
            {
                SchedulePlanId = "plan-report-export-evidence",
                WorkshopId = "WS-001",
                OptimizationObjective = "balanced",
                ReasonCategory = OverrideReasonCategory.UrgentInsertion,
                ReasonDetail = "急单插入后采纳综合平衡导出方案",
                OperatorUser = "planner.li",
                AiTraceId = "TRACE-SCH-FEEDBACK-EXPORT",
                AgentDecisionId = "decision-export-balanced-001",
                InitiatedByAgent = true,
                CreatedAt = new DateTime(2026, 6, 14, 11, 0, 0, DateTimeKind.Utc),
            });
        });

        var response = await _client.GetAsync("/api/v1/report/export/excel");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        await using var stream = await response.Content.ReadAsStreamAsync();
        using var workbook = new XLWorkbook(stream);
        var worksheet = workbook.Worksheet("排产采纳反馈");

        worksheet.Cell(2, 1).GetString().Should().Be("采纳结果");
        worksheet.Cell(2, 2).GetString().Should().Be("已采纳 Agent 排产建议");
        worksheet.Cell(3, 2).GetString().Should().Be("紧急插单");
        worksheet.Cell(4, 2).GetString().Should().Be("急单插入后采纳综合平衡导出方案");
        worksheet.Cell(5, 2).GetString().Should().Be("综合平衡");
        worksheet.Cell(6, 2).GetString().Should().Be("TRACE-SCH-FEEDBACK-EXPORT");
        worksheet.Cell(7, 2).GetString().Should().Be("decision-export-balanced-001");
    }

    [Fact]
    public async Task ExportPdf_ShouldReturnFile()
    {
        var response = await _client.GetAsync("/api/v1/report/export/pdf");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        response.Content.Headers.ContentType?.MediaType.Should().Be("application/pdf");
        var bytes = await response.Content.ReadAsByteArrayAsync();
        bytes.Length.Should().BeGreaterThan(100);
    }

    private class ReportDashboardResponse
    {
        public ProductionSummaryResponse? Production { get; set; }
        public QualitySummaryResponse? Quality { get; set; }
        public EquipmentSummaryResponse? Equipment { get; set; }
        public AnomalySummaryResponse? Anomaly { get; set; }
        public ScheduleFeedbackResponse? ScheduleFeedback { get; set; }
    }

    private class ProductionSummaryResponse
    {
        public int TotalWorkOrders { get; set; }
        public int CompletedOrders { get; set; }
        public int InProgressOrders { get; set; }
        public double OnTimeRate { get; set; }
    }

    private class QualitySummaryResponse
    {
        public double PassRate { get; set; }
        public double DefectRate { get; set; }
        public int TotalInspections { get; set; }
        public int DefectCount { get; set; }
    }

    private class EquipmentSummaryResponse
    {
        public int TotalEquipment { get; set; }
        public int RunningCount { get; set; }
        public double UtilizationRate { get; set; }
        public double AvailabilityRate { get; set; }
    }

    private class AnomalySummaryResponse
    {
        public int TotalAnomalies { get; set; }
        public int OpenCount { get; set; }
        public int ResolvedCount { get; set; }
        public double AvgResolveHours { get; set; }
        public List<ChartDataPointResponse> AnomalyByType { get; set; } = new();
    }

    private class ScheduleFeedbackResponse
    {
        public string Decision { get; set; } = string.Empty;
        public string DecisionLabel { get; set; } = string.Empty;
        public string ReasonCategory { get; set; } = string.Empty;
        public string CategoryLabel { get; set; } = string.Empty;
        public string ReasonDetail { get; set; } = string.Empty;
        public string ObjectiveLabel { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string? TraceId { get; set; }
        public string Source { get; set; } = string.Empty;
        public string? AgentDecisionId { get; set; }
    }

    private class ChartDataPointResponse
    {
        public string Label { get; set; } = string.Empty;
        public double Value { get; set; }
    }

    private static WorkOrder CreateWorkOrder(
        string orderNumber,
        DateTime plannedStart,
        DateTime plannedEnd,
        WorkOrderStatus status)
    {
        var workOrder = WorkOrder.Create(orderNumber, "PROD-A", "Product A", 10, plannedStart, plannedEnd, "WS-001");
        if (status is WorkOrderStatus.InProgress)
        {
            workOrder.Start();
        }

        if (status is WorkOrderStatus.Completed)
        {
            workOrder.Start();
            workOrder.Complete(10);
        }

        return workOrder;
    }
}
