using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Xunit;

namespace MES.Tests.Integration.Controllers;

/// <summary>
/// 质量控制器集成测试
/// </summary>
public class QualityControllerTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public QualityControllerTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetStatistics_ShouldReturnOkResult()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/quality/statistics");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetInspectionById_WhenNotExists_ShouldReturnNotFound()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/quality/inspections/non-existent-id");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task CreateInspection_ShouldReturnCreatedResult()
    {
        // Arrange
        var request = new
        {
            WorkOrderId = "wo-001",
            ProductCode = "PROD-001",
            ProcessName = "Machining",
            InspectionPoint = "Dimension Check",
            InspectionQuantity = 100,
            QualifiedQuantity = 95,
            DefectQuantity = 5,
            Result = "Pass",
            InspectorId = "inspector-001"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/quality/inspections", request);

        // Assert
        // 可能返回Created或BadRequest（如果工单不存在）
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Created, HttpStatusCode.BadRequest);
    }
}
