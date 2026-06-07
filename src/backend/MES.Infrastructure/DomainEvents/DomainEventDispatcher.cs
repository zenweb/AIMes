using MediatR;
using MES.Domain.Primitives;

namespace MES.Infrastructure.DomainEvents;

/// <summary>
/// 进程内领域事件分发拦截器。
/// 在 DbContext SaveChanges 后，从聚合根取出领域事件并通过 MediatR 分发。
/// </summary>
public static class DomainEventDispatcher
{
    /// <summary>
    /// 分发聚合根中积累的领域事件。
    /// 每保存一次变更调用此方法一次。
    /// </summary>
    public static async Task DispatchAsync(IEnumerable<AggregateRoot> aggregates, IMediator mediator, CancellationToken ct = default)
    {
        var events = new List<IDomainEvent>();
        foreach (var aggregate in aggregates)
        {
            events.AddRange(aggregate.PopDomainEvents());
        }

        foreach (var domainEvent in events)
        {
            var notificationType = typeof(DomainEventNotification<>).MakeGenericType(domainEvent.GetType());
            var notification = Activator.CreateInstance(notificationType, domainEvent)
                ?? throw new InvalidOperationException($"Could not create notification for {domainEvent.GetType().FullName}.");
            await mediator.Publish(notification, ct);
        }
    }
}

public sealed record DomainEventNotification<TDomainEvent>(TDomainEvent DomainEvent) : INotification
    where TDomainEvent : IDomainEvent;
