namespace MES.AI.Core.Scheduling;

/// <summary>目标函数工厂 — 根据策略名称创建对应目标函数实例</summary>
public static class ObjectiveFunctionFactory
{
    public static IObjectiveFunction Create(string? objective) => objective?.ToLowerInvariant() switch
    {
        "due_date" => new DueDateObjective(),
        "utilization" => new UtilizationObjective(),
        "changeover" => new ChangeoverObjective(),
        "balanced" => new BalancedObjective(),
        _ => new DueDateObjective(),
    };
}
