namespace MES.AI.Core.Scheduling;

/// <summary>插单策略</summary>
public enum InsertionStrategy
{
    /// <summary>最早可用位置插入</summary>
    GreedyEarliest,
    /// <summary>扰动最小的位置</summary>
    LeastDisruption,
    /// <summary>高优先级抢占低优先级</summary>
    PriorityPreemptive
}

/// <summary>插单策略配置 — 定义谁可插、谁让位</summary>
public class InsertionPolicy
{
    /// <summary>最低优先级门槛（只有优先级 >= 此值的工单可插单）</summary>
    public int MinimumPriority { get; init; } = 80;
    /// <summary>最大查找窗口（在此时间范围内查找可插入位置）</summary>
    public TimeSpan LookAheadWindow { get; init; } = TimeSpan.FromDays(7);
    /// <summary>最大扰动比率（被调整工单数 / 总工单数，超过则拒绝插单）</summary>
    public double MaxDisruptionRatio { get; init; } = 0.5;
    /// <summary>插单策略</summary>
    public InsertionStrategy Strategy { get; init; } = InsertionStrategy.LeastDisruption;

    public static InsertionPolicy Default => new();

    public static InsertionPolicy Express => new()
    {
        MinimumPriority = 50,
        LookAheadWindow = TimeSpan.FromDays(14),
        MaxDisruptionRatio = 0.5,
        Strategy = InsertionStrategy.PriorityPreemptive
    };

    public static InsertionPolicy Conservative => new()
    {
        MinimumPriority = 95,
        LookAheadWindow = TimeSpan.FromDays(3),
        MaxDisruptionRatio = 0.1,
        Strategy = InsertionStrategy.GreedyEarliest
    };
}
