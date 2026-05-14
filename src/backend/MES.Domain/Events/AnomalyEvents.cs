using MES.Domain.Entities.Anomalies;
using MES.Domain.Primitives;

namespace MES.Domain.Events;

public sealed record AnomalyCreated(
    string AnomalyId,
    string WorkOrderNumber,
    string OperationCode,
    AnomalySeverity Severity,
    string Title) : IDomainEvent
{
    public DateTime OccurredOn { get; init; } = DateTime.UtcNow;
}

public sealed record AnomalyResolved(
    string AnomalyId,
    string WorkOrderNumber,
    string OperationCode,
    string ResolvedBy) : IDomainEvent
{
    public DateTime OccurredOn { get; init; } = DateTime.UtcNow;
}
