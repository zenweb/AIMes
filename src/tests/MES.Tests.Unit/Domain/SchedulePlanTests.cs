using FluentAssertions;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Enums;
using Xunit;

namespace MES.Tests.Unit.Domain;

/// <summary>
/// 排产计划实体测试
/// </summary>
public class SchedulePlanTests
{
    [Fact]
    public void SchedulePlan_ShouldInitializeWithDefaultValues()
    {
        // Arrange & Act
        var plan = new SchedulePlan();

        // Assert
        plan.Id.Should().NotBeNullOrEmpty();
        plan.PlanName.Should().BeEmpty();
        plan.Items.Should().NotBeNull();
        plan.Items.Should().BeEmpty();
        plan.OverallUtilizationRate.Should().Be(0);
        plan.OnTimeDeliveryRate.Should().Be(0);
        plan.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public void SchedulePlan_ShouldCreateViaFactory()
    {
        // Arrange
        var now = DateTime.UtcNow;

        // Act
        var plan = SchedulePlan.Create("Production Plan Q1", now, now.AddDays(30));

        // Assert
        plan.PlanName.Should().Be("Production Plan Q1");
        plan.PlanStartDate.Should().Be(now);
        plan.PlanEndDate.Should().Be(now.AddDays(30));
        plan.Status.Should().Be(SchedulePlanStatus.Draft);
    }

    [Fact]
    public void SchedulePlan_ShouldAddScheduleItemsViaMethod()
    {
        // Arrange
        var plan = SchedulePlan.Create("测试计划", DateTime.UtcNow, DateTime.UtcNow.AddDays(7));
        var item = ScheduleItem.Create("WO-001", "EQ-001",
            DateTime.UtcNow, DateTime.UtcNow.AddHours(8), 1);

        // Act
        plan.AddItem(item);

        // Assert
        plan.Items.Should().HaveCount(1);
        plan.Items[0].WorkOrderId.Should().Be("WO-001");
    }

    [Fact]
    public void SchedulePlan_ShouldLockUnlockAndAdopt()
    {
        // Arrange
        var plan = SchedulePlan.Create("测试计划", DateTime.UtcNow, DateTime.UtcNow.AddDays(7));

        // Act & Assert
        plan.Lock();
        plan.Status.Should().Be(SchedulePlanStatus.Locked);

        plan.Unlock();
        plan.Status.Should().Be(SchedulePlanStatus.Active);

        plan.Adopt();
        plan.Status.Should().Be(SchedulePlanStatus.Adopted);
    }

    [Fact]
    public void ScheduleItem_ShouldInitializeWithDefaultValues()
    {
        // Arrange & Act
        var item = new ScheduleItem();

        // Assert
        item.Id.Should().NotBeNullOrEmpty();
        item.WorkOrderId.Should().BeEmpty();
        item.EquipmentId.Should().BeEmpty();
        item.Sequence.Should().Be(0);
        item.DependentItems.Should().NotBeNull();
    }
}
