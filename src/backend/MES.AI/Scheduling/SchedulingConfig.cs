namespace MES.AI.Core.Scheduling;

/// <summary>加权多目标排产配置</summary>
public record WeightedSchedulingConfig
{
    /// <summary>交期紧迫度权重 (默认 0.5)</summary>
    public double DueDateWeight { get; init; } = 0.5;
    /// <summary>客户优先级权重 (默认 0.3)</summary>
    public double PriorityWeight { get; init; } = 0.3;
    /// <summary>加工时间效率权重 (默认 0.2)</summary>
    public double ProcessingTimeWeight { get; init; } = 0.2;

    /// <summary>启用产品族分批排产 (同族连续加工减少换线)</summary>
    public bool EnableBatchScheduling { get; init; } = true;

    public static WeightedSchedulingConfig Default => new();
}
