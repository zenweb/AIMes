namespace MES.AI.Core.Scheduling;

using MES.AI.Core.Models;
using MES.Domain.Entities.Scheduling;

/// <summary>交期优先目标函数 — 最小化总延迟时间和拖期工单数</summary>
public sealed class DueDateObjective : IObjectiveFunction
{
    public string Name => "due_date";

    public double Evaluate(List<ScheduleAssignment> assignments, ScheduleRequest request, SchedulingContextSnapshot context)
    {
        if (assignments.Count == 0) return 0;

        var deadlines = request.Deadlines;
        var orders = request.Orders.ToDictionary(o => o.Id, o => o);
        var totalTardiness = 0.0;
        var lateCount = 0;

        foreach (var assignment in assignments)
        {
            if (!deadlines.TryGetValue(assignment.WorkOrderId, out var deadline))
                continue;

            var tardiness = (assignment.EndTime - deadline).TotalMinutes;
            if (tardiness > 0)
            {
                totalTardiness += tardiness;
                lateCount++;
            }
        }

        var avgTardiness = lateCount > 0 ? totalTardiness / lateCount : 0;
        var lateRatio = (double)lateCount / assignments.Count;

        return 0.6 * avgTardiness + 0.4 * lateRatio * 10000;
    }
}
