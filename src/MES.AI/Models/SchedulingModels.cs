namespace MES.AI.Models;

using MES.Domain.Entities.Scheduling;
using MES.Domain.ValueObjects;

/// <summary>
/// 排产请求
/// </summary>
public class ScheduleRequest
{
    public string WorkshopId { get; set; } = string.Empty;
    public List<WorkOrderInfo> Orders { get; set; } = new();
    public List<EquipmentCapacity> Equipment { get; set; } = new();
    public Dictionary<string, int> Materials { get; set; } = new();
    public Dictionary<string, DateTime> Deadlines { get; set; } = new();
    public string? HistoricalData { get; set; }
    /// <summary>优化目标：due_date / utilization / changeover / balanced</summary>
    public string? OptimizationObjective { get; set; }
    /// <summary>锁定工单ID列表（锁定周期内不可调整）</summary>
    public List<string> LockedOrderIds { get; set; } = new();
}

public class WorkOrderInfo
{
    public string Id { get; set; } = string.Empty;
    public string OrderNumber { get; set; } = string.Empty;
    public string ProductCode { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public DateTime DueDate { get; set; }
    public int Priority { get; set; }
    public string RouteCode { get; set; } = string.Empty;
}

public class EquipmentCapacity
{
    public string Id { get; set; } = string.Empty;
    public string EquipmentCode { get; set; } = string.Empty;
    public double Capacity { get; set; }
    public string Type { get; set; } = string.Empty;
}

/// <summary>
/// 排产结果
/// </summary>
public class SchedulingResult
{
    public List<ScheduleAssignment> Assignments { get; set; } = new();
    public DateTime EstimatedCompletion { get; set; }
    public double UtilizationRate { get; set; }
    public double OnTimeDeliveryRate { get; set; }
    public double TotalChangeoverMinutes { get; set; }
    public int GroupCount { get; set; }
    public string? BottleneckInfo { get; set; }
    public string OptimizationNotes { get; set; } = string.Empty;
    public DataCompletenessScore? DataCompletenessScore { get; set; }
    public AiDecisionTrace AiDecisionTrace { get; set; } = new();
}

public class ScheduleAssignment
{
    public string WorkOrderId { get; set; } = string.Empty;
    public string EquipmentId { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public List<string> Dependencies { get; set; } = new();
    /// <summary>工艺分组ID：同组订单连续生产以降低切换次数</summary>
    public string? GroupId { get; set; }
    /// <summary>前置换线时间（分钟）</summary>
    public double SetupMinutes { get; set; }
    /// <summary>是否分配在瓶颈工序上</summary>
    public bool IsOnBottleneck { get; set; }
}
