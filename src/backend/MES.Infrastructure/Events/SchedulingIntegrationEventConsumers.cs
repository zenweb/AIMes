using MassTransit;
using MES.Domain.Interfaces.Repositories;
using MES.Infrastructure.Services;
using Microsoft.Extensions.Logging;

namespace MES.Infrastructure.Events;

public class OperationReportedIntegrationEventConsumer : IConsumer<OperationReportedIntegrationEvent>
{
    private readonly ISchedulingContextProvider _contextProvider;
    private readonly ISchedulingContextCache _cache;
    private readonly ILogger<OperationReportedIntegrationEventConsumer> _logger;

    public OperationReportedIntegrationEventConsumer(
        ISchedulingContextProvider contextProvider,
        ISchedulingContextCache cache,
        ILogger<OperationReportedIntegrationEventConsumer> logger)
    {
        _contextProvider = contextProvider;
        _cache = cache;
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
        _cache.InvalidateAll();
    }
}

public class SchedulePlanCreatedIntegrationEventConsumer : IConsumer<SchedulePlanCreatedIntegrationEvent>
{
    private readonly ISchedulingContextProvider _contextProvider;
    private readonly ISchedulingContextCache _cache;
    private readonly ILogger<SchedulePlanCreatedIntegrationEventConsumer> _logger;

    public SchedulePlanCreatedIntegrationEventConsumer(
        ISchedulingContextProvider contextProvider,
        ISchedulingContextCache cache,
        ILogger<SchedulePlanCreatedIntegrationEventConsumer> logger)
    {
        _contextProvider = contextProvider;
        _cache = cache;
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
        _cache.InvalidateAll();
    }
}
