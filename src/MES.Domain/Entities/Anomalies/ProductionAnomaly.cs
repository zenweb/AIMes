using MES.Domain.Events;
using MES.Domain.Primitives;
using MES.Domain.ValueObjects;

namespace MES.Domain.Entities.Anomalies;

public class ProductionAnomaly : AggregateRoot
{
    public WorkOrderNumber WorkOrderNumber { get; private set; } = new(string.Empty);
    public OperationCode OperationCode { get; private set; } = new(string.Empty);
    public string? EquipmentId { get; private set; }
    public string AnomalyType { get; private set; } = string.Empty;
    public AnomalySeverity Severity { get; private set; } = AnomalySeverity.Low;
    public string Title { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public DateTime DetectedAt { get; private set; } = DateTime.UtcNow;
    public string? DetectedBy { get; private set; }
    public AnomalyStatus Status { get; private set; } = AnomalyStatus.Open;
    public string? RootCause { get; private set; }
    public string? Resolution { get; private set; }
    public DateTime? ResolvedAt { get; private set; }
    public string? ResolvedBy { get; private set; }
    public List<AnomalyResponse> Responses { get; private set; } = new();

    private ProductionAnomaly() { }

    public ProductionAnomaly(
        WorkOrderNumber workOrderNumber,
        OperationCode operationCode,
        string anomalyType,
        AnomalySeverity severity,
        string title,
        string description,
        string? equipmentId = null,
        string? detectedBy = null)
    {
        WorkOrderNumber = workOrderNumber;
        OperationCode = operationCode;
        AnomalyType = anomalyType;
        Severity = severity;
        Title = title;
        Description = description;
        EquipmentId = equipmentId;
        DetectedBy = detectedBy;
        AddDomainEvent(new AnomalyCreated(Id, workOrderNumber.Value, operationCode.Value, severity, title));
    }

    public void AddResponse(AnomalyResponse response)
    {
        Responses.Add(response);
    }

    public void Resolve(string rootCause, string resolution, string resolvedBy)
    {
        RootCause = rootCause;
        Resolution = resolution;
        ResolvedBy = resolvedBy;
        ResolvedAt = DateTime.UtcNow;
        Status = AnomalyStatus.Resolved;
        AddDomainEvent(new AnomalyResolved(Id, WorkOrderNumber.Value, OperationCode.Value, resolvedBy));
    }
}
