using MES.Domain.Enums;
using MES.Domain.Exceptions;

namespace MES.Domain.Entities.Equipment;

public class Equipment
{
    // EF Core 需要的构造（internal 供测试项目直接实例化）
    internal Equipment() { }

    public string Id { get; private set; } = Guid.NewGuid().ToString();
    public string EquipmentCode { get; private set; } = string.Empty;
    public string EquipmentName { get; private set; } = string.Empty;
    public string EquipmentType { get; private set; } = string.Empty;
    public string WorkshopId { get; private set; } = string.Empty;
    public string WorkshopName { get; private set; } = string.Empty;
    public EquipmentStatus Status { get; private set; } = EquipmentStatus.Available;
    public double Capacity { get; private set; }
    public double UtilizationRate { get; private set; }
    public DateTime? LastMaintenanceDate { get; private set; }
    public DateTime? NextMaintenanceDate { get; private set; }
    public string CurrentWorkOrderId { get; private set; } = string.Empty;
    public Dictionary<string, double> Parameters { get; private set; } = new();
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; private set; }

    public static Equipment Create(
        string equipmentCode, string equipmentName, string equipmentType,
        string workshopId, string workshopName, double capacity)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(equipmentCode);
        ArgumentException.ThrowIfNullOrWhiteSpace(equipmentName);
        ArgumentException.ThrowIfNullOrWhiteSpace(equipmentType);
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(capacity);

        return new Equipment
        {
            EquipmentCode = equipmentCode,
            EquipmentName = equipmentName,
            EquipmentType = equipmentType,
            WorkshopId = workshopId,
            WorkshopName = workshopName,
            Capacity = capacity,
            Status = EquipmentStatus.Available,
            CreatedAt = DateTime.UtcNow,
        };
    }

    public bool CanStartWork => Status == EquipmentStatus.Available || Status == EquipmentStatus.Idle;
    public bool CanCompleteWork => Status == EquipmentStatus.Running;

    public void StartWork(string workOrderId)
    {
        if (!CanStartWork)
            throw new DomainRuleViolationException($"设备当前状态 {Status} 无法开始工作");

        ArgumentException.ThrowIfNullOrWhiteSpace(workOrderId);

        CurrentWorkOrderId = workOrderId;
        Status = EquipmentStatus.Running;
        UpdatedAt = DateTime.UtcNow;
    }

    public void CompleteWork()
    {
        if (!CanCompleteWork)
            throw new DomainRuleViolationException($"设备当前状态 {Status} 无法完成工作");

        CurrentWorkOrderId = string.Empty;
        Status = EquipmentStatus.Available;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetIdle()
    {
        if (Status != EquipmentStatus.Available)
            throw new DomainRuleViolationException("只有可用状态的设备可以设为空闲");

        Status = EquipmentStatus.Idle;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetFault()
    {
        if (Status != EquipmentStatus.Running && Status != EquipmentStatus.Idle)
            throw new DomainRuleViolationException("只有运行中或空闲的设备可以报告故障");

        Status = EquipmentStatus.Fault;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetMaintenance()
    {
        if (Status == EquipmentStatus.Fault || Status == EquipmentStatus.Offline)
            throw new DomainRuleViolationException("故障或离线设备无法设置为维护状态");

        Status = EquipmentStatus.Maintenance;
        UpdatedAt = DateTime.UtcNow;
    }

    public void CompleteMaintenance()
    {
        if (Status != EquipmentStatus.Maintenance)
            throw new DomainRuleViolationException("只有维护中的设备可以完成维护");

        LastMaintenanceDate = DateTime.UtcNow;
        Status = EquipmentStatus.Available;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetOffline()
    {
        if (Status != EquipmentStatus.Available && Status != EquipmentStatus.Idle)
            throw new DomainRuleViolationException("只有可用或空闲的设备可以设为离线");

        Status = EquipmentStatus.Offline;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetOnline()
    {
        if (Status != EquipmentStatus.Offline)
            throw new DomainRuleViolationException("只有离线的设备可以设为在线");

        Status = EquipmentStatus.Available;
        UpdatedAt = DateTime.UtcNow;
    }

    public void TransitionTo(EquipmentStatus target)
    {
        switch (target)
        {
            case EquipmentStatus.Running: StartWork(CurrentWorkOrderId); return;
            case EquipmentStatus.Idle: SetIdle(); return;
            case EquipmentStatus.Maintenance: SetMaintenance(); return;
            case EquipmentStatus.Fault: SetFault(); return;
            case EquipmentStatus.Offline: SetOffline(); return;
            case EquipmentStatus.Available: TransitionToAvailable(); return;
            default: throw new DomainRuleViolationException($"不支持转换到状态 {target}");
        }
    }

    private void TransitionToAvailable()
    {
        if (Status == EquipmentStatus.Offline) { SetOnline(); return; }
        if (Status == EquipmentStatus.Maintenance) { CompleteMaintenance(); return; }
        if (Status == EquipmentStatus.Running) { CompleteWork(); }
    }

    public void ScheduleMaintenance(DateTime maintenanceDate)
    {
        NextMaintenanceDate = maintenanceDate;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateParameters(Dictionary<string, double> parameters)
    {
        Parameters = parameters ?? throw new ArgumentNullException(nameof(parameters));
        UpdatedAt = DateTime.UtcNow;
    }
}
