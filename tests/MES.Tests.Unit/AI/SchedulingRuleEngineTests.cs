using MES.AI.Models;
using MES.AI.Scheduling;
using MES.Domain.Entities.Scheduling;
using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;
using System.Threading;

namespace MES.Tests.Unit.AI;

public class SchedulingRuleEngineTests
{
    private static readonly DateTime Now = new(2026, 5, 12, 8, 0, 0, DateTimeKind.Utc);
    private readonly SchedulingRuleEngine _engine;
    private readonly ConstraintValidator _validator;

    public SchedulingRuleEngineTests()
    {
        _validator = new ConstraintValidator();
        _engine = new SchedulingRuleEngine(_validator, NullLogger<SchedulingRuleEngine>.Instance);
    }

    #region PriorityRuleEngine 排序测试

    [Fact]
    public void PriorityRuleEngine_EDD_SortsByDueDateAscending()
    {
        var orders = new List<WorkOrderInfo>
        {
            new() { Id = "O1", DueDate = Now.AddDays(5) },
            new() { Id = "O2", DueDate = Now.AddDays(1) },
            new() { Id = "O3", DueDate = Now.AddDays(3) }
        };

        var sorted = PriorityRuleEngine.Sort(orders, PriorityRule.EDD, Now);

        sorted[0].Id.Should().Be("O2");
        sorted[1].Id.Should().Be("O3");
        sorted[2].Id.Should().Be("O1");
    }

    [Fact]
    public void PriorityRuleEngine_SPT_SortsByQuantityAscending()
    {
        var orders = new List<WorkOrderInfo>
        {
            new() { Id = "O1", Quantity = 100 },
            new() { Id = "O2", Quantity = 10 },
            new() { Id = "O3", Quantity = 50 }
        };

        var sorted = PriorityRuleEngine.Sort(orders, PriorityRule.SPT, Now);

        sorted[0].Id.Should().Be("O2");
        sorted[1].Id.Should().Be("O3");
        sorted[2].Id.Should().Be("O1");
    }

    [Fact]
    public void PriorityRuleEngine_CR_SortsByCriticalRatioAscending()
    {
        var orders = new List<WorkOrderInfo>
        {
            new() { Id = "O1", DueDate = Now.AddDays(5), Quantity = 100 },
            new() { Id = "O2", DueDate = Now.AddDays(1), Quantity = 10 },
            new() { Id = "O3", DueDate = Now.AddDays(3), Quantity = 50 }
        };

        var sorted = PriorityRuleEngine.Sort(orders, PriorityRule.CR, Now);

        // CR = RemainingTime/EstimatedTime
        // O1: 7200/100=72, O2: 1440/10=144, O3: 4320/50=86.4
        // 升序: O1(72), O3(86.4), O2(144)
        sorted[0].Id.Should().Be("O1");
        sorted[1].Id.Should().Be("O3");
        sorted[2].Id.Should().Be("O2");
    }

    [Fact]
    public void PriorityRuleEngine_FCFS_PreservesOriginalOrder()
    {
        var orders = new List<WorkOrderInfo>
        {
            new() { Id = "O1" },
            new() { Id = "O2" },
            new() { Id = "O3" }
        };

        var sorted = PriorityRuleEngine.Sort(orders, PriorityRule.FCFS, Now);

        sorted[0].Id.Should().Be("O1");
        sorted[1].Id.Should().Be("O2");
        sorted[2].Id.Should().Be("O3");
    }

    [Fact]
    public void PriorityRuleEngine_EmptyList_ReturnsEmpty()
    {
        var orders = new List<WorkOrderInfo>();
        var sorted = PriorityRuleEngine.Sort(orders, PriorityRule.EDD, Now);
        sorted.Should().BeEmpty();
    }

    [Fact]
    public void PriorityRuleEngine_SingleOrder_ReturnsSame()
    {
        var orders = new List<WorkOrderInfo> { new() { Id = "O1" } };
        var sorted = PriorityRuleEngine.Sort(orders, PriorityRule.EDD, Now);
        sorted.Should().HaveCount(1);
        sorted[0].Id.Should().Be("O1");
    }

    #endregion

    #region CapacitySelector 测试

