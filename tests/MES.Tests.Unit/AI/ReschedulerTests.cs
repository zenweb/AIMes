using MES.AI.Models;
using MES.AI.Scheduling;
using MES.Domain.Entities.Scheduling;
using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Xunit;

namespace MES.Tests.Unit.AI;

public class ReschedulerTests
{
    private static readonly DateTime Now = new(2026, 5, 12, 8, 0, 0, DateTimeKind.Utc);
    private readonly Rescheduler _rescheduler;
    private readonly Mock<ISchedulingRuleEngine> _ruleEngineMock;

    public ReschedulerTests()
    {
        _ruleEngineMock = new Mock<ISchedulingRuleEngine>();
        _rescheduler = new Rescheduler(
            NullLogger<Rescheduler>.Instance,
            _ruleEngineMock.Object,
            new LockPeriodManager(TimeSpan.FromHours(8)));
    }

    [Fact]
    public async Task InsertRushOrder_HighPriority_FindsGap()
    {
        var assignments = CreateAssignments();
        var rushOrder = new WorkOrderInfo { Id = "RUSH-1", OrderNumber = "WO-RUSH", ProductCode = "PROD-X1", Quantity = 50, DueDate = Now.AddDays(3), Priority = 95 };

        var result = await _rescheduler.InsertRushOrderAsync(assignments, rushOrder, CreateEquipment(), []);

        result.Success.Should().BeTrue();
        result.Assignments.Should().Contain(a => a.WorkOrderId == "RUSH-1");
    }

    [Fact]
    public async Task InsertRushOrder_LowPriority_Rejected()
    {
        var assignments = CreateAssignments();
        var rushOrder = new WorkOrderInfo { Id = "RUSH-1", Priority = 10 };

        var result = await _rescheduler.InsertRushOrderAsync(assignments, rushOrder, CreateEquipment(), [],
            new InsertionPolicy { MinimumPriority = 50 });

        result.Success.Should().BeFalse();
        result.ErrorMessage.Should().Contain("优先级");
    }

    [Fact]
    public async Task InsertRushOrder_NoGap_ReturnsFailure()
    {
        var now = DateTime.UtcNow;
        var assignments = new List<ScheduleAssignment>
        {
            new() { WorkOrderId = "O1", EquipmentId = "EQ-001", StartTime = now.AddMinutes(10), EndTime = now.AddDays(10) },
        };
        var rushOrder = new WorkOrderInfo { Id = "RUSH-1", ProductCode = "PROD-X1", Quantity = 5, DueDate = now.AddDays(1), Priority = 90 };

        var result = await _rescheduler.InsertRushOrderAsync(assignments, rushOrder, CreateEquipment(), [],
            new InsertionPolicy { LookAheadWindow = TimeSpan.FromMinutes(5) });

        result.Success.Should().BeFalse();
        result.ErrorMessage.Should().Contain("间隙");
    }

    [Fact]
    public async Task RescheduleAfterFailure_NoAffectedOrders_NoChange()
    {
        var assignments = CreateAssignments();
        var future = Now.AddDays(10);

        var result = await _rescheduler.RescheduleAfterFailureAsync(
            assignments, "EQ-001", future, future.AddHours(4), CreateEquipment(), []);

        result.Success.Should().BeTrue();
        result.DisruptionScore.Should().Be(0);
        result.ShiftedOrderCount.Should().Be(0);
    }

