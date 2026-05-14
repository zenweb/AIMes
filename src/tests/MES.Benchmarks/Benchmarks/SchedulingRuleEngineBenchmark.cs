using BenchmarkDotNet.Attributes;
using MES.AI.Core.Models;
using MES.AI.Core.Scheduling;
using MES.Domain.Entities.Scheduling;
using Microsoft.Extensions.Logging;
using Moq;

namespace MES.Benchmarks.Benchmarks;

[MemoryDiagnoser]
[MinColumn, MaxColumn, MeanColumn, MedianColumn]
public class SchedulingRuleEngineBenchmark
{
    private SchedulingRuleEngine _engine = null!;
    private ScheduleRequest _request10 = null!;
    private ScheduleRequest _request50 = null!;
    private ScheduleRequest _request100 = null!;
    private ScheduleRequest _request500 = null!;
    private SchedulingContextSnapshot _context = null!;

    [GlobalSetup]
    public void Setup()
    {
        var logger = new Mock<ILogger<SchedulingRuleEngine>>();
        var validator = new ConstraintValidator();
        _engine = new SchedulingRuleEngine(validator, logger.Object);

        _context = CreateContext(20);

        _request10 = CreateRequest(10);
        _request50 = CreateRequest(50);
        _request100 = CreateRequest(100);
        _request500 = CreateRequest(500);
    }

    [Benchmark(Baseline = true)]
    public Task Schedule_10_Orders() => RunEngine(_request10);

    [Benchmark]
    public Task Schedule_50_Orders() => RunEngine(_request50);

    [Benchmark]
    public Task Schedule_100_Orders() => RunEngine(_request100);

    [Benchmark]
    public Task Schedule_500_Orders() => RunEngine(_request500);

    private Task RunEngine(ScheduleRequest request) =>
        _engine.GenerateInitialScheduleAsync(request, _context,
            PriorityRule.EDD, CapacitySelectionStrategy.LeastLoaded);

    private static SchedulingContextSnapshot CreateContext(int equipmentCount)
    {
        var equipment = new List<EquipmentCapacitySummary>();
        for (var i = 0; i < equipmentCount; i++)
        {
            equipment.Add(new EquipmentCapacitySummary(
                EquipmentId: $"EQ-{i:D3}",
                EquipmentCode: $"MC-{i:D3}",
                EquipmentName: $"设备 {i + 1:D2}",
                EquipmentType: i switch
                {
                    < 3 => "注塑机",
                    < 8 => "冲压机",
                    _ => "组装线"
                },
                Status: "运行",
                Capacity: 1000 + i * 100,
                UtilizationRate: 0.5 + i * 0.02)
            {
                TheoreticalCapacity = 1200 + i * 100,
                ActualCapacity = 1000 + i * 100,
                ReservedCapacity = 50,
                IsBottleneck = i < 2,
                ConstraintType = i < 2 ? "设备" : null
            });
        }

        var now = DateTime.UtcNow;
        var changeoverMatrix = new List<ChangeoverEntry>
        {
            new("MAT-001", "MAT-002", 30, ChangeoverType.SimilarMaterial) { FromProductCode = "PROD-A001", ToProductCode = "PROD-A002" },
            new("MAT-002", "MAT-003", 45, ChangeoverType.SimilarMaterial) { FromProductCode = "PROD-A002", ToProductCode = "PROD-A003" },
            new("MAT-001", "MAT-003", 90, ChangeoverType.DifferentMaterial) { FromProductCode = "PROD-A001", ToProductCode = "PROD-A003" },
        };

        return new SchedulingContextSnapshot
        {
            WorkshopId = "WS-001",
            SnapshotTime = now,
            EquipmentCapacities = equipment,
            ChangeoverMatrix = changeoverMatrix,
        };
    }

    private static ScheduleRequest CreateRequest(int orderCount)
    {
        var now = DateTime.UtcNow;
        var productCodes = new[] { "PROD-A001", "PROD-A002", "PROD-A003", "PROD-B001", "PROD-B002", "PROD-C001" };
        var orders = new List<WorkOrderInfo>();
        var rng = new Random(42);

        for (var i = 0; i < orderCount; i++)
        {
            var productCode = productCodes[rng.Next(productCodes.Length)];
            var quantity = 100 + rng.Next(1, 40) * 50;
            var dueDays = rng.Next(3, 30);

            orders.Add(new WorkOrderInfo
            {
                Id = $"WO-{i:D4}",
                OrderNumber = $"ORD-{i:D6}",
                ProductCode = productCode,
                Quantity = quantity,
                DueDate = now.AddDays(dueDays),
                Priority = rng.Next(1, 6),
                RouteCode = productCode.StartsWith("PROD-A") ? "ROUTE-A" : productCode.StartsWith("PROD-B") ? "ROUTE-B" : "ROUTE-C",
            });
        }

        return new ScheduleRequest
        {
            WorkshopId = "WS-001",
            Orders = orders,
            LockedOrderIds = orderCount > 10 ? orders.Take(2).Select(o => o.Id).ToList() : [],
        };
    }
}
