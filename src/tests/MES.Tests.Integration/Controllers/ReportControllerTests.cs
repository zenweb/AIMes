using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Xunit;

namespace MES.Tests.Integration.Controllers;

public class ReportControllerTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public ReportControllerTests(TestWebApplicationFactory factory)
    {
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
    public async Task ExportExcel_ShouldReturnFile()
    {
        var response = await _client.GetAsync("/api/v1/report/export/excel");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        response.Content.Headers.ContentType?.MediaType.Should().Be("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        var bytes = await response.Content.ReadAsByteArrayAsync();
        bytes.Length.Should().BeGreaterThan(100);
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
    }
}
