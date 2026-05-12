using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Quality;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace MES.Tests.Unit.Domain;

/// <summary>
/// 工单实体测试
/// </summary>
public class WorkOrderTests
{
    [Fact]
    public void WorkOrder_ShouldInitializeWithDefaultValues()
    {
        // Arrange & Act
        var workOrder = new WorkOrder();

        // Assert
        workOrder.Id.Should().NotBeNullOrEmpty();
        workOrder.OrderNumber.Should().BeEmpty();
        workOrder.ProductCode.Should().BeEmpty();
        workOrder.ProductName.Should().BeEmpty();
        workOrder.PlannedQuantity.Should().Be(0);
        workOrder.CompletedQuantity.Should().Be(0);
        workOrder.Status.Should().Be(WorkOrderStatus.Created);
        workOrder.Priority.Should().Be(0);
        workOrder.CustomFields.Should().NotBeNull();
        workOrder.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public void WorkOrder_ShouldSetPropertiesCorrectly()
    {
        // Arrange
        var id = Guid.NewGuid().ToString();
        var now = DateTime.UtcNow;

        // Act
        var workOrder = new WorkOrder
        {
            Id = id,
            OrderNumber = "WO-001",
            ProductCode = "PROD-001",
            ProductName = "Test Product",
            PlannedQuantity = 100,
            CompletedQuantity = 50,
            PlannedStartDate = now,
            PlannedEndDate = now.AddDays(7),
            WorkshopId = "WS-001",
            RouteCode = "ROUTE-001",
            Status = WorkOrderStatus.InProgress,
            Priority = 10
        };

        // Assert
        workOrder.Id.Should().Be(id);
        workOrder.OrderNumber.Should().Be("WO-001");
        workOrder.ProductCode.Should().Be("PROD-001");
        workOrder.ProductName.Should().Be("Test Product");
        workOrder.PlannedQuantity.Should().Be(100);
        workOrder.CompletedQuantity.Should().Be(50);
        workOrder.Status.Should().Be(WorkOrderStatus.InProgress);
        workOrder.Priority.Should().Be(10);
    }

    [Theory]
    [InlineData(WorkOrderStatus.Created)]
    [InlineData(WorkOrderStatus.Scheduled)]
    [InlineData(WorkOrderStatus.InProgress)]
    [InlineData(WorkOrderStatus.Paused)]
    [InlineData(WorkOrderStatus.Completed)]
    [InlineData(WorkOrderStatus.Cancelled)]
    public void WorkOrder_ShouldAcceptAllValidStatuses(WorkOrderStatus status)
    {
        // Arrange & Act
        var workOrder = new WorkOrder { Status = status };

        // Assert
        workOrder.Status.Should().Be(status);
    }

    [Fact]
    public void WorkOrder_CustomFieldsShouldBeModifiable()
    {
        // Arrange
        var workOrder = new WorkOrder();

        // Act
        workOrder.CustomFields["Customer"] = "CustomerA";
        workOrder.CustomFields["Notes"] = "Special instructions";

        // Assert
        workOrder.CustomFields.Should().ContainKey("Customer");
        workOrder.CustomFields["Customer"].Should().Be("CustomerA");
        workOrder.CustomFields.Should().HaveCount(2);
    }
}
