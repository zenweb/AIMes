using MES.Domain.Enums;

namespace MES.Domain.Entities.Scheduling;

public class SchedulePlan
{
    internal SchedulePlan() { }

    public string Id { get; private set; } = Guid.NewGuid().ToString();
    public string PlanName { get; private set; } = string.Empty;
    public SchedulePlanStatus Status { get; private set; } = SchedulePlanStatus.Draft;
    public DateTime PlanStartDate { get; private set; }
    public DateTime PlanEndDate { get; private set; }
    private readonly List<ScheduleItem> _items = new();
    public IReadOnlyList<ScheduleItem> Items => _items.AsReadOnly();
    public double OverallUtilizationRate { get; private set; }
    public double OnTimeDeliveryRate { get; private set; }
    public string OptimizationNotes { get; private set; } = string.Empty;
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; private set; }

    public static SchedulePlan Create(string name, DateTime start, DateTime end)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("计划名称不能为空", nameof(name));
        if (start >= end)
            throw new ArgumentException("开始日期必须早于结束日期");

        return new SchedulePlan
        {
            PlanName = name,
            PlanStartDate = start,
            PlanEndDate = end,
            Status = SchedulePlanStatus.Draft,
            CreatedAt = DateTime.UtcNow,
        };
    }

    public bool IsEditable => Status == SchedulePlanStatus.Draft || Status == SchedulePlanStatus.Active;

    public void Lock()
    {
        Status = SchedulePlanStatus.Locked;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Unlock()
    {
        if (Status != SchedulePlanStatus.Locked)
            throw new InvalidOperationException($"当前状态 {Status} 不允许解锁");
        Status = SchedulePlanStatus.Active;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Adopt()
    {
        if (Status != SchedulePlanStatus.Locked && Status != SchedulePlanStatus.Active)
            throw new InvalidOperationException($"当前状态 {Status} 不允许采纳");
        Status = SchedulePlanStatus.Adopted;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateMetrics(double utilizationRate, double deliveryRate, string? notes = null)
    {
        OverallUtilizationRate = utilizationRate;
        OnTimeDeliveryRate = deliveryRate;
        if (notes != null) OptimizationNotes = notes;
        UpdatedAt = DateTime.UtcNow;
    }

    public void AddItem(ScheduleItem item)
    {
        ArgumentNullException.ThrowIfNull(item);
        _items.Add(item);
        UpdatedAt = DateTime.UtcNow;
    }

    public void AddItems(IEnumerable<ScheduleItem> items)
    {
        foreach (var item in items)
        {
            ArgumentNullException.ThrowIfNull(item);
            _items.Add(item);
        }
        UpdatedAt = DateTime.UtcNow;
    }

    public void RemoveItem(string itemId)
    {
        var item = _items.FirstOrDefault(i => i.Id == itemId);
        if (item == null)
            throw new InvalidOperationException($"排产项 {itemId} 不存在");
        _items.Remove(item);
        UpdatedAt = DateTime.UtcNow;
    }
}

public class ScheduleItem
{
    internal ScheduleItem() { }

    public string Id { get; private set; } = Guid.NewGuid().ToString();
    public string WorkOrderId { get; private set; } = string.Empty;
    public string EquipmentId { get; private set; } = string.Empty;
    public DateTime PlannedStartTime { get; private set; }
    public DateTime PlannedEndTime { get; private set; }
    public int Sequence { get; private set; }
    public string SetupTime { get; private set; } = string.Empty;
    public List<string> DependentItems { get; private set; } = new();

    public static ScheduleItem Create(string workOrderId, string equipmentId,
        DateTime plannedStartTime, DateTime plannedEndTime, int sequence,
        string setupTime = "", List<string>? dependentItems = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(workOrderId);
        ArgumentException.ThrowIfNullOrWhiteSpace(equipmentId);
        if (plannedStartTime >= plannedEndTime)
            throw new ArgumentException("开始时间必须早于结束时间");

        return new ScheduleItem
        {
            WorkOrderId = workOrderId,
            EquipmentId = equipmentId,
            PlannedStartTime = plannedStartTime,
            PlannedEndTime = plannedEndTime,
            Sequence = sequence,
            SetupTime = setupTime,
            DependentItems = dependentItems ?? new(),
        };
    }

    public void Reschedule(DateTime newStart, DateTime newEnd)
    {
        if (newStart >= newEnd)
            throw new ArgumentException("开始时间必须早于结束时间");
        PlannedStartTime = newStart;
        PlannedEndTime = newEnd;
    }

    public void ChangeEquipment(string equipmentId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(equipmentId);
        EquipmentId = equipmentId;
    }

    public void UpdateDependencies(List<string> dependentItems)
    {
        DependentItems = dependentItems ?? new();
    }
}
