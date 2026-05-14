namespace MES.AI.Core.Scheduling;

using MES.AI.Core.Models;

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
            PriorityRule.WeightedComposite => SortByWeightedScore(orders, now ?? DateTime.UtcNow),
            _ => [.. orders]
        };
    }

    /// <summary>按加权多目标复合评分排序 (分越高越优先)</summary>
    public static List<WorkOrderInfo> SortByWeightedScore(
        List<WorkOrderInfo> orders, DateTime now, WeightedSchedulingConfig? config = null)
    {
        config ??= WeightedSchedulingConfig.Default;

        var maxDueDateTicks = orders.Max(o => o.DueDate.Ticks);
        var minDueDateTicks = orders.Min(o => o.DueDate.Ticks);
        var dateRange = Math.Max(maxDueDateTicks - minDueDateTicks, 1);

        var maxPriority = orders.Max(o => o.Priority);
        var minPriority = orders.Min(o => o.Priority);
        var priorityRange = Math.Max(maxPriority - minPriority, 1);

        var maxQty = orders.Max(o => o.Quantity);
        var minQty = orders.Min(o => o.Quantity);
        var qtyRange = Math.Max(maxQty - minQty, 1);

        return [.. orders
            .Select(o =>
            {
                // 交期紧迫度: 越近分数越高 (归一化 0-1)
                var dueDateNorm = 1.0 - (double)(o.DueDate.Ticks - minDueDateTicks) / dateRange;
                // 优先级: 越高分数越高
                var priorityNorm = (double)(o.Priority - minPriority) / priorityRange;
                // 加工时间效率: 越短分数越高 (SPT 原则)
                var processTimeNorm = 1.0 - (double)(o.Quantity - minQty) / qtyRange;

                var score = dueDateNorm * config.DueDateWeight
                          + priorityNorm * config.PriorityWeight
                          + processTimeNorm * config.ProcessingTimeWeight;

                return (Order: o, Score: score);
            })
            .OrderByDescending(x => x.Score)
            .Select(x => x.Order)];
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
