using MES.Domain.Enums;
using MES.Domain.Primitives;
using MES.Domain.ValueObjects;

namespace MES.Domain.Entities.Production;

public class OperationReport : AggregateRoot
{
    public string WorkOrderId { get; private set; } = string.Empty;
    public string OperationId { get; private set; } = string.Empty;
    public int ReportedQuantity { get; private set; }
    public int DefectQuantity { get; private set; }
    public ParameterSnapshot ParameterSnapshot { get; private set; } = new(new Dictionary<string, string>());
    public List<OperationReportMaterialConsumed> MaterialConsumed { get; private set; } = new();
    public InspectionResult InspectionResult { get; private set; }
    public string? ReportedBy { get; private set; }
    public DateTime ReportedAt { get; private set; } = DateTime.UtcNow;

    private OperationReport() { }

    public OperationReport(
        string workOrderId,
        string operationId,
        int reportedQuantity,
        int defectQuantity,
        ParameterSnapshot parameterSnapshot,
        IEnumerable<OperationReportMaterialConsumed> materialConsumed,
        InspectionResult inspectionResult,
        string? reportedBy = null)
    {
        WorkOrderId = workOrderId;
        OperationId = operationId;
        ReportedQuantity = reportedQuantity;
        DefectQuantity = defectQuantity;
        ParameterSnapshot = parameterSnapshot;
        MaterialConsumed = materialConsumed.ToList();
        InspectionResult = inspectionResult;
        ReportedBy = reportedBy;
        AddDomainEvent(new OperationReported(Id, WorkOrderId, OperationId, ReportedQuantity, DefectQuantity));
    }
}

public class OperationReportMaterialConsumed
{
    public string MaterialCode { get; private set; } = string.Empty;
    public decimal Quantity { get; private set; }
    public string Unit { get; private set; } = string.Empty;
    public string? BatchNumber { get; private set; }

    private OperationReportMaterialConsumed() { }

    public OperationReportMaterialConsumed(string materialCode, decimal quantity, string unit, string? batchNumber = null)
    {
        MaterialCode = materialCode;
        Quantity = quantity;
        Unit = unit;
        BatchNumber = batchNumber;
    }
}

public sealed record OperationReported(string OperationReportId, string WorkOrderId, string OperationId, int ReportedQuantity, int DefectQuantity) : IDomainEvent
{
    public DateTime OccurredOn { get; init; } = DateTime.UtcNow;
}
