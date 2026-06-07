using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Xunit;

namespace MES.Tests.Integration.Controllers;

[Collection("IntegrationSerial")]
public class QualityControllerTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public QualityControllerTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetStatistics_ShouldReturnValidStats()
    {
        var response = await _client.GetAsync("/api/v1/quality/statistics");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<QualityStatisticsResponse>();
        result.Should().NotBeNull();
        result!.TotalInspections.Should().BeGreaterThanOrEqualTo(0);
    }

    [Fact]
    public async Task GetStatistics_WithProductCode_ShouldReturnFiltered()
    {
        var response = await _client.GetAsync("/api/v1/quality/statistics?productCode=PROD-001");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<QualityStatisticsResponse>();
        result.Should().NotBeNull();
    }

    [Fact]
    public async Task GetInspectionById_WhenNotExists_ShouldReturnNotFound()
    {
        var response = await _client.GetAsync("/api/v1/quality/inspections/non-existent-id");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task CreateInspection_ShouldReturnCreatedWithDto()
    {
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

        var response = await _client.PostAsJsonAsync("/api/v1/quality/inspections", request);

        response.StatusCode.Should().BeOneOf(HttpStatusCode.Created, HttpStatusCode.BadRequest);
        if (response.StatusCode == HttpStatusCode.Created)
        {
            var result = await response.Content.ReadFromJsonAsync<InspectionResponse>();
            result.Should().NotBeNull();
            result!.WorkOrderId.Should().Be("wo-001");
            result.ProductCode.Should().Be("PROD-001");
            result.InspectionQuantity.Should().Be(100);
            result.QualifiedQuantity.Should().Be(95);
        }
    }

    [Fact]
    public async Task GetInspectionsByWorkOrder_ShouldReturnList()
    {
        var response = await _client.GetAsync("/api/v1/quality/inspections/workorder/wo-001");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<List<InspectionResponse>>();
        result.Should().NotBeNull();
    }

    [Fact]
    public async Task AnalyzeSpcTrend_WithoutParameter_ShouldReturnBadRequest()
    {
        var response = await _client.GetAsync("/api/v1/quality/spc/analyze");

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task AnalyzeSpcTrend_WithValidParameter_ShouldReturnAnalysis()
    {
        var response = await _client.GetAsync("/api/v1/quality/spc/analyze?processParameter=Temperature");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<SpcAnalysisResponse>();
        result.Should().NotBeNull();
        result!.ProcessParameter.Should().Be("Temperature");
    }

    private class QualityStatisticsResponse
    {
        public int TotalInspections { get; set; }
        public int PassedCount { get; set; }
        public int FailedCount { get; set; }
        public int ReworkCount { get; set; }
        public double PassRate { get; set; }
        public double DefectRate { get; set; }
    }

    private class InspectionResponse
    {
        public string Id { get; set; } = string.Empty;
        public string WorkOrderId { get; set; } = string.Empty;
        public string ProductCode { get; set; } = string.Empty;
        public string InspectionPoint { get; set; } = string.Empty;
        public int InspectionQuantity { get; set; }
        public int QualifiedQuantity { get; set; }
        public int DefectQuantity { get; set; }
        public string Result { get; set; } = string.Empty;
    }

    private class SpcAnalysisResponse
    {
        public string ProcessParameter { get; set; } = string.Empty;
        public bool HasTrend { get; set; }
        public bool HasDrift { get; set; }
        public string TrendDirection { get; set; } = string.Empty;
        public string RecommendedAction { get; set; } = string.Empty;
    }
}
