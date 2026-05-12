using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Xunit;

namespace MES.Tests.Integration.Controllers;

/// <summary>
/// 设备控制器集成测试
/// </summary>
public class EquipmentControllerTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public EquipmentControllerTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetEquipments_ShouldReturnOkResult()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/equipment");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetStatistics_ShouldReturnOkResult()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/equipment/statistics");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetEquipmentById_WhenNotExists_ShouldReturnNotFound()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/equipment/non-existent-id");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task CreateEquipment_ShouldReturnCreatedResult()
    {
        // Arrange
        var request = new
        {
            EquipmentCode = "CNC-TEST-001",
            EquipmentName = "Test CNC Machine",
            EquipmentType = "CNC",
            WorkshopId = "ws-001",
            WorkshopName = "Test Workshop",
            Capacity = 100.0
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/equipment", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }
}
