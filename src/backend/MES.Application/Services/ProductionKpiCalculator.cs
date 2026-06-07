using MES.Domain.Entities.Production;
using MES.Domain.Enums;

namespace MES.Application.Services;

public static class ProductionKpiCalculator
{
    public static double CalculateOnTimeRate(IReadOnlyCollection<WorkOrder> workOrders, DateTime referenceTime)
    {
        var dueOrCompletedOrders = workOrders
            .Where(w => w.Status == WorkOrderStatus.Completed || w.PlannedEndDate <= referenceTime)
            .ToList();

        if (dueOrCompletedOrders.Count == 0)
        {
            return 0;
        }

        var onTimeDeliveries = dueOrCompletedOrders.Count(w =>
            w.Status == WorkOrderStatus.Completed
            && w.ActualEndDate.HasValue
            && w.ActualEndDate.Value <= w.PlannedEndDate);

        return (double)onTimeDeliveries / dueOrCompletedOrders.Count;
    }
}