    [Fact]
    public async Task RescheduleAfterFailure_AffectedOrders_Shifted()
    {
        var assignments = CreateAssignments();
        var failureTime = Now.AddHours(-1);
        var repairTime = Now.AddHours(2);

        var result = await _rescheduler.RescheduleAfterFailureAsync(
            assignments, "EQ-001", failureTime, repairTime, CreateEquipment(), []);

        result.Success.Should().BeTrue();
        result.ShiftedOrderCount.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task RescheduleAfterFailure_LockedOrders_Preserved()
    {
        var assignments = CreateAssignments();
        var toLock = assignments.First(a => a.EquipmentId == "EQ-001").WorkOrderId;
        var failureTime = Now.AddHours(-1);
        var repairTime = Now.AddHours(2);

        var result = await _rescheduler.RescheduleAfterFailureAsync(
            assignments, "EQ-001", failureTime, repairTime, CreateEquipment(), [],
            lockedOrderIds: [toLock]);

        result.Success.Should().BeTrue();
    }

    [Fact]
    public async Task InsertRushOrder_WithPreemptive_Reassigns()
    {
        var assignments = CreateAssignments();
        var rushOrder = new WorkOrderInfo { Id = "RUSH-1", OrderNumber = "WO-RUSH", ProductCode = "PROD-X1", Quantity = 100, DueDate = Now.AddDays(1), Priority = 99 };

        var result = await _rescheduler.InsertRushOrderAsync(assignments, rushOrder, CreateEquipment(), [],
            new InsertionPolicy
            {
                MinimumPriority = 50,
                LookAheadWindow = TimeSpan.FromDays(7),
                MaxDisruptionRatio = 0.8,
                Strategy = InsertionStrategy.PriorityPreemptive
            });

        result.Success.Should().BeTrue();
        result.Assignments.Should().Contain(a => a.WorkOrderId == "RUSH-1");
    }

    [Fact]
    public async Task RescheduleAfterFailure_AlternativeEquipment_Used()
    {
        var now = DateTime.UtcNow;
        var assignments = new List<ScheduleAssignment>
        {
            new() { WorkOrderId = "O1", EquipmentId = "EQ-BROKEN", StartTime = now.AddHours(1), EndTime = now.AddHours(5) },
            new() { WorkOrderId = "O2", EquipmentId = "EQ-OK", StartTime = now.AddHours(-2), EndTime = now.AddHours(1) },
        };
        var equipment = new List<EquipmentCapacitySummary>
        {
            new("EQ-BROKEN", "BRK-01", "Broken", "CNC", "Down", 100, 0)
            {
                TheoreticalCapacity = 100, ActualCapacity = 78, ReservedCapacity = 10, IsBottleneck = false
            },
            new("EQ-OK", "OK-01", "Available", "CNC", "Running", 100, 0.5)
            {
                TheoreticalCapacity = 100, ActualCapacity = 78, ReservedCapacity = 10, IsBottleneck = false
            },
        };

        var result = await _rescheduler.RescheduleAfterFailureAsync(
            assignments, "EQ-BROKEN", now, now.AddHours(2), equipment, []);

        result.Success.Should().BeTrue();
        result.ShiftedOrderCount.Should().Be(1);
        // O1 should be reassigned to EQ-OK (after repair now+2h, before O2 starts at now+5:01)
        result.Assignments.First(a => a.WorkOrderId == "O1").EquipmentId.Should().Be("EQ-OK");
    }

    [Fact]
    public async Task InsertRushOrder_DisruptionTooHigh_Rejected()
    {
        var assignments = CreateAssignments();
        var rushOrder = new WorkOrderInfo { Id = "RUSH-1", ProductCode = "PROD-X1", Quantity = 5000, DueDate = Now.AddDays(1), Priority = 90 };

        var result = await _rescheduler.InsertRushOrderAsync(assignments, rushOrder, CreateEquipment(), [],
            new InsertionPolicy
            {
                MinimumPriority = 50,
                MaxDisruptionRatio = 0.01, // 几乎不允许扰动
                Strategy = InsertionStrategy.GreedyEarliest
            });

        result.Success.Should().BeFalse();
    }

    [Fact]
    public async Task InsertRushOrder_MultipleEquipment_FindsBestGap()
    {
        var assignments = CreateAssignments();
        var rushOrder = new WorkOrderInfo { Id = "RUSH-1", ProductCode = "PROD-Y1", Quantity = 30, DueDate = Now.AddDays(5), Priority = 85 };
        var equipment = CreateEquipment(extra: true);

        var result = await _rescheduler.InsertRushOrderAsync(assignments, rushOrder, equipment, []);

        result.Success.Should().BeTrue();
        result.Assignments.Should().Contain(a => a.WorkOrderId == "RUSH-1");
    }

    #region Helpers

    private static List<ScheduleAssignment> CreateAssignments(bool dense = false)
    {
        var baseTime = dense ? Now : Now.AddDays(1);
        return
        [
            new() { WorkOrderId = "O1", EquipmentId = "EQ-001", StartTime = baseTime, EndTime = baseTime.AddHours(4), GroupId = "PROD" },
            new() { WorkOrderId = "O2", EquipmentId = "EQ-001", StartTime = baseTime.AddHours(4), EndTime = baseTime.AddHours(8), GroupId = "PROD" },
            new() { WorkOrderId = "O3", EquipmentId = "EQ-001", StartTime = baseTime.AddHours(8), EndTime = baseTime.AddHours(12), GroupId = "PROD" },
            new() { WorkOrderId = "O4", EquipmentId = "EQ-002", StartTime = baseTime, EndTime = baseTime.AddHours(6), GroupId = "PROD" },
            new() { WorkOrderId = "O5", EquipmentId = "EQ-002", StartTime = baseTime.AddHours(6), EndTime = baseTime.AddHours(10), GroupId = "PROD" },
        ];
    }

    private static List<EquipmentCapacitySummary> CreateEquipment(bool extra = false)
    {
        var list = new List<EquipmentCapacitySummary>
        {
            new("EQ-001", "CNC-001", "CNC 1", "CNC", "Running", 100, 0.6)
            {
                TheoreticalCapacity = 100, ActualCapacity = 78, ReservedCapacity = 10, IsBottleneck = false
            },
            new("EQ-002", "CNC-002", "CNC 2", "CNC", "Running", 100, 0.5)
            {
                TheoreticalCapacity = 100, ActualCapacity = 78, ReservedCapacity = 10, IsBottleneck = false
            },
        };
        if (extra)
        {
            list.Add(new EquipmentCapacitySummary("EQ-003", "INJ-001", "Injection", "InjectionMolding", "Idle", 200, 0.1)
            {
                TheoreticalCapacity = 200, ActualCapacity = 156, ReservedCapacity = 20, IsBottleneck = true
            });
        }
        return list;
    }

    #endregion
}
