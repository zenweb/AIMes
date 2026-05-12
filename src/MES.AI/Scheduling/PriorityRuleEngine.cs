namespace MES.AI.Scheduling;

using MES.AI.Models;

/// <summary>优先级规则引擎 — 按不同规则对工单排序</summary>
public static class PriorityRuleEngine
{
    public static List<WorkOrderInfo> Sort(List<WorkOrderInfo> orders, PriorityRule rule, DateTime? now = null)
    {
        if (orders.Count < 2) return [.. orders];

        return rule switch
        {
            PriorityRule.EDD => [.. orders.OrderBy(o => o.DueDate)],
            PriorityRule.SPT => [.. orders.OrderBy(o => o.Quantity)],
            PriorityRule.CR => SortByCriticalRatio(orders, now ?? DateTime.UtcNow),
            PriorityRule.FCFS => [.. orders],
            _ => [.. orders]
        };
    }

    private static List<WorkOrderInfo> SortByCriticalRatio(List<WorkOrderInfo> orders, DateTime now)
    {
        return [.. orders
            .Select(o => new
            {
                Order = o,
                RemainingMinutes = (o.DueDate - now).TotalMinutes,
                EstimatedMinutes = Math.Max(o.Quantity, 1)
            })
            .OrderBy(x => x.RemainingMinutes <= 0 ? 0 : Math.Max(x.RemainingMinutes / x.EstimatedMinutes, 0))
            .Select(x => x.Order)];
    }
}
