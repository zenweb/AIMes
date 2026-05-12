namespace MES.Domain.Entities.Scheduling;

/// <summary>
/// 排产计划
/// </summary>
public class SchedulePlan
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string PlanName { get; set; } = string.Empty;
    public DateTime PlanStartDate { get; set; }
    public DateTime PlanEndDate { get; set; }
    public List<ScheduleItem> Items { get; set; } = new();
    public double OverallUtilizationRate { get; set; }
    public double OnTimeDeliveryRate { get; set; }
    public string OptimizationNotes { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// 排产明细
/// </summary>
public class ScheduleItem
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string WorkOrderId { get; set; } = string.Empty;
    public string EquipmentId { get; set; } = string.Empty;
    public DateTime PlannedStartTime { get; set; }
    public DateTime PlannedEndTime { get; set; }
    public int Sequence { get; set; }
    public string SetupTime { get; set; } = string.Empty;
    public List<string> DependentItems { get; set; } = new();
}