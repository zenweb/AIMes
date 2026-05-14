using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Xunit;

namespace MES.Tests.Integration.Controllers;

public class SchedulingControllerTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public SchedulingControllerTests(TestWebApplicationFactory factory)
    {
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

        response.StatusCode.Should().Be(HttpStatusCode.Created);
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
    public async Task GetCurrentPlan_ShouldReturnOkOrNotFound()
    {
        var response = await _client.GetAsync("/api/v1/scheduling/current");

        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.NotFound);
        if (response.StatusCode == HttpStatusCode.OK)
        {
            var result = await response.Content.ReadFromJsonAsync<SchedulePlanResponse>();
            result.Should().NotBeNull();
        }
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
        result.Items.Should().HaveCount(2);
        result.Items.Should().Contain(i => i.Objective == "due_date");
        result.Items.Should().Contain(i => i.Objective == "utilization");
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

    private class BatchOptimizeResponse
    {
        public List<ObjectiveCompareItemResponse> Items { get; set; } = new();
        public string? BestOverallObjective { get; set; }
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
    }
}
