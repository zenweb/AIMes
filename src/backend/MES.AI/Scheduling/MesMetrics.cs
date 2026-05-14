namespace MES.AI.Core.Scheduling;

using System.Diagnostics;
using System.Diagnostics.Metrics;

/// <summary>排程引擎可观测性指标</summary>
public static class MesMetrics
{
    private const string MeterName = "MES.Scheduling";
    private const string ActivitySourceName = "MES.Scheduling";

    public static readonly Meter Meter = new(MeterName, "1.0.0");
    public static readonly ActivitySource ActivitySource = new(ActivitySourceName, "1.0.0");

    /// <summary>排程耗时（秒）</summary>
    public static readonly Histogram<double> SchedulingDuration = Meter.CreateHistogram<double>(
        "mes.scheduling.duration",
        unit: "s",
        description: "排程引擎单次执行耗时");

    /// <summary>排程工单数</summary>
    public static readonly Histogram<int> SchedulingOrderCount = Meter.CreateHistogram<int>(
        "mes.scheduling.orders",
        unit: "{orders}",
        description: "单次排程处理的工单数");

    /// <summary>准时交付率</summary>
    public static readonly Histogram<double> SchedulingOnTimeDelivery = Meter.CreateHistogram<double>(
        "mes.scheduling.otd",
        unit: "%",
        description: "排程结果的准时交付率");

    /// <summary>设备利用率</summary>
    public static readonly Histogram<double> SchedulingUtilization = Meter.CreateHistogram<double>(
        "mes.scheduling.utilization",
        unit: "%",
        description: "排程结果的设备利用率");

    /// <summary>冲突检测计数</summary>
    public static readonly Counter<int> ConflictCount = Meter.CreateCounter<int>(
        "mes.scheduling.conflicts",
        unit: "{conflicts}",
        description: "检测到的排程冲突数");
}
