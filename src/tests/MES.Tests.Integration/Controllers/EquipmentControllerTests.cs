using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using MES.Infrastructure.Data;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace MES.Tests.Integration.Controllers;

[Collection("IntegrationSerial")]
public class EquipmentControllerTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly TestWebApplicationFactory _factory;

    public EquipmentControllerTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetEquipments_ShouldReturnOkWithList()
    {
        var response = await _client.GetAsync("/api/v1/equipment");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<PagedResultResponse<EquipmentResponse>>();
        result.Should().NotBeNull();
        result!.Items.Should().HaveCountGreaterThanOrEqualTo(2);
        result.Items.Should().Contain(e => e.EquipmentCode == "CNC-001");
        result.Items.Should().Contain(e => e.EquipmentCode == "CNC-002");
    }

    [Fact]
    public async Task GetEquipments_WithWorkshopFilter_ShouldReturnFiltered()
    {
        var response = await _client.GetAsync("/api/v1/equipment?workshopId=ws-001");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<PagedResultResponse<EquipmentResponse>>();
        result.Should().NotBeNull();
        result!.Items.Should().AllSatisfy(e => e.WorkshopId.Should().Be("ws-001"));
    }

    [Fact]
    public async Task GetStatistics_ShouldReturnValidStats()
    {
        var response = await _client.GetAsync("/api/v1/equipment/statistics");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<EquipmentStatisticsResponse>();
        result.Should().NotBeNull();
        result!.TotalCount.Should().BeGreaterThanOrEqualTo(2);
    }

    [Fact]
    public async Task GetEquipmentById_WhenExists_ShouldReturnEquipment()
    {
        string equipId;
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
            equipId = db.Equipment.First().Id;
        }

        var response = await _client.GetAsync($"/api/v1/equipment/{equipId}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<EquipmentResponse>();
        result!.Id.Should().Be(equipId);
    }

    [Fact]
    public async Task GetEquipmentById_WhenNotExists_ShouldReturnNotFound()
    {
        var response = await _client.GetAsync("/api/v1/equipment/non-existent-id");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task CreateEquipment_ShouldReturnCreatedWithDto()
    {
        var request = new
        {
            EquipmentCode = "CNC-TEST-001",
            EquipmentName = "Test CNC Machine",
            EquipmentType = "CNC",
            WorkshopId = "ws-001",
            WorkshopName = "Test Workshop",
            Capacity = 100.0
        };

        var response = await _client.PostAsJsonAsync("/api/v1/equipment", request);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var result = await response.Content.ReadFromJsonAsync<EquipmentResponse>();
        result!.EquipmentCode.Should().Be("CNC-TEST-001");
        result.EquipmentName.Should().Be("Test CNC Machine");
        result.EquipmentType.Should().Be("CNC");
        result.WorkshopId.Should().Be("ws-001");
        result.Capacity.Should().Be(100.0);
    }

    [Fact]
    public async Task CreateEquipment_WithMissingRequiredFields_ShouldReturnBadRequest()
    {
        var request = new { EquipmentName = "Missing Code" };

        var response = await _client.PostAsJsonAsync("/api/v1/equipment", request);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateStatus_WhenNotExists_ShouldReturnError()
    {
        var response = await _client.PatchAsJsonAsync("/api/v1/equipment/non-existent-id/status",
            new { Status = "Running" });

        // UpdateStatusAsync 对不存在的设备抛出 InvalidOperationException → ExceptionMiddleware 映射为 400
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetBottlenecks_ShouldReturnOk()
    {
        var response = await _client.GetAsync("/api/v1/equipment/bottlenecks");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<List<string>>();
        result.Should().NotBeNull();
    }

    private class EquipmentResponse
    {
        public string Id { get; set; } = string.Empty;
        public string EquipmentCode { get; set; } = string.Empty;
        public string EquipmentName { get; set; } = string.Empty;
        public string? EquipmentType { get; set; }
        public string WorkshopId { get; set; } = string.Empty;
        public string? WorkshopName { get; set; }
        public string Status { get; set; } = string.Empty;
        public double Capacity { get; set; }
    }

    private class PagedResultResponse<T>
    {
        public List<T> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
    }

    private class EquipmentStatisticsResponse
    {
        public int TotalCount { get; set; }
        public int RunningCount { get; set; }
        public int IdleCount { get; set; }
        public int MaintenanceCount { get; set; }
        public int FaultCount { get; set; }
        public int OfflineCount { get; set; }
        public double UtilizationRate { get; set; }
        public double AvailabilityRate { get; set; }
    }
}
