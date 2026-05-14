using MES.Domain.Primitives;

namespace MES.Domain.Events;

public sealed record OperationExecutionStarted(
    string WorkOrderNumber,
    string OperationCode,
    string? EquipmentId,
    DateTime StartedAt) : IDomainEvent
{
    public DateTime OccurredOn { get; init; } = DateTime.UtcNow;
}

public sealed record OperationReported(
    string WorkOrderNumber,
    string OperationCode,
    int Quantity,
    DateTime ReportTime,
    string? OperatorId) : IDomainEvent
{
    public DateTime OccurredOn { get; init; } = DateTime.UtcNow;
}

public sealed record OperationPaused(
    string WorkOrderNumber,
    string OperationCode,
    string Reason) : IDomainEvent
{
    public DateTime OccurredOn { get; init; } = DateTime.UtcNow;
}

public sealed record OperationResumed(
    string WorkOrderNumber,
    string OperationCode) : IDomainEvent
{
    public DateTime OccurredOn { get; init; } = DateTime.UtcNow;
}

public sealed record OperationFailed(
    string WorkOrderNumber,
    string OperationCode,
    string Reason,
    DateTime FailedAt) : IDomainEvent
{
    public DateTime OccurredOn { get; init; } = DateTime.UtcNow;
}
