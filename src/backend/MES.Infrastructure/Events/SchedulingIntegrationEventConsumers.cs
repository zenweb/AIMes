using MassTransit;
using MES.Domain.Interfaces.Repositories;
using Microsoft.Extensions.Logging;

namespace MES.Infrastructure.Events;

public class OperationReportedIntegrationEventConsumer : IConsumer<OperationReportedIntegrationEvent>
{
    private readonly ISchedulingContextProvider _contextProvider;
    private readonly ILogger<OperationReportedIntegrationEventConsumer> _logger;

    public OperationReportedIntegrationEventConsumer(
        ISchedulingContextProvider contextProvider,
        ILogger<OperationReportedIntegrationEventConsumer> logger)
    {
        _contextProvider = contextProvider;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<OperationReportedIntegrationEvent> context)
    {
        _logger.LogInformation(
            "Consumed operation reported integration event. WorkOrder={WorkOrderNumber}, Operation={OperationCode}",
            context.Message.WorkOrderNumber,
            context.Message.OperationCode);

        await _contextProvider.UpdateCacheAsync(
            context.Message.WorkOrderNumber,
            "operation-reported",
            context.Message);
    }
}

public class SchedulePlanCreatedIntegrationEventConsumer : IConsumer<SchedulePlanCreatedIntegrationEvent>
{
    private readonly ISchedulingContextProvider _contextProvider;
    private readonly ILogger<SchedulePlanCreatedIntegrationEventConsumer> _logger;

    public SchedulePlanCreatedIntegrationEventConsumer(
        ISchedulingContextProvider contextProvider,
        ILogger<SchedulePlanCreatedIntegrationEventConsumer> logger)
    {
        _contextProvider = contextProvider;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<SchedulePlanCreatedIntegrationEvent> context)
    {
        _logger.LogInformation(
            "Consumed schedule plan created integration event. PlanId={PlanId}, PlanName={PlanName}",
            context.Message.PlanId,
            context.Message.PlanName);

        await _contextProvider.UpdateCacheAsync(
            context.Message.PlanId,
            "schedule-plan-created",
            context.Message);
    }
}
