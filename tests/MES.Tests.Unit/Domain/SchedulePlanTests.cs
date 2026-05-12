using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Quality;
using MES.Domain.Entities.Scheduling;
using FluentAssertions;
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
    public void SchedulePlan_ShouldSetPropertiesCorrectly()
    {
        // Arrange
        var id = Guid.NewGuid().ToString();
        var now = DateTime.UtcNow;

        // Act
        var plan = new SchedulePlan
        {
            Id = id,
            PlanName = "Production Plan Q1",
            PlanStartDate = now,
            PlanEndDate = now.AddDays(30),
            OverallUtilizationRate = 85.5,
            OnTimeDeliveryRate = 95.0,
            OptimizationNotes = "AI optimized for maximum throughput"
        };

        // Assert
        plan.Id.Should().Be(id);
        plan.PlanName.Should().Be("Production Plan Q1");
        plan.OverallUtilizationRate.Should().Be(85.5);
        plan.OnTimeDeliveryRate.Should().Be(95.0);
        plan.OptimizationNotes.Should().Contain("AI optimized");
    }

    [Fact]
    public void SchedulePlan_ShouldAddScheduleItems()
    {
        // Arrange
        var plan = new SchedulePlan();
        var item = new ScheduleItem
        {
            WorkOrderId = "WO-001",
            EquipmentId = "EQ-001",
            PlannedStartTime = DateTime.UtcNow,
            PlannedEndTime = DateTime.UtcNow.AddHours(8),
            Sequence = 1
        };

        // Act
        plan.Items.Add(item);

        // Assert
        plan.Items.Should().HaveCount(1);
        plan.Items[0].WorkOrderId.Should().Be("WO-001");
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
