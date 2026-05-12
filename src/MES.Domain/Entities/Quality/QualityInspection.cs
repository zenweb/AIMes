using MES.Domain.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace MES.Domain.Entities.Quality;

/// <summary>
/// 质量检验记录
/// </summary>
public class QualityInspection
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string WorkOrderId { get; set; } = string.Empty;
    public string ProductCode { get; set; } = string.Empty;
    public string ProcessName { get; set; } = string.Empty;
    public string InspectionPoint { get; set; } = string.Empty;
    public int InspectionQuantity { get; set; }
    public int QualifiedQuantity { get; set; }
    public int DefectQuantity { get; set; }
    public InspectionResult Result { get; set; }
    public List<DefectRecord> Defects { get; set; } = new();
    public string InspectorId { get; set; } = string.Empty;
    public DateTime InspectedAt { get; set; } = DateTime.UtcNow;

    [NotMapped]
    public Dictionary<string, object> MeasurementData { get; set; } = new();
}

/// <summary>
/// 缺陷记录
/// </summary>
public class DefectRecord
{
    public string DefectType { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public double AreaRatio { get; set; }
    public string Severity { get; set; } = string.Empty;
    public string CorrectiveAction { get; set; } = string.Empty;
}