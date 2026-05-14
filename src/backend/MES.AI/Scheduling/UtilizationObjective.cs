namespace MES.AI.Core.Scheduling;

using MES.AI.Core.Models;
using MES.Domain.Entities.Scheduling;

/// <summary>设备利用率目标函数 — 最大化设备利用率（返回负值便于最小化统一）</summary>
public sealed class UtilizationObjective : IObjectiveFunction
{
    public string Name => "utilization";

    public double Evaluate(List<ScheduleAssignment> assignments, ScheduleRequest request, SchedulingContextSnapshot context)
    {
        if (assignments.Count == 0 || context.EquipmentCapacities.Count == 0)
            return 0;

        var minStart = assignments.Min(a => a.StartTime);
        var maxEnd = assignments.Max(a => a.EndTime);
        var windowHours = Math.Max((maxEnd - minStart).TotalHours, 1);
        var activeEquipmentCount = context.EquipmentCapacities.Count(e => e.AvailableCapacity > 0);

        if (activeEquipmentCount == 0) return 0;

        var totalAvailableHours = activeEquipmentCount * windowHours;
        var totalUsedHours = assignments.Sum(a => (a.EndTime - a.StartTime).TotalHours);

        var utilization = totalUsedHours / totalAvailableHours;

        return -utilization;
    }
}
