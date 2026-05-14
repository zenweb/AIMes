namespace MES.AI.Core.Scheduling;

using MES.AI.Core.Models;
using MES.Domain.Entities.Scheduling;

/// <summary>排产方案目标函数接口 — 评估调度方案的质量，分数越低越好</summary>
public interface IObjectiveFunction
{
    /// <summary>目标函数名称</summary>
    string Name { get; }

    /// <summary>评估排产方案并返回代价分数（最小值=最优）</summary>
    double Evaluate(List<ScheduleAssignment> assignments, ScheduleRequest request, SchedulingContextSnapshot context);
}
