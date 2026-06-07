using MES.Application.DTOs;
using MES.Domain.Enums;
using MES.Domain.Interfaces.Repositories;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace MES.Application.Services;

public sealed class SchedulerAgentEventHandler : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly SchedulerAgentOptions _options;
    private readonly ILogger<SchedulerAgentEventHandler> _logger;
    private readonly HashSet<string> _processedKeys = new(StringComparer.OrdinalIgnoreCase);

    public SchedulerAgentEventHandler(
        IServiceScopeFactory scopeFactory,
        IOptions<SchedulerAgentOptions> options,
        ILogger<SchedulerAgentEventHandler> logger)
    {
        _scopeFactory = scopeFactory;
        _options = options.Value;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (!_options.EnableSchedulingEventHandler)
        {
            _logger.LogInformation("Scheduler Agent event handler is disabled by configuration.");
            return;
        }

        var interval = TimeSpan.FromSeconds(_options.SchedulingEventPollSeconds);

        using var timer = new PeriodicTimer(interval);
        do
        {
            await PollOnceAsync(stoppingToken);
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }

    public async Task PollOnceAsync(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var workOrders = scope.ServiceProvider.GetRequiredService<IWorkOrderRepository>();
        var equipment = scope.ServiceProvider.GetRequiredService<IEquipmentRepository>();
        var materials = scope.ServiceProvider.GetRequiredService<IMaterialRepository>();
        var agent = scope.ServiceProvider.GetRequiredService<IScheduleAgentService>();

        var created = await workOrders.GetAllAsync(WorkOrderStatus.Created, ct);
        var scheduled = await workOrders.GetAllAsync(WorkOrderStatus.Scheduled, ct);
        var activeOrders = created.Concat(scheduled).ToList();
        if (activeOrders.Count == 0) return;

        foreach (var group in activeOrders.GroupBy(o => o.WorkshopId))
        {
            var workshopId = group.Key;
            var workshopOrders = group.ToList();
            if (workshopOrders.Any(o => o.Priority >= 8))
            {
                await TryRecommendAsync(agent, "RushOrder", "Scheduling", "Workshop", workshopId, "Warning", workshopId, ct);
            }

            if (workshopOrders.Any(o => o.CreatedAt >= DateTime.UtcNow.AddMinutes(-15)))
            {
                await TryRecommendAsync(agent, "NewWorkOrder", "Scheduling", "Workshop", workshopId, "Info", workshopId, ct);
            }
        }

        var lowStockMaterials = (await materials.GetAllAsync(ct))
            .Where(m => m.IsLowStock)
            .OrderBy(m => m.MaterialCode)
            .ToList();
        if (lowStockMaterials.Count > 0)
        {
            foreach (var workshopId in activeOrders.Select(o => o.WorkshopId).Distinct(StringComparer.OrdinalIgnoreCase))
            {
                foreach (var material in lowStockMaterials)
                {
                    await TryRecommendAsync(
                        agent,
                        "MaterialShortage",
                        "Inventory",
                        "WorkshopMaterial",
                        $"{workshopId}:{material.MaterialCode}",
                        "Warning",
                        workshopId,
                        ct);
                }
            }
        }

        foreach (var fault in await equipment.GetByStatusAsync(EquipmentStatus.Fault, ct))
        {
            await TryRecommendAsync(agent, "EquipmentFailure", "Equipment", "Equipment", fault.Id, "Critical", fault.WorkshopId, ct);
        }
    }

    private async Task TryRecommendAsync(
        IScheduleAgentService agent,
        string eventType,
        string sourceModule,
        string businessKeyType,
        string businessKeyValue,
        string severity,
        string workshopId,
        CancellationToken ct)
    {
        var key = $"{eventType}:{businessKeyType}:{businessKeyValue}";
        if (!_processedKeys.Add(key)) return;

        try
        {
            await agent.RecommendAsync(new AgentRecommendRequest
            {
                WorkshopId = workshopId,
                EventType = eventType,
                SourceModule = sourceModule,
                BusinessKeyType = businessKeyType,
                BusinessKeyValue = businessKeyValue,
                Severity = severity,
            }, "scheduler-agent-event-handler", ct);
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            _processedKeys.Remove(key);
            _logger.LogWarning(ex, "Scheduler Agent event handler failed to process {EventKey}", key);
        }
    }
}
