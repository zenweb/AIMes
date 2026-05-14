using FluentAssertions;
using MES.Domain.Entities.Production;
using MES.Domain.Enums;
using Xunit;

namespace MES.Tests.Unit.Domain;

public class WorkOrderTests
{
    private static readonly DateTime Now = DateTime.UtcNow;

    [Fact]
    public void Create_ShouldInitializeWithCorrectProperties()
    {
        var result = WorkOrder.Create("WO-001", "PROD-001", "Test Product", 100,
            Now, Now.AddDays(7), "WS-001", 10, "R001");

        result.Should().NotBeNull();
        result.OrderNumber.Should().Be("WO-001");
        result.ProductCode.Should().Be("PROD-001");
        result.ProductName.Should().Be("Test Product");
        result.PlannedQuantity.Should().Be(100);
        result.PlannedStartDate.Should().Be(Now);
        result.PlannedEndDate.Should().Be(Now.AddDays(7));
        result.WorkshopId.Should().Be("WS-001");
        result.Priority.Should().Be(10);
        result.RouteCode.Should().Be("R001");
        result.Status.Should().Be(WorkOrderStatus.Created);
        result.CompletedQuantity.Should().Be(0);
        result.CustomFields.Should().NotBeNull();
        result.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public void Create_ShouldGenerateNonEmptyId()
    {
        var result = WorkOrder.Create("WO-001", "PROD-001", "Product", 100,
            Now, Now.AddDays(7), "WS-001");

        result.Id.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public void Create_WithDefaultPriority_ShouldBeZero()
    {
        var result = WorkOrder.Create("WO-001", "PROD-001", "Product", 100,
            Now, Now.AddDays(7), "WS-001");

        result.Priority.Should().Be(0);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Create_InvalidOrderNumber_ShouldThrow(string? orderNumber)
    {
        var act = () => WorkOrder.Create(orderNumber!, "PROD-001", "Product", 100,
            Now, Now.AddDays(7), "WS-001");

        act.Should().Throw<ArgumentException>();
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Create_InvalidProductCode_ShouldThrow(string? productCode)
    {
        var act = () => WorkOrder.Create("WO-001", productCode!, "Product", 100,
            Now, Now.AddDays(7), "WS-001");

        act.Should().Throw<ArgumentException>();
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Create_NonPositiveQuantity_ShouldThrow(int quantity)
    {
        var act = () => WorkOrder.Create("WO-001", "PROD-001", "Product", quantity,
            Now, Now.AddDays(7), "WS-001");

        act.Should().Throw<ArgumentOutOfRangeException>();
    }

    [Fact]
    public void Create_StartDateAfterEndDate_ShouldThrow()
    {
        var act = () => WorkOrder.Create("WO-001", "PROD-001", "Product", 100,
            Now.AddDays(7), Now, "WS-001");

        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Create_NegativePriority_ShouldThrow()
    {
        var act = () => WorkOrder.Create("WO-001", "PROD-001", "Product", 100,
            Now, Now.AddDays(7), "WS-001", -1);

        act.Should().Throw<ArgumentOutOfRangeException>();
    }

    [Fact]
    public void Start_ShouldTransitionToInProgress()
    {
        var wo = CreateDefaultWorkOrder();

        wo.Start();

        wo.Status.Should().Be(WorkOrderStatus.InProgress);
        wo.ActualStartDate.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public void Start_WhenAlreadyStarted_ShouldThrow()
    {
        var wo = CreateDefaultWorkOrder();
        wo.Start();

        var act = () => wo.Start();

        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void Start_WhenCompleted_ShouldThrow()
    {
        var wo = CreateDefaultWorkOrder();
        wo.Start();
        wo.Complete(100);

        var act = () => wo.Start();

        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void Complete_ShouldSetCompletedQuantityAndEndDate()
    {
        var wo = CreateDefaultWorkOrder();
        wo.Start();

        wo.Complete(80);

        wo.Status.Should().Be(WorkOrderStatus.Completed);
        wo.CompletedQuantity.Should().Be(80);
        wo.ActualEndDate.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public void Complete_WhenNotStarted_ShouldThrow()
    {
        var wo = CreateDefaultWorkOrder();

        var act = () => wo.Complete(100);

        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void Cancel_ShouldSetStatusToCancelled()
    {
        var wo = CreateDefaultWorkOrder();

        wo.Cancel();

        wo.Status.Should().Be(WorkOrderStatus.Cancelled);
    }

    [Fact]
    public void Cancel_WhenCompleted_ShouldThrow()
    {
        var wo = CreateDefaultWorkOrder();
        wo.Start();
        wo.Complete(100);

        var act = () => wo.Cancel();

        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void Cancel_WhenAlreadyCancelled_ShouldThrow()
    {
        var wo = CreateDefaultWorkOrder();
        wo.Cancel();

        var act = () => wo.Cancel();

        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void Pause_ShouldTransitionToPaused()
    {
        var wo = CreateDefaultWorkOrder();
        wo.Start();

        wo.Pause();

        wo.Status.Should().Be(WorkOrderStatus.Paused);
    }

    [Fact]
    public void Pause_WhenNotRunning_ShouldThrow()
    {
        var wo = CreateDefaultWorkOrder();

        var act = () => wo.Pause();

        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void Hold_ShouldTransitionToOnHold()
    {
        var wo = CreateDefaultWorkOrder();
        wo.Start();

        wo.Hold();

        wo.Status.Should().Be(WorkOrderStatus.OnHold);
    }

    [Fact]
    public void Hold_FromPaused_ShouldTransitionToOnHold()
    {
        var wo = CreateDefaultWorkOrder();
        wo.Start();
        wo.Pause();

        wo.Hold();

        wo.Status.Should().Be(WorkOrderStatus.OnHold);
    }

    [Fact]
    public void Hold_WhenCreated_ShouldThrow()
    {
        var wo = CreateDefaultWorkOrder();

        var act = () => wo.Hold();

        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void Resume_FromPaused_ShouldTransitionToInProgress()
    {
        var wo = CreateDefaultWorkOrder();
        wo.Start();
        wo.Pause();

        wo.Resume();

        wo.Status.Should().Be(WorkOrderStatus.InProgress);
    }

    [Fact]
    public void Resume_FromOnHold_ShouldTransitionToInProgress()
    {
        var wo = CreateDefaultWorkOrder();
        wo.Start();
        wo.Hold();

        wo.Resume();

        wo.Status.Should().Be(WorkOrderStatus.InProgress);
    }

    [Fact]
    public void Resume_WhenCreated_ShouldThrow()
    {
        var wo = CreateDefaultWorkOrder();

        var act = () => wo.Resume();

        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void Schedule_ShouldSetDatesAndPriority()
    {
        var wo = CreateDefaultWorkOrder();
        var newStart = Now.AddDays(1);
        var newEnd = Now.AddDays(10);

        wo.Schedule(newStart, newEnd, 5);

        wo.PlannedStartDate.Should().Be(newStart);
        wo.PlannedEndDate.Should().Be(newEnd);
        wo.Priority.Should().Be(5);
        wo.Status.Should().Be(WorkOrderStatus.Scheduled);
    }

    [Fact]
    public void AddCompletedQuantity_ShouldAccumulate()
    {
        var wo = CreateDefaultWorkOrder();
        wo.Start();

        wo.AddCompletedQuantity(30);
        wo.AddCompletedQuantity(20);

        wo.CompletedQuantity.Should().Be(50);
    }

    [Fact]
    public void AddCompletedQuantity_WhenNotRunning_ShouldThrow()
    {
        var wo = CreateDefaultWorkOrder();

        var act = () => wo.AddCompletedQuantity(10);

        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void AddCompletedQuantity_NonPositive_ShouldThrow()
    {
        var wo = CreateDefaultWorkOrder();
        wo.Start();

        var act = () => wo.AddCompletedQuantity(-1);

        act.Should().Throw<ArgumentOutOfRangeException>();
    }

    [Fact]
    public void TransitionTo_InProgress_ShouldStart()
    {
        var wo = CreateDefaultWorkOrder();

        wo.TransitionTo(WorkOrderStatus.InProgress);

        wo.Status.Should().Be(WorkOrderStatus.InProgress);
    }

    [Fact]
    public void TransitionTo_Cancelled_ShouldCancel()
    {
        var wo = CreateDefaultWorkOrder();

        wo.TransitionTo(WorkOrderStatus.Cancelled);

        wo.Status.Should().Be(WorkOrderStatus.Cancelled);
    }

    [Fact]
    public void TransitionTo_Scheduled_ShouldSchedule()
    {
        var wo = CreateDefaultWorkOrder();

        wo.TransitionTo(WorkOrderStatus.Scheduled);

        wo.Status.Should().Be(WorkOrderStatus.Scheduled);
    }

    [Fact]
    public void TransitionTo_InvalidTarget_ShouldThrow()
    {
        var wo = CreateDefaultWorkOrder();

        var act = () => wo.TransitionTo((WorkOrderStatus)99);

        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void CustomFields_ShouldBeModifiable()
    {
        var wo = CreateDefaultWorkOrder();

        wo.CustomFields["Customer"] = "CustomerA";
        wo.CustomFields["Notes"] = "Special instructions";

        wo.CustomFields.Should().ContainKey("Customer");
        wo.CustomFields["Customer"].Should().Be("CustomerA");
        wo.CustomFields.Should().HaveCount(2);
    }

    [Fact]
    public void CanStart_WhenCreated_ShouldBeTrue()
    {
        var wo = CreateDefaultWorkOrder();

        wo.CanStart.Should().BeTrue();
    }

    [Fact]
    public void CanStart_WhenRunning_ShouldBeFalse()
    {
        var wo = CreateDefaultWorkOrder();
        wo.Start();

        wo.CanStart.Should().BeFalse();
    }

    [Fact]
    public void CanComplete_WhenRunning_ShouldBeTrue()
    {
        var wo = CreateDefaultWorkOrder();
        wo.Start();

        wo.CanComplete.Should().BeTrue();
    }

    [Fact]
    public void CanComplete_WhenCreated_ShouldBeFalse()
    {
        var wo = CreateDefaultWorkOrder();

        wo.CanComplete.Should().BeFalse();
    }

    private static WorkOrder CreateDefaultWorkOrder()
    {
        return WorkOrder.Create("WO-001", "PROD-001", "Test Product", 100,
            DateTime.UtcNow, DateTime.UtcNow.AddDays(7), "WS-001");
    }
}
