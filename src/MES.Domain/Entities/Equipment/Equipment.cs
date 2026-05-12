using MES.Domain.Enums;

namespace MES.Domain.Entities.Equipment;

/// <summary>
/// 设备
/// </summary>
public class Equipment
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string EquipmentCode { get; set; } = string.Empty;
    public string EquipmentName { get; set; } = string.Empty;
    public string EquipmentType { get; set; } = string.Empty;
    public string WorkshopId { get; set; } = string.Empty;
    public string WorkshopName { get; set; } = string.Empty;
    public EquipmentStatus Status { get; set; } = EquipmentStatus.Available;
    public double Capacity { get; set; }
    public double UtilizationRate { get; set; }
    public DateTime? LastMaintenanceDate { get; set; }
    public DateTime? NextMaintenanceDate { get; set; }
    public string CurrentWorkOrderId { get; set; } = string.Empty;
    public Dictionary<string, double> Parameters { get; set; } = new();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}