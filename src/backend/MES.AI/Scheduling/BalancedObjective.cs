namespace MES.AI.Core.Scheduling;

using MES.AI.Core.Models;
using MES.Domain.Entities.Scheduling;

/// <summary>综合平衡目标函数 — 加权组合交期 + 利用率 + 换线时间</summary>
public sealed class BalancedObjective : IObjectiveFunction
{
    private readonly DueDateObjective _dueDate = new();
    private readonly UtilizationObjective _utilization = new();
    private readonly ChangeoverObjective _changeover = new();

    public string Name => "balanced";

    /// <param name="dueDateWeight">交期权重 (默认 0.4)</param>
    /// <param name="utilizationWeight">利用率权重 (默认 0.3)</param>
    /// <param name="changeoverWeight">换线权重 (默认 0.3)</param>
    public BalancedObjective(
        double dueDateWeight = 0.4,
        double utilizationWeight = 0.3,
        double changeoverWeight = 0.3)
    {
        DueDateWeight = dueDateWeight;
        UtilizationWeight = utilizationWeight;
        ChangeoverWeight = changeoverWeight;
    }

    public double DueDateWeight { get; }
    public double UtilizationWeight { get; }
    public double ChangeoverWeight { get; }

    public double Evaluate(List<ScheduleAssignment> assignments, ScheduleRequest request, SchedulingContextSnapshot context)
    {
        var dueDateScore = _dueDate.Evaluate(assignments, request, context);
        var utilizationScore = _utilization.Evaluate(assignments, request, context);
        var changeoverScore = _changeover.Evaluate(assignments, request, context);

        return DueDateWeight * dueDateScore
             + UtilizationWeight * utilizationScore
             + ChangeoverWeight * changeoverScore;
    }
}
