using MassTransit;
using MediatR;
using MES.Infrastructure.DomainEvents;
using OperationExecutionStartedDomainEvent = MES.Domain.Events.OperationExecutionStarted;
using OperationReportedDomainEvent = MES.Domain.Events.OperationReported;
using SchedulePlanCreatedDomainEvent = MES.Domain.Events.SchedulePlanCreated;

namespace MES.Infrastructure.Events;

public class OperationReportedDomainEventHandler : INotificationHandler<DomainEventNotification<OperationReportedDomainEvent>>
{
    private readonly IPublishEndpoint _publishEndpoint;

    public OperationReportedDomainEventHandler(IPublishEndpoint publishEndpoint)
    {
        _publishEndpoint = publishEndpoint;
    }

    public Task Handle(DomainEventNotification<OperationReportedDomainEvent> notification, CancellationToken cancellationToken)
    {
        var domainEvent = notification.DomainEvent;
        return _publishEndpoint.Publish(new OperationReportedIntegrationEvent
        {
            WorkOrderNumber = domainEvent.WorkOrderNumber,
            OperationCode = domainEvent.OperationCode,
            Quantity = domainEvent.Quantity,
            ReportTime = domainEvent.ReportTime,
            OperatorId = domainEvent.OperatorId
        }, cancellationToken);
    }
}

public class SchedulePlanCreatedDomainEventHandler : INotificationHandler<DomainEventNotification<SchedulePlanCreatedDomainEvent>>
{
    private readonly IPublishEndpoint _publishEndpoint;

    public SchedulePlanCreatedDomainEventHandler(IPublishEndpoint publishEndpoint)
    {
        _publishEndpoint = publishEndpoint;
    }

    public Task Handle(DomainEventNotification<SchedulePlanCreatedDomainEvent> notification, CancellationToken cancellationToken)
    {
        var domainEvent = notification.DomainEvent;
        return _publishEndpoint.Publish(new SchedulePlanCreatedIntegrationEvent
        {
            PlanId = domainEvent.PlanId,
            PlanName = domainEvent.PlanName,
            CreatedAt = domainEvent.CreatedAt
        }, cancellationToken);
    }
}

public class OperationExecutionStartedDomainEventHandler : INotificationHandler<DomainEventNotification<OperationExecutionStartedDomainEvent>>
{
    private readonly IPublishEndpoint _publishEndpoint;

    public OperationExecutionStartedDomainEventHandler(IPublishEndpoint publishEndpoint)
    {
        _publishEndpoint = publishEndpoint;
    }

    public Task Handle(DomainEventNotification<OperationExecutionStartedDomainEvent> notification, CancellationToken cancellationToken)
    {
        var domainEvent = notification.DomainEvent;
        return _publishEndpoint.Publish(new OperationExecutionStartedIntegrationEvent
        {
            WorkOrderNumber = domainEvent.WorkOrderNumber,
            OperationCode = domainEvent.OperationCode,
            EquipmentId = domainEvent.EquipmentId,
            StartedAt = domainEvent.StartedAt
        }, cancellationToken);
    }
}
