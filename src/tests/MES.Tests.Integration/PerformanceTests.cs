using System.Diagnostics;
using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using MES.Domain.Entities.Scheduling;
using Xunit;
using Xunit.Abstractions;

namespace MES.Tests.Integration;

[Collection("IntegrationSerial")]
public class PerformanceTests : IClassFixture<PerformanceTestWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly PerformanceTestWebApplicationFactory _factory;
    private readonly ITestOutputHelper _output;

    public PerformanceTests(PerformanceTestWebApplicationFactory factory, ITestOutputHelper output)
    {
        _client = factory.CreateClient();
        _factory = factory;
        _output = output;
    }

    public static TheoryData<int> WorkOrderCounts => [50, 100, 200];

    [Theory]
    [MemberData(nameof(WorkOrderCounts))]
    public async Task GetWorkOrders_Performance(int count)
    {
        var workOrders = SeedWorkOrders(count);
        var sw = Stopwatch.StartNew();

        var response = await _client.GetAsync($"/api/v1/scheduling/workorders?pageSize={count}");

        sw.Stop();
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        _output.WriteLine($"GET /api/v1/scheduling/workorders with {count} work orders: {sw.ElapsedMilliseconds}ms");

        if (count <= 100)
            sw.ElapsedMilliseconds.Should().BeLessThan(3000, $"GET workorders with {count} items should complete under 3s");
    }

    [Theory]
    [MemberData(nameof(WorkOrderCounts))]
    public async Task CreateWorkOrders_Bulk_Performance(int count)
    {
        var sw = Stopwatch.StartNew();

        for (var i = 0; i < count; i++)
        {
            var request = new
            {
                OrderNumber = $"WO-PERF-{i:D4}",
                ProductCode = $"PROD-{i % 10:D3}",
                ProductName = $"Performance Test Product {i}",
                PlannedQuantity = 10 + (i % 100),
                PlannedStartDate = DateTime.UtcNow.AddDays(1),
                PlannedEndDate = DateTime.UtcNow.AddDays(2 + (i % 30)),
                WorkshopId = "ws-001",
                Priority = 50
            };

            var response = await _client.PostAsJsonAsync("/api/v1/scheduling/workorders", request);
            response.StatusCode.Should().Be(HttpStatusCode.Created);
        }

        sw.Stop();
        _output.WriteLine($"POST {count} work orders: {sw.ElapsedMilliseconds}ms (avg {sw.ElapsedMilliseconds / (double)count:F1}ms/order)");
    }

    [Fact]
    public async Task GetAllPlans_Performance()
    {
        var warmupResponse = await _client.GetAsync("/api/v1/scheduling/plans");
        warmupResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var elapsedSamples = new List<long>(3);
        for (var i = 0; i < 3; i++)
        {
            var sw = Stopwatch.StartNew();

            var response = await _client.GetAsync("/api/v1/scheduling/plans");

            sw.Stop();
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            elapsedSamples.Add(sw.ElapsedMilliseconds);
        }

        var bestElapsed = elapsedSamples.Min();
        _output.WriteLine($"GET /api/v1/scheduling/plans steady-state samples: {string.Join(", ", elapsedSamples)}ms; best={bestElapsed}ms");
        bestElapsed.Should().BeLessThan(1000, "steady-state request latency should exclude ASP.NET/EF cold-start cost");
    }

    [Fact]
    public async Task GetCurrentPlan_Performance()
    {
        var sw = Stopwatch.StartNew();

        var response = await _client.GetAsync("/api/v1/scheduling/current");

        sw.Stop();
        _output.WriteLine($"GET /api/v1/scheduling/current: {sw.ElapsedMilliseconds}ms");
        sw.ElapsedMilliseconds.Should().BeLessThan(1000);
    }

    private List<string> SeedWorkOrders(int count)
    {
        var ids = new List<string>(count);
        _factory.SeedData(db =>
        {
            for (var i = 0; i < count; i++)
            {
                var wo = Domain.Entities.Production.WorkOrder.Create(
                    $"WO-SEED-{i:D4}",
                    $"PROD-{i % 10:D3}",
                    $"Seed Product {i}",
                    10 + (i % 100),
                    DateTime.UtcNow.AddDays(1),
                    DateTime.UtcNow.AddDays(1 + (i % 30) + 1), // +1 确保 > plannedStartDate
                    "ws-001",
                    50);
                db.Set<Domain.Entities.Production.WorkOrder>().Add(wo);
                ids.Add(wo.Id);
            }
        });
        return ids;
    }
}
