using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using MES.Application.DTOs;
using MES.Domain.Entities.Production;
using MES.Domain.Enums;
using MES.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace MES.Tests.Integration.Controllers;

[Collection("IntegrationSerial")]
public class ProductionControllerTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly TestWebApplicationFactory _factory;

    public ProductionControllerTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Scan_WithInvalidCode_ShouldReturnBadRequest()
    {
        var request = new { Code = "", OperatorId = "test" };
        var response = await _client.PostAsJsonAsync("/api/v1/production/scan", request);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task StartOperation_WithInvalidId_ShouldReturnError()
    {
        var request = new { OperatorId = "test-operator", StationId = "ST-001" };
        var response = await _client.PostAsJsonAsync("/api/v1/production/operations/invalid-id/start", request);

        response.StatusCode.Should().BeOneOf(HttpStatusCode.BadRequest, HttpStatusCode.NotFound);
        var problem = await response.Content.ReadFromJsonAsync<ProblemDetailsResponse>();
        if (problem != null)
        {
            problem.Type.Should().NotBeNullOrEmpty();
        }
    }

    [Fact]
    public async Task CompleteOperation_WithInvalidId_ShouldReturnError()
    {
        var request = new { OutputQuantity = 10 };
        var response = await _client.PostAsJsonAsync("/api/v1/production/operations/invalid-id/complete", request);

        response.StatusCode.Should().BeOneOf(HttpStatusCode.BadRequest, HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task ReportException_WithInvalidId_ShouldReturnError()
    {
        var request = new { Reason = "测试异常" };
        var response = await _client.PostAsJsonAsync(
            "/api/v1/production/operations/invalid-id/exception", request);

        response.StatusCode.Should().BeOneOf(HttpStatusCode.BadRequest, HttpStatusCode.NotFound);
        var problem = await response.Content.ReadFromJsonAsync<ProblemDetailsResponse>();
        if (problem != null)
        {
            problem.Type.Should().NotBeNullOrEmpty();
        }
    }

    [Fact]
    public async Task ProductionFlow_ShouldScanStartAndCompleteOperation()
    {
        var orderNumber = $"WO-PROD-{Guid.NewGuid():N}";
        var workOrderId = SeedWorkOrder(orderNumber);

        var scanResponse = await _client.PostAsJsonAsync("/api/v1/production/scan", new
        {
            Code = orderNumber,
            OperatorId = "operator-flow",
            StationId = "ST-FLOW"
        });
        scanResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var scan = await scanResponse.Content.ReadFromJsonAsync<OperationInfoDto>();
        scan.Should().NotBeNull();
        scan!.WorkOrderId.Should().Be(workOrderId);
        scan.WorkOrderNumber.Should().Be(orderNumber);

        var startResponse = await _client.PostAsJsonAsync($"/api/v1/production/operations/{scan.OperationId}/start", new
        {
            OperatorId = "operator-flow",
            StationId = "ST-FLOW",
            EquipmentId = "EQ-FLOW"
        });
        startResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var started = await startResponse.Content.ReadFromJsonAsync<OperationResultDto>();
        started.Should().NotBeNull();
        started!.Status.Should().Be(OperationExecutionStatus.Running.ToString());

        var completeResponse = await _client.PostAsJsonAsync($"/api/v1/production/operations/{scan.OperationId}/complete", new
        {
            Quantity = 4,
            DefectQuantity = 1,
            Parameters = new Dictionary<string, string> { ["temperature"] = "180" },
            Materials = new[]
            {
                new { MaterialCode = "MAT-FLOW", Quantity = 2.5m, Unit = "kg", BatchNumber = "B-FLOW" }
            },
            InspectionResult = InspectionResult.Fail,
            ReportedBy = "operator-flow"
        });
        completeResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var completed = await completeResponse.Content.ReadFromJsonAsync<OperationResultDto>();
        completed.Should().NotBeNull();
        completed!.Status.Should().Be(OperationExecutionStatus.Completed.ToString());

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        var workOrder = await db.WorkOrders.AsNoTracking().SingleAsync(w => w.Id == workOrderId);
        var execution = await db.OperationExecutions.AsNoTracking().SingleAsync(e => e.Id == scan.OperationId);
        var report = await db.OperationReports
            .AsNoTracking()
            .Include(r => r.MaterialConsumed)
            .SingleAsync(r => r.OperationId == scan.OperationId);

        workOrder.Status.Should().Be(WorkOrderStatus.InProgress);
        workOrder.CompletedQuantity.Should().Be(4);
        execution.Status.Should().Be(OperationExecutionStatus.Completed);
        execution.CompletedQuantity.Should().Be(4);
        report.ReportedQuantity.Should().Be(4);
        report.DefectQuantity.Should().Be(1);
        report.MaterialConsumed.Should().ContainSingle().Which.MaterialCode.Should().Be("MAT-FLOW");
    }

    [Fact]
    public async Task DemoSeed_ShouldKeepWo013HeatTreatmentScannableWhenOtherWorkOrdersAlreadyExist()
    {
        await using (var scope = _factory.Services.CreateAsyncScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
            var staleWorkOrderIds = await db.WorkOrders
                .Where(w => w.OrderNumber == "WO-013")
                .Select(w => w.Id)
                .ToListAsync();
            db.OperationExecutions.RemoveRange(db.OperationExecutions
                .Where(e => e.OperationCode == "OP-10" || staleWorkOrderIds.Contains(e.WorkOrderId)));
            db.WorkOrders.RemoveRange(db.WorkOrders.Where(w => w.OrderNumber == "WO-013"));
            await db.SaveChangesAsync();

            await DemoDataSeeder.SeedAsync(db);
        }

        var scanResponse = await _client.PostAsJsonAsync("/api/v1/production/scan", new
        {
            Code = "WO-013",
            OperatorId = "admin",
            StationId = "ST-HT-01"
        });

        scanResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var scan = await scanResponse.Content.ReadFromJsonAsync<OperationInfoDto>();
        scan.Should().NotBeNull();
        scan!.WorkOrderNumber.Should().Be("WO-013");
        scan.OperationCode.Should().Be("OP-10");
        scan.OperationName.Should().Be("淬火");
        scan.NextOperation.Should().NotBeNull("WO-013 barcode completion must know the downstream heat-treatment operation");
        scan.NextOperation?.OperationCode.Should().Be("OP-20");
        scan.NextOperation?.OperationName.Should().Be("回火");
    }

    private string SeedWorkOrder(string orderNumber)
    {
        string workOrderId = string.Empty;
        _factory.SeedData(db =>
        {
            var existing = db.WorkOrders.Where(w => w.OrderNumber.StartsWith("WO-PROD-"));
            db.WorkOrders.RemoveRange(existing);
            var workOrder = WorkOrder.Create(
                orderNumber,
                "PROD-FLOW",
                "Flow Test Product",
                10,
                DateTime.UtcNow.AddHours(-1),
                DateTime.UtcNow.AddDays(1),
                "ws-001",
                routeCode: "OP-FLOW");
            workOrderId = workOrder.Id;
            db.WorkOrders.Add(workOrder);
        });

        return workOrderId;
    }

    private class ProblemDetailsResponse
    {
        public string Type { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public int Status { get; set; }
        public string Detail { get; set; } = string.Empty;
        public string? Instance { get; set; }
    }
}
