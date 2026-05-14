using MassTransit;
using MediatR;
using OperationExecutionStartedDomainEvent = MES.Domain.Events.OperationExecutionStarted;
using OperationReportedDomainEvent = MES.Domain.Events.OperationReported;
using SchedulePlanCreatedDomainEvent = MES.Domain.Events.SchedulePlanCreated;

namespace MES.Infrastructure.Events;

public class OperationReportedDomainEventHandler : INotificationHandler<OperationReportedDomainEvent>
{
    private readonly IPublishEndpoint _publishEndpoint;

    public OperationReportedDomainEventHandler(IPublishEndpoint publishEndpoint)
    {
        _publishEndpoint = publishEndpoint;
    }

    public Task Handle(OperationReportedDomainEvent notification, CancellationToken cancellationToken)
    {
        return _publishEndpoint.Publish(new OperationReportedIntegrationEvent
        {
            WorkOrderNumber = notification.WorkOrderNumber,
            OperationCode = notification.OperationCode,
            Quantity = notification.Quantity,
            ReportTime = notification.ReportTime,
            OperatorId = notification.OperatorId
        }, cancellationToken);
    }
}

public class SchedulePlanCreatedDomainEventHandler : INotificationHandler<SchedulePlanCreatedDomainEvent>
{
    private readonly IPublishEndpoint _publishEndpoint;

    public SchedulePlanCreatedDomainEventHandler(IPublishEndpoint publishEndpoint)
    {
        _publishEndpoint = publishEndpoint;
    }

    public Task Handle(SchedulePlanCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        return _publishEndpoint.Publish(new SchedulePlanCreatedIntegrationEvent
        {
            PlanId = notification.PlanId,
            PlanName = notification.PlanName,
            CreatedAt = notification.CreatedAt
        }, cancellationToken);
    }
}

public class OperationExecutionStartedDomainEventHandler : INotificationHandler<OperationExecutionStartedDomainEvent>
{
    private readonly IPublishEndpoint _publishEndpoint;

    public OperationExecutionStartedDomainEventHandler(IPublishEndpoint publishEndpoint)
    {
        _publishEndpoint = publishEndpoint;
    }

    public Task Handle(OperationExecutionStartedDomainEvent notification, CancellationToken cancellationToken)
    {
        return _publishEndpoint.Publish(new OperationExecutionStartedIntegrationEvent
        {
            WorkOrderNumber = notification.WorkOrderNumber,
            OperationCode = notification.OperationCode,
            EquipmentId = notification.EquipmentId,
            StartedAt = notification.StartedAt
        }, cancellationToken);
    }
}