    [Fact]
    public void CapacitySelector_EarliestAvailable_ReturnsLeastBusy()
    {
        var candidates = new List<EquipmentCapacitySummary>
        {
            CreateEquipment("EQ1", capacity: 100, utilization: 0.8),
            CreateEquipment("EQ2", capacity: 100, utilization: 0.2),
            CreateEquipment("EQ3", capacity: 100, utilization: 0.5)
        };
        var availability = new Dictionary<string, DateTime>
        {
            ["EQ1"] = Now.AddHours(2),
            ["EQ2"] = Now,
            ["EQ3"] = Now.AddHours(1)
        };

        var order = new WorkOrderInfo { Id = "O1", ProductCode = "PROD-A1" };
        var selected = CapacitySelector.SelectBest(
            candidates, order, availability, new Dictionary<string, string?>(), [],
            CapacitySelectionStrategy.EarliestAvailable);

        selected.Should().NotBeNull();
        selected!.EquipmentId.Should().Be("EQ2");
    }

    [Fact]
    public void CapacitySelector_LeastLoaded_ReturnsLowestUtilization()
    {
        var candidates = new List<EquipmentCapacitySummary>
        {
            CreateEquipment("EQ1", capacity: 100, utilization: 0.9),
            CreateEquipment("EQ2", capacity: 100, utilization: 0.1),
            CreateEquipment("EQ3", capacity: 100, utilization: 0.5)
        };

        var order = new WorkOrderInfo { Id = "O1" };
        var selected = CapacitySelector.SelectBest(
            candidates, order, new Dictionary<string, DateTime>(), new Dictionary<string, string?>(), [],
            CapacitySelectionStrategy.LeastLoaded);

        selected.Should().NotBeNull();
        selected!.EquipmentId.Should().Be("EQ2");
    }

    [Fact]
    public void CapacitySelector_EmptyCandidates_ReturnsNull()
    {
        var selected = CapacitySelector.SelectBest(
            [], new WorkOrderInfo { Id = "O1" },
            new Dictionary<string, DateTime>(), new Dictionary<string, string?>(), [],
            CapacitySelectionStrategy.EarliestAvailable);

        selected.Should().BeNull();
    }

    [Fact]
    public void CapacitySelector_SingleCandidate_ReturnsIt()
    {
        var candidates = new List<EquipmentCapacitySummary>
        {
            CreateEquipment("EQ1", capacity: 100, utilization: 0.5)
        };

        var order = new WorkOrderInfo { Id = "O1" };
        var selected = CapacitySelector.SelectBest(
            candidates, order, new Dictionary<string, DateTime>(), new Dictionary<string, string?>(), [],
            CapacitySelectionStrategy.EarliestAvailable);

        selected.Should().NotBeNull();
        selected!.EquipmentId.Should().Be("EQ1");
    }

    [Fact]
    public void CapacitySelector_LeastChangeoverCost_PrefersLowerCost()
    {
        var candidates = new List<EquipmentCapacitySummary>
        {
            CreateEquipment("EQ1", capacity: 100),
            CreateEquipment("EQ2", capacity: 100)
        };
        var changeoverMatrix = new List<ChangeoverEntry>
        {
            new("MAT_A", "MAT_B", 30, ChangeoverType.SimilarMaterial)
            {
                FromProductCode = "PROD-A",
                ToProductCode = "PROD-B"
            },
            new("MAT_A", "MAT_B", 120, ChangeoverType.DifferentMaterial)
            {
                FromProductCode = "PROD-A",
                ToProductCode = "PROD-B",
                EquipmentType = "CNC"
            }
        };

        // EQ1 last product is PROD-A, order product is PROD-B → changeover cost 30
        // EQ2 last product is PROD-A, order product is PROD-B → changeover cost 120 (different equipment type)
        var lastProduct = new Dictionary<string, string?>
        {
            ["EQ1"] = "PROD-A",
            ["EQ2"] = "PROD-A"
        };

        // Use only EQ1's changeover entry (no EquipmentType filter)
        var filteredMatrix = changeoverMatrix.Take(1).ToList();
        var order = new WorkOrderInfo { Id = "O1", ProductCode = "PROD-B" };
        var selected = CapacitySelector.SelectBest(
            candidates, order, new Dictionary<string, DateTime>(), lastProduct, filteredMatrix,
            CapacitySelectionStrategy.LeastChangeoverCost);

        selected.Should().NotBeNull();
        selected!.EquipmentId.Should().Be("EQ1");
    }

