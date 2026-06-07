using FluentAssertions;
using MES.Application.Services;
using MES.Domain.Entities.Production;
using MES.Domain.Enums;

namespace MES.Tests.Unit.Application;

public class ProductionKpiCalculatorTests
{
    [Fact]
    public void CalculateOnTimeRate_ShouldCountOverdueUnfinishedWorkOrdersInDenominator()
    {
        var now = new DateTime(2026, 5, 31, 8, 0, 0, DateTimeKind.Utc);
        var onTimeCompleted = CreateWorkOrder("WO-ONTIME", DateTime.UtcNow.AddDays(-3), DateTime.UtcNow.AddDays(1), WorkOrderStatus.Completed);
        var lateCompleted = CreateWorkOrder("WO-LATE", DateTime.UtcNow.AddDays(-4), DateTime.UtcNow.AddDays(-1), WorkOrderStatus.Completed);
        var overdueUnfinished = CreateWorkOrder("WO-OVERDUE", now.AddDays(-5), now.AddDays(-2), WorkOrderStatus.InProgress);
        var futureUnfinished = CreateWorkOrder("WO-FUTURE", now, now.AddDays(2), WorkOrderStatus.InProgress);

        var result = ProductionKpiCalculator.CalculateOnTimeRate(
            [onTimeCompleted, lateCompleted, overdueUnfinished, futureUnfinished],
            now);

        result.Should().Be(1d / 3d, "超期未完成工单已经承诺交付，应进入 OTD 分母并按未准时计算；未到期未完成工单不进入分母");
    }

    private static WorkOrder CreateWorkOrder(
        string orderNumber,
        DateTime plannedStart,
        DateTime plannedEnd,
        WorkOrderStatus status)
    {
        var workOrder = WorkOrder.Create(orderNumber, "PROD-A", "Product A", 10, plannedStart, plannedEnd, "WS-001");
        if (status is WorkOrderStatus.InProgress)
        {
            workOrder.Start();
        }

        if (status is WorkOrderStatus.Completed)
        {
            workOrder.Start();
            workOrder.Complete(10);
        }

        return workOrder;
    }
}
