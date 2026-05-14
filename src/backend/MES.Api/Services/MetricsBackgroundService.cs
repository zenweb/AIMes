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

    public MetricsBackgroundService(IServiceScopeFactory scopeFactory, IHubContext<MonitoringHub> hubContext, ILogger<MetricsBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _hubContext = hubContext;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        await Task.Delay(3000, ct);

        while (!ct.IsCancellationRequested)
        {
            try
            {
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
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Metrics push failed");
            }

            await Task.Delay(5000, ct);
        }
    }
}
