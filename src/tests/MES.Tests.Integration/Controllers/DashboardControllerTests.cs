using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using MES.Application.DTOs;
using Xunit;

namespace MES.Tests.Integration.Controllers;

public class DashboardControllerTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public DashboardControllerTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetDashboard_ShouldReturnOk()
    {
        var response = await _client.GetAsync("/api/v1/dashboard");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetDashboard_ShouldHaveValidStructure()
    {
        var response = await _client.GetFromJsonAsync<DashboardResponse>("/api/v1/dashboard");
        response.Should().NotBeNull();

        response!.Kpi.Should().NotBeNull();
        response.Kpi.ScheduleAdherence.Should().BeInRange(0, 100);
        response.Kpi.QualityPassRate.Should().BeInRange(0, 100);
        response.Kpi.EquipmentUtilization.Should().BeInRange(0, 100);
        response.Kpi.ActiveOrders.Should().BeGreaterThanOrEqualTo(0);

        response.Equipment.Should().NotBeNull();
        response.TodaySchedule.Should().NotBeNull();
        response.MaterialAlerts.Should().NotBeNull();
        response.QualityStats.Should().NotBeNull();
        response.QualityStats.TotalInspections.Should().BeGreaterThanOrEqualTo(0);
    }

    private class DashboardResponse
    {
        public KpiResponse Kpi { get; set; } = new();
        public List<EquipmentItemResponse> Equipment { get; set; } = new();
        public List<object> TodaySchedule { get; set; } = new();
        public List<object> MaterialAlerts { get; set; } = new();
        public QualityStatsResponse QualityStats { get; set; } = new();
    }

    private class KpiResponse
    {
        public double ScheduleAdherence { get; set; }
        public double QualityPassRate { get; set; }
        public double EquipmentUtilization { get; set; }
        public int ActiveOrders { get; set; }
    }

    private class EquipmentItemResponse
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }

    private class QualityStatsResponse
    {
        public int TotalInspections { get; set; }
        public int Passed { get; set; }
        public int Defects { get; set; }
        public int PendingAnomalies { get; set; }
        public double PassRate { get; set; }
    }
}
