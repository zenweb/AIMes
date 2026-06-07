namespace MES.AI.Core.Scheduling.Evaluation;

using MES.AI.Core.Models;

public static class OtdCalculator
{
    public static OtdMetrics Calculate(IEnumerable<ScheduleAssignment> assignments, IReadOnlyDictionary<string, DateTime> deadlines)
    {
        var assignmentList = assignments.ToList();
        if (assignmentList.Count == 0)
        {
            return new OtdMetrics(0, 0, 0, 0);
        }

        var onTime = assignmentList.Count(a =>
            deadlines.TryGetValue(a.WorkOrderId, out var dueDate) && a.EndTime <= dueDate);
        var late = assignmentList.Count - onTime;
        var rate = Math.Round(onTime * 100.0 / assignmentList.Count, 2);
        var averageDelayHours = assignmentList
            .Select(a => deadlines.TryGetValue(a.WorkOrderId, out var dueDate)
                ? Math.Max(0, (a.EndTime - dueDate).TotalHours)
                : 0)
            .DefaultIfEmpty(0)
            .Average();

        return new OtdMetrics(rate, onTime, late, Math.Round(averageDelayHours, 2));
    }
}

public sealed record OtdMetrics(double Rate, int OnTimeCount, int LateCount, double AverageDelayHours);
