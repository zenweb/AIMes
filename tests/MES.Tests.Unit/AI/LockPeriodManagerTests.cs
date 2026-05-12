using MES.AI.Models;
using MES.AI.Scheduling;
using FluentAssertions;
using Xunit;

namespace MES.Tests.Unit.AI;

public class LockPeriodManagerTests
{
    private static readonly DateTime Now = new(2026, 5, 12, 8, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void IsWithinLockPeriod_WithinWindow_ReturnsTrue()
    {
        var manager = new LockPeriodManager(TimeSpan.FromHours(8));
        var orderStart = Now.AddHours(4); // 4 hours from now

        var result = manager.IsWithinLockPeriod(orderStart, Now);

        result.Should().BeTrue();
    }

    [Fact]
    public void IsWithinLockPeriod_OutsideWindow_ReturnsFalse()
    {
        var manager = new LockPeriodManager(TimeSpan.FromHours(8));
        var orderStart = Now.AddDays(2); // 48 hours from now

        var result = manager.IsWithinLockPeriod(orderStart, Now);

        result.Should().BeFalse();
    }

    [Fact]
    public void GetLockedOrderIds_ReturnsMatchingOrders()
    {
        var manager = new LockPeriodManager(TimeSpan.FromHours(8));
        var assignments = new List<ScheduleAssignment>
        {
            new() { WorkOrderId = "O1", StartTime = Now.AddHours(2) },  // within lock
            new() { WorkOrderId = "O2", StartTime = Now.AddDays(3) },  // outside lock
            new() { WorkOrderId = "O3", StartTime = Now.AddHours(6) }, // within lock
        };

        var locked = manager.GetLockedOrderIds(assignments, now: Now);

        locked.Should().Contain("O1");
        locked.Should().Contain("O3");
        locked.Should().NotContain("O2");
    }

    [Fact]
    public void GetLockedOrderIds_PastOrders_NotLocked()
    {
        var manager = new LockPeriodManager(TimeSpan.FromHours(8));
        var assignments = new List<ScheduleAssignment>
        {
            new() { WorkOrderId = "O1", StartTime = Now.AddHours(-2) }, // already started
        };

        var locked = manager.GetLockedOrderIds(assignments, now: Now);

        locked.Should().NotContain("O1");
    }

    [Fact]
    public void IsWithinLockPeriod_AtBoundary_ReturnsTrue()
    {
        var manager = new LockPeriodManager(TimeSpan.FromHours(8));
        var orderStart = Now.AddHours(8); // exactly at boundary

        var result = manager.IsWithinLockPeriod(orderStart, Now);

        // <= cutoff, so within lock period
        result.Should().BeTrue();
    }
}