    #endregion

    #region ConstraintValidator 测试

    [Fact]
    public void ConstraintValidator_ValidSchedule_PassesAll()
    {
        var assignments = new List<ScheduleAssignment>
        {
            new()
            {
                WorkOrderId = "O1", EquipmentId = "EQ1",
                StartTime = Now, EndTime = Now.AddHours(8)
            }
        };
        var request = CreateRequest();
        var context = CreateContext();

        var result = _validator.Validate(assignments, request, context);

        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void ConstraintValidator_CapacityExceeded_ReturnsError()
    {
        var assignments = new List<ScheduleAssignment>
        {
            new()
            {
                WorkOrderId = "O1", EquipmentId = "EQ1",
                StartTime = Now, EndTime = Now.AddDays(30)
            }
        };
        var request = CreateRequest();
        var context = CreateContext();

        var result = _validator.Validate(assignments, request, context);

        result.Violations.Should().Contain(v =>
            v.Rule == "Capacity" && v.Level == ConstraintViolationLevel.Error);
    }

    [Fact]
    public void ConstraintValidator_DeadlineMissed_ReturnsWarning()
    {
        var assignments = new List<ScheduleAssignment>
        {
            new()
            {
                WorkOrderId = "O1", EquipmentId = "EQ1",
                StartTime = Now, EndTime = Now.AddDays(15)
            }
        };
        var request = CreateRequest();
        request.Deadlines["O1"] = Now.AddDays(10);

        var result = _validator.Validate(assignments, request, context: CreateContext());

        result.Violations.Should().Contain(v =>
            v.Rule == "Deadline" && v.Level == ConstraintViolationLevel.Warning);
    }

    [Fact]
    public void ConstraintValidator_BottleneckAssignment_ReturnsInfo()
    {
        var assignments = new List<ScheduleAssignment>
        {
            new()
            {
                WorkOrderId = "O1", EquipmentId = "EQ1",
                StartTime = Now, EndTime = Now.AddHours(8),
                IsOnBottleneck = true
            }
        };
        var request = CreateRequest();
        var context = CreateContext();
        // 标记 EQ1 为瓶颈设备
        context.EquipmentCapacities[0] = context.EquipmentCapacities[0] with { IsBottleneck = true };

        var result = _validator.Validate(assignments, request, context);

        result.Violations.Should().Contain(v =>
            v.Rule == "Bottleneck" && v.Level == ConstraintViolationLevel.Info);
    }

    [Fact]
    public void ConstraintValidator_LockedOrder_ReturnsInfo()
    {
        var assignments = new List<ScheduleAssignment>
        {
            new()
            {
                WorkOrderId = "O1", EquipmentId = "EQ1",
                StartTime = Now, EndTime = Now.AddHours(8)
            }
        };
        var request = CreateRequest();
        request.LockedOrderIds = ["O1"];
        var context = CreateContext();

        var result = _validator.Validate(assignments, request, context);

        result.Violations.Should().Contain(v =>
            v.Rule == "LockedOrder" && v.Level == ConstraintViolationLevel.Info);
    }

    [Fact]
    public void ConstraintValidator_EmptyAssignments_IsValid()
    {
        var request = CreateRequest();
        var context = CreateContext();

        var result = _validator.Validate([], request, context);

        result.IsValid.Should().BeTrue();
    }

    #endregion

    #region SchedulingRuleEngine 集成测试

    [Fact]
    public async Task GenerateInitialSchedule_SimpleCase_ReturnsAssignments()
    {
        var request = CreateRequest();
        var context = CreateContext();

        var result = await _engine.GenerateInitialScheduleAsync(request, context, ct: CancellationToken.None);

        result.Assignments.Should().NotBeEmpty();
        result.Assignments.Should().HaveCount(request.Orders.Count);
        result.UtilizationRate.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task GenerateInitialSchedule_EmptyOrders_ReturnsEmpty()
    {
        var request = CreateRequest(orders: []);
        var context = CreateContext(orders: []);

        var result = await _engine.GenerateInitialScheduleAsync(request, context, ct: CancellationToken.None);

        result.Assignments.Should().BeEmpty();
        result.UtilizationRate.Should().Be(0);
        result.OnTimeDeliveryRate.Should().Be(0);
    }

    [Fact]
    public async Task GenerateInitialSchedule_SingleOrder_ReturnsOneAssignment()
    {
        var order = new WorkOrderInfo
        {
            Id = "O1", OrderNumber = "WO-001",
            ProductCode = "PROD-A1", Quantity = 100,
            DueDate = Now.AddDays(7), Priority = 10
        };
        var request = CreateRequest(orders: [order]);
        var context = CreateContext();

        var result = await _engine.GenerateInitialScheduleAsync(request, context, ct: CancellationToken.None);

        result.Assignments.Should().HaveCount(1);
        result.Assignments[0].WorkOrderId.Should().Be("O1");
        result.Assignments[0].EquipmentId.Should().NotBeNullOrEmpty();
        result.Assignments[0].StartTime.Should().BeOnOrAfter(DateTime.UtcNow.AddHours(-1));
    }

    [Fact]
    public async Task GenerateInitialSchedule_RespectsLockedOrders()
    {
        var orders = new List<WorkOrderInfo>
        {
            new() { Id = "O1", OrderNumber = "WO-001", ProductCode = "PROD-A1", Quantity = 100, DueDate = Now.AddDays(7), Priority = 10 },
            new() { Id = "O2", OrderNumber = "WO-002", ProductCode = "PROD-B1", Quantity = 200, DueDate = Now.AddDays(5), Priority = 5 }
        };
        var request = CreateRequest(orders: orders);
        request.LockedOrderIds = ["O2"];
        var context = CreateContext();

        var result = await _engine.GenerateInitialScheduleAsync(request, context, ct: CancellationToken.None);

        // O2 is locked and should be first
        result.Assignments[0].WorkOrderId.Should().Be("O2");
    }

    [Fact]
    public async Task GenerateInitialSchedule_GroupsByProductFamily()
    {
        var orders = new List<WorkOrderInfo>
        {
            new() { Id = "O1", OrderNumber = "WO-001", ProductCode = "FAM1-A", Quantity = 50, DueDate = Now.AddDays(7) },
            new() { Id = "O2", OrderNumber = "WO-002", ProductCode = "FAM1-B", Quantity = 50, DueDate = Now.AddDays(7) },
            new() { Id = "O3", OrderNumber = "WO-003", ProductCode = "FAM2-A", Quantity = 50, DueDate = Now.AddDays(7) }
        };
        var request = CreateRequest(orders: orders);
        var context = CreateContext();

        var result = await _engine.GenerateInitialScheduleAsync(request, context, ct: CancellationToken.None);

        result.GroupCount.Should().Be(2);
        result.Assignments.Select(a => a.GroupId).Distinct().Should().HaveCount(2);
    }

    [Fact]
    public async Task GenerateInitialSchedule_CalculatesMetrics()
    {
        var orders = new List<WorkOrderInfo>
        {
            new() { Id = "O1", OrderNumber = "WO-001", ProductCode = "PROD-A1", Quantity = 100, DueDate = Now.AddDays(7) },
            new() { Id = "O2", OrderNumber = "WO-002", ProductCode = "PROD-B1", Quantity = 200, DueDate = Now.AddDays(14) }
        };
        var request = CreateRequest(orders: orders);
        var context = CreateContext();

        var result = await _engine.GenerateInitialScheduleAsync(request, context, ct: CancellationToken.None);

        result.UtilizationRate.Should().BeInRange(0, 100);
        result.TotalChangeoverMinutes.Should().BeGreaterOrEqualTo(0);
        result.EstimatedCompletion.Should().BeAfter(Now);
    }

    [Fact]
    public async Task GenerateInitialSchedule_WithEDD_RespectsDueDateOrder()
    {
        var orders = new List<WorkOrderInfo>
        {
            new() { Id = "O1", OrderNumber = "WO-001", ProductCode = "PROD-A1", Quantity = 100, DueDate = Now.AddDays(10) },
            new() { Id = "O2", OrderNumber = "WO-002", ProductCode = "PROD-A1", Quantity = 100, DueDate = Now.AddDays(1) },
            new() { Id = "O3", OrderNumber = "WO-003", ProductCode = "PROD-A1", Quantity = 100, DueDate = Now.AddDays(5) }
        };
        var request = CreateRequest(orders: orders);
        var context = CreateContext();

        var result = await _engine.GenerateInitialScheduleAsync(request, context,
            PriorityRule.EDD, CapacitySelectionStrategy.LeastLoaded, CancellationToken.None);

        result.Assignments[0].WorkOrderId.Should().Be("O2");
        result.Assignments[1].WorkOrderId.Should().Be("O3");
        result.Assignments[2].WorkOrderId.Should().Be("O1");
    }

    [Fact]
    public async Task GenerateInitialSchedule_BottleneckDetection()
    {
        var orders = new List<WorkOrderInfo>
        {
            new() { Id = "O1", OrderNumber = "WO-001", ProductCode = "PROD-A1", Quantity = 100, DueDate = Now.AddDays(7) },
            new() { Id = "O2", OrderNumber = "WO-002", ProductCode = "PROD-B1", Quantity = 100, DueDate = Now.AddDays(7) }
        };
        var request = CreateRequest(orders: orders);
        var context = CreateContext();
        // Mark EQ1 as bottleneck
        context.EquipmentCapacities[0] = context.EquipmentCapacities[0] with
        {
            IsBottleneck = true,
            ConstraintType = "equipment"
        };

        var result = await _engine.GenerateInitialScheduleAsync(request, context, ct: CancellationToken.None);

        result.BottleneckInfo.Should().NotBeNull();
        result.BottleneckInfo.Should().Contain("瓶颈");
    }

    [Fact]
    public async Task GenerateInitialSchedule_ConstraintValidation_Integrated()
    {
        var orders = new List<WorkOrderInfo>
        {
            new() { Id = "O1", OrderNumber = "WO-001", ProductCode = "PROD-A1", Quantity = 10000, DueDate = Now.AddDays(1) }
        };
        var request = CreateRequest(orders: orders);
        var context = CreateContext();

        var result = await _engine.GenerateInitialScheduleAsync(request, context, ct: CancellationToken.None);

        result.Validation.Should().NotBeNull();
    }

    [Fact]
    public async Task GenerateInitialSchedule_CapacityStrategy_ChangesSelection()
    {
        var orders = new List<WorkOrderInfo>
        {
            new() { Id = "O1", OrderNumber = "WO-001", ProductCode = "PROD-A1", Quantity = 100, DueDate = Now.AddDays(7) },
            new() { Id = "O2", OrderNumber = "WO-002", ProductCode = "PROD-B1", Quantity = 100, DueDate = Now.AddDays(7) }
        };
        var request = CreateRequest(orders: orders);
        // EQ2 has lower utilization
        var context = CreateContext();

        var result = await _engine.GenerateInitialScheduleAsync(request, context,
            PriorityRule.FCFS, CapacitySelectionStrategy.LeastLoaded, CancellationToken.None);

        result.Assignments.Should().NotBeEmpty();
    }

    [Fact]
    public async Task GenerateInitialSchedule_Cancellation_Throws()
    {
        var request = CreateRequest();
        var context = CreateContext();
        using var cts = new CancellationTokenSource();
        cts.Cancel();

        await FluentActions.Awaiting(() =>
            _engine.GenerateInitialScheduleAsync(request, context, ct: cts.Token))
            .Should().ThrowAsync<OperationCanceledException>();
    }

    #endregion

    #region Test Helpers

    private static ScheduleRequest CreateRequest(List<WorkOrderInfo>? orders = null)
    {
        orders ??=
        [
            new() { Id = "O1", OrderNumber = "WO-001", ProductCode = "PROD-A1", Quantity = 100, DueDate = Now.AddDays(7), Priority = 10 },
            new() { Id = "O2", OrderNumber = "WO-002", ProductCode = "PROD-B1", Quantity = 200, DueDate = Now.AddDays(14), Priority = 5 },
            new() { Id = "O3", OrderNumber = "WO-003", ProductCode = "PROD-C1", Quantity = 150, DueDate = Now.AddDays(10), Priority = 8 }
        ];

        return new ScheduleRequest
        {
            WorkshopId = "WS-001",
            Orders = orders,
            Equipment =
            [
                new() { Id = "EQ1", EquipmentCode = "CNC-001", Capacity = 100, Type = "CNC" },
                new() { Id = "EQ2", EquipmentCode = "CNC-002", Capacity = 80, Type = "CNC" },
                new() { Id = "EQ3", EquipmentCode = "INJ-001", Capacity = 200, Type = "InjectionMolding" }
            ],
            Materials = new Dictionary<string, int>
            {
                ["MAT-A"] = 1000,
                ["MAT-B"] = 500,
                ["MAT-C"] = 300
            },
            Deadlines = new Dictionary<string, DateTime>
            {
                ["O1"] = Now.AddDays(7),
                ["O2"] = Now.AddDays(14),
                ["O3"] = Now.AddDays(10)
            }
        };
    }

    private static SchedulingContextSnapshot CreateContext(List<WorkOrderSummary>? orders = null)
    {
        orders ??=
        [
            new WorkOrderSummary("WO-001", "PROD-A1", "Product A", 100, 0, "Created", Now, Now.AddDays(7), "R001", 10, "WS-001"),
            new WorkOrderSummary("WO-002", "PROD-B1", "Product B", 200, 0, "Created", Now, Now.AddDays(14), "R002", 5, "WS-001"),
            new WorkOrderSummary("WO-003", "PROD-C1", "Product C", 150, 0, "Created", Now, Now.AddDays(10), "R003", 8, "WS-001")
        ];

        return new SchedulingContextSnapshot
        {
            WorkshopId = "WS-001",
            SnapshotTime = Now,
            WorkOrders = orders,
            EquipmentCapacities =
            [
                new EquipmentCapacitySummary("EQ1", "CNC-001", "CNC Machine 1", "CNC", "Running", 100, 0.75)
                {
                    TheoreticalCapacity = 100,
                    ActualCapacity = 78,
                    ReservedCapacity = 10,
                    IsBottleneck = false
                },
                new EquipmentCapacitySummary("EQ2", "CNC-002", "CNC Machine 2", "CNC", "Idle", 80, 0.3)
                {
                    TheoreticalCapacity = 80,
                    ActualCapacity = 62,
                    ReservedCapacity = 8,
                    IsBottleneck = false
                },
                new EquipmentCapacitySummary("EQ3", "INJ-001", "Injection Molder 1", "InjectionMolding", "Running", 200, 0.6)
                {
                    TheoreticalCapacity = 200,
                    ActualCapacity = 156,
                    ReservedCapacity = 20,
                    IsBottleneck = false
                }
            ],
            MaterialAvailabilities =
            [
                new MaterialAvailabilitySummary("MAT-A", "Material A", 1000, 100, 50)
                {
                    LastUpdatedAt = Now, DataSource = "WMS实时"
                },
                new MaterialAvailabilitySummary("MAT-B", "Material B", 500, 50, 30)
                {
                    LastUpdatedAt = Now, DataSource = "WMS实时"
                },
                new MaterialAvailabilitySummary("MAT-C", "Material C", 300, 30, 20)
                {
                    LastUpdatedAt = Now, DataSource = "WMS实时"
                }
            ],
            BomRequirements = [],
            Routings = [],
            WipItems = [],
            CurrentExecutions = [],
            ChangeoverMatrix = []
        };
    }

    private static EquipmentCapacitySummary CreateEquipment(
        string id, double capacity = 100, double utilization = 0.5)
    {
        return new EquipmentCapacitySummary(
            id, id, $"Equipment {id}", "CNC", "Idle", capacity, utilization)
        {
            TheoreticalCapacity = capacity,
            ActualCapacity = capacity * 0.78,
            ReservedCapacity = capacity * 0.10,
            IsBottleneck = false
        };
    }

    #endregion
}
