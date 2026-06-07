using MES.Domain.Exceptions;
using MES.Domain.Primitives;
using DomainEvents = MES.Domain.Events;

namespace MES.Domain.Entities.Production;

public enum OperationExecutionStatus
{
    Pending = 0,
    Running = 1,
    Paused = 2,
    Completed = 3,
    Failed = 4
}

public class OperationExecution : AggregateRoot
{
    public string WorkOrderId { get; private set; } = string.Empty;
    public string OperationCode { get; private set; } = string.Empty;
    public string OperationName { get; private set; } = string.Empty;
    public OperationExecutionStatus Status { get; private set; } = OperationExecutionStatus.Pending;
    public string? OperatorId { get; private set; }
    public string? StationId { get; private set; }
    public string? EquipmentId { get; private set; }
    public string? SuspendReason { get; private set; }
    public string? ExceptionReason { get; private set; }
    public int CompletedQuantity { get; private set; }
    public DateTime? StartedAt { get; private set; }
    public DateTime? PausedAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public DateTime? FailedAt { get; private set; }
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; private set; }

    private OperationExecution() { }

    public OperationExecution(string workOrderId, string operationCode, string operationName)
    {
        WorkOrderId = workOrderId;
        OperationCode = operationCode;
        OperationName = operationName;
    }

    public void BindOperatorAndStation(string operatorId, string stationId, string? equipmentId = null)
    {
        OperatorId = operatorId;
        StationId = stationId;
        EquipmentId = equipmentId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Start()
    {
        if (Status != OperationExecutionStatus.Pending && Status != OperationExecutionStatus.Paused)
            throw new DomainRuleViolationException("Only pending or paused operations can be started.");

        var wasPaused = Status == OperationExecutionStatus.Paused;
        Status = OperationExecutionStatus.Running;
        SuspendReason = null;
        ExceptionReason = null;
        StartedAt ??= DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
        AddDomainEvent(new OperationStarted(Id, WorkOrderId, OperationCode, OperatorId, StationId));
        AddDomainEvent(wasPaused
            ? new DomainEvents.OperationResumed(WorkOrderId, OperationCode)
            : new DomainEvents.OperationExecutionStarted(WorkOrderId, OperationCode, EquipmentId, StartedAt.Value));
    }

    public void Pause(string suspendReason)
    {
        if (Status != OperationExecutionStatus.Running)
            throw new DomainRuleViolationException("Only running operations can be paused.");

        Status = OperationExecutionStatus.Paused;
        SuspendReason = suspendReason;
        PausedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
        AddDomainEvent(new OperationPaused(Id, WorkOrderId, OperationCode, suspendReason));
        AddDomainEvent(new DomainEvents.OperationPaused(WorkOrderId, OperationCode, suspendReason));
    }

    public void Complete(int quantity)
    {
        if (Status != OperationExecutionStatus.Running)
            throw new DomainRuleViolationException("Only running operations can be completed.");

        Status = OperationExecutionStatus.Completed;
        CompletedQuantity = quantity;
        CompletedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
        AddDomainEvent(new OperationCompleted(Id, WorkOrderId, OperationCode, quantity));
        AddDomainEvent(new DomainEvents.OperationReported(WorkOrderId, OperationCode, quantity, CompletedAt.Value, OperatorId));
    }

    public void ReportException(string reason)
    {
        if (Status != OperationExecutionStatus.Running && Status != OperationExecutionStatus.Paused)
            throw new DomainRuleViolationException("Only active operations can report exceptions.");

        Status = OperationExecutionStatus.Failed;
        ExceptionReason = reason;
        FailedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
        AddDomainEvent(new DomainEvents.OperationFailed(WorkOrderId, OperationCode, reason, FailedAt.Value));
    }
}

public sealed record OperationStarted(string OperationExecutionId, string WorkOrderId, string OperationCode, string? OperatorId, string? StationId) : IDomainEvent
{
    public DateTime OccurredOn { get; init; } = DateTime.UtcNow;
}

public sealed record OperationCompleted(string OperationExecutionId, string WorkOrderId, string OperationCode, int Quantity) : IDomainEvent
{
    public DateTime OccurredOn { get; init; } = DateTime.UtcNow;
}

public sealed record OperationPaused(string OperationExecutionId, string WorkOrderId, string OperationCode, string SuspendReason) : IDomainEvent
{
    public DateTime OccurredOn { get; init; } = DateTime.UtcNow;
}
