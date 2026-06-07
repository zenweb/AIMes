using MES.Api.Hubs;
using MES.Application.DTOs;
using MES.Application.Services;
using Microsoft.AspNetCore.SignalR;

namespace MES.Api.Services;

/// <summary>
/// 定时收集仪表盘 KPI 并通过 SignalR 实时推送到前端监控看板
/// </summary>
public sealed class MetricsBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IHubContext<MonitoringHub> _hubContext;
    private readonly ILogger<MetricsBackgroundService> _logger;
    private readonly IMonitoringSubscriberTracker _subscriberTracker;

    public MetricsBackgroundService(
        IServiceScopeFactory scopeFactory,
        IHubContext<MonitoringHub> hubContext,
        ILogger<MetricsBackgroundService> logger,
        IMonitoringSubscriberTracker subscriberTracker)
    {
        _scopeFactory = scopeFactory;
        _hubContext = hubContext;
        _logger = logger;
        _subscriberTracker = subscriberTracker;
    }

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        await Task.Delay(3000, ct);
        var idleDelay = TimeSpan.FromSeconds(5);

        while (!ct.IsCancellationRequested)
        {
            try
            {
                var pushed = await PushMetricsOnceAsync(ct);
                idleDelay = pushed
                    ? TimeSpan.FromSeconds(5)
                    : TimeSpan.FromSeconds(Math.Min(idleDelay.TotalSeconds * 2, 60));
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Metrics push failed");
            }

            await Task.Delay(idleDelay, ct);
        }
    }

    internal async Task<bool> PushMetricsOnceAsync(CancellationToken ct)
    {
        if (!_subscriberTracker.HasSubscribers)
        {
            return false;
        }

        using var scope = _scopeFactory.CreateScope();
        var kpiService = scope.ServiceProvider.GetRequiredService<IDashboardKpiService>();

        var dashboard = await kpiService.ComputeDashboardAsync(ct);

        // 推送 KPI 卡片更新
        await _hubContext.Clients.Group("monitoring").SendAsync("KpiUpdate", new
        {
            scheduleAdherence = dashboard.Kpi.ScheduleAdherence,
            qualityPassRate = dashboard.Kpi.QualityPassRate,
            equipmentUtilization = dashboard.Kpi.EquipmentUtilization,
            activeOrders = dashboard.Kpi.ActiveOrders,
        }, ct);

        // 推送设备状态列表
        await _hubContext.Clients.Group("monitoring").SendAsync("EquipmentMetrics", dashboard.Equipment.Select(e => new
        {
            id = e.Id,
            name = e.Name,
            type = e.Type,
            status = e.Status,
            statusText = e.StatusText,
        }), ct);

        return true;
    }
}
