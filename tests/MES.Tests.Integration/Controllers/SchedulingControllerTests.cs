using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Xunit;

namespace MES.Tests.Integration.Controllers;

/// <summary>
/// 排产控制器集成测试
/// </summary>
public class SchedulingControllerTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public SchedulingControllerTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetWorkOrders_ShouldReturnOkResult()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/scheduling/workorders");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task CreateWorkOrder_ShouldReturnCreatedResult()
    {
        // Arrange
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

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/scheduling/workorders", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    [Fact]
    public async Task GetAllPlans_ShouldReturnOkResult()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/scheduling/plans");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
