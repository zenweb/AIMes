using MES.Domain.Enums;

namespace MES.Domain.Entities.Equipment;

/// <summary>
/// 设备维护记录
/// </summary>
public class MaintenanceRecord
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string EquipmentId { get; set; } = string.Empty;
    public string MaintenanceType { get; set; } = string.Empty; // Preventive, Corrective, Predictive
    public string Description { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public string PerformedBy { get; set; } = string.Empty;
    public List<string> SparePartsUsed { get; set; } = new();
    public string Result { get; set; } = string.Empty;
    public decimal Cost { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}