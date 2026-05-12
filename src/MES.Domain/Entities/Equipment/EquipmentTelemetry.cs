using System.ComponentModel.DataAnnotations.Schema;

namespace MES.Domain.Entities.Equipment;

/// <summary>
/// 设备遥测数据
/// </summary>
public class EquipmentTelemetry
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string EquipmentId { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    [NotMapped]
    public Dictionary<string, double> Parameters { get; set; } = new();

    public string ErrorCode { get; set; } = string.Empty;
    public string ErrorMessage { get; set; } = string.Empty;
}