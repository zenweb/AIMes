using MES.Domain.Primitives;

namespace MES.Domain.Events;

public sealed record SchedulePlanCreated(
    string PlanId,
    string PlanName,
    DateTime CreatedAt) : IDomainEvent
{
    public DateTime OccurredOn { get; init; } = DateTime.UtcNow;
}
