using System.ComponentModel.DataAnnotations.Schema;
using MES.Domain.Enums;

namespace MES.Domain.Entities.Quality;

public class QualityInspection
{
    internal QualityInspection() { }

    public string Id { get; private set; } = Guid.NewGuid().ToString();
    public string WorkOrderId { get; private set; } = string.Empty;
    public string ProductCode { get; private set; } = string.Empty;
    public string ProcessName { get; private set; } = string.Empty;
    public string InspectionPoint { get; private set; } = string.Empty;
    public int InspectionQuantity { get; private set; }
    public int QualifiedQuantity { get; private set; }
    public int DefectQuantity { get; private set; }
    public InspectionResult Result { get; private set; }
    private readonly List<DefectRecord> _defects = new();
    public IReadOnlyList<DefectRecord> Defects => _defects.AsReadOnly();
    public string InspectorId { get; private set; } = string.Empty;
    public DateTime InspectedAt { get; private set; } = DateTime.UtcNow;

    [NotMapped]
    public Dictionary<string, object> MeasurementData { get; private set; } = new();

    public static QualityInspection Create(
        string workOrderId, string productCode, string processName,
        string inspectionPoint, int inspectionQuantity,
        int qualifiedQuantity, int defectQuantity, string inspectorId,
        InspectionResult? result = null, string? id = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(workOrderId);
        ArgumentException.ThrowIfNullOrWhiteSpace(productCode);
        ArgumentOutOfRangeException.ThrowIfNegative(inspectionQuantity);

        if (qualifiedQuantity + defectQuantity != inspectionQuantity)
            throw new ArgumentException("合格数量与不良数量之和必须等于检验数量");

        return new QualityInspection
        {
            Id = id ?? Guid.NewGuid().ToString(),
            WorkOrderId = workOrderId,
            ProductCode = productCode,
            ProcessName = processName,
            InspectionPoint = inspectionPoint,
            InspectionQuantity = inspectionQuantity,
            QualifiedQuantity = qualifiedQuantity,
            DefectQuantity = defectQuantity,
            Result = result ?? (defectQuantity == 0 ? InspectionResult.Pass : InspectionResult.Fail),
            InspectorId = inspectorId,
            InspectedAt = DateTime.UtcNow,
        };
    }

    public bool CanApprove => Result == InspectionResult.Pass;
    public bool CanReject => Result == InspectionResult.Fail || Result == InspectionResult.Rework;

    public void Approve()
    {
        if (!CanApprove)
            throw new InvalidOperationException($"当前结果 {Result} 不允许通过");
        Result = InspectionResult.Pass;
    }

    public void Reject(string defectType, int quantity, string severity)
    {
        if (!CanReject)
            throw new InvalidOperationException($"当前结果 {Result} 不允许拒收");

        Result = InspectionResult.Fail;
        _defects.Add(DefectRecord.Create(defectType, quantity, 0, severity));
    }

    public void RecordDefect(string defectType, int quantity, double areaRatio, string severity, string? correctiveAction = null)
    {
        if (quantity <= 0)
            throw new ArgumentOutOfRangeException(nameof(quantity), "缺陷数量必须为正数");

        DefectQuantity += quantity;
        _defects.Add(DefectRecord.Create(defectType, quantity, areaRatio, severity, correctiveAction));

        QualifiedQuantity = InspectionQuantity - DefectQuantity;
        Result = InspectionResult.Fail;
    }
}

public class DefectRecord
{
    internal DefectRecord() { }

    public string DefectType { get; private set; } = string.Empty;
    public int Quantity { get; private set; }
    public double AreaRatio { get; private set; }
    public string Severity { get; private set; } = string.Empty;
    public string CorrectiveAction { get; private set; } = string.Empty;

    public static DefectRecord Create(string defectType, int quantity,
        double areaRatio, string severity, string? correctiveAction = null)
    {
        if (string.IsNullOrWhiteSpace(defectType))
            throw new ArgumentException("缺陷类型不能为空", nameof(defectType));
        if (quantity <= 0)
            throw new ArgumentOutOfRangeException(nameof(quantity), "缺陷数量必须为正数");

        return new DefectRecord
        {
            DefectType = defectType,
            Quantity = quantity,
            AreaRatio = areaRatio,
            Severity = severity,
            CorrectiveAction = correctiveAction ?? string.Empty,
        };
    }
}
