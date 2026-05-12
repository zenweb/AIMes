namespace MES.AI.Core.Scheduling;

using MES.AI.Core.Models;
using MES.Domain.Entities.Scheduling;

/// <summary>换线时间最小化目标函数 — 最小化总换线时间</summary>
public sealed class ChangeoverObjective : IObjectiveFunction
{
    public string Name => "changeover";

    public double Evaluate(List<ScheduleAssignment> assignments, ScheduleRequest request, SchedulingContextSnapshot context)
    {
        if (assignments.Count == 0) return 0;

        var totalChangeover = assignments.Sum(a => a.SetupMinutes);
        var changeoverRatio = totalChangeover / (assignments.Count * 120.0);

        return changeoverRatio * 100;
    }
}
