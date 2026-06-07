using FluentAssertions;
using MES.Api.Hubs;
using MES.Api.Services;
using MES.Application.DTOs;
using MES.Application.Services;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;

namespace MES.Tests.Unit.Services;

public class MetricsBackgroundServiceTests
{
    [Fact]
    public void MonitoringSubscriberTracker_ShouldTrackConnectionsWithoutGoingNegative()
    {
        var tracker = new MonitoringSubscriberTracker();

        tracker.Connected();
        tracker.Connected();
        tracker.Disconnected();
        tracker.Disconnected();
        tracker.Disconnected();

        tracker.SubscriberCount.Should().Be(0);
        tracker.HasSubscribers.Should().BeFalse();
    }

    [Fact]
    public async Task PushMetricsOnceAsync_WhenNoMonitoringSubscribers_ShouldNotCreateScope()
    {
        var tracker = new MonitoringSubscriberTracker();
        var scopeFactory = new CountingScopeFactory();
        var hubContext = new Mock<IHubContext<MonitoringHub>>();
        var service = new MetricsBackgroundService(
            scopeFactory,
            hubContext.Object,
            NullLogger<MetricsBackgroundService>.Instance,
            tracker);

        await service.PushMetricsOnceAsync(CancellationToken.None);

        scopeFactory.CreateScopeCount.Should().Be(0, "没有 SignalR monitoring 订阅者时不应查询数据库或计算 KPI");
    }

    [Fact]
    public async Task PushMetricsOnceAsync_WhenMonitoringSubscriberExists_ShouldComputeKpiAndSendUpdates()
    {
        var tracker = new MonitoringSubscriberTracker();
        tracker.Connected();
        var kpiService = new CountingDashboardKpiService();
        var scopeFactory = new CountingScopeFactory(kpiService);
        var hubContext = new Mock<IHubContext<MonitoringHub>>();
        var clients = new Mock<IHubClients>();
        var clientProxy = new Mock<IClientProxy>();
        hubContext.SetupGet(c => c.Clients).Returns(clients.Object);
        clients.Setup(c => c.Group("monitoring")).Returns(clientProxy.Object);
        var service = new MetricsBackgroundService(
            scopeFactory,
            hubContext.Object,
            NullLogger<MetricsBackgroundService>.Instance,
            tracker);

        var pushed = await service.PushMetricsOnceAsync(CancellationToken.None);

        pushed.Should().BeTrue();
        scopeFactory.CreateScopeCount.Should().Be(1);
        kpiService.ComputeCount.Should().Be(1);
        clientProxy.Verify(
            p => p.SendCoreAsync(
                "KpiUpdate",
                It.IsAny<object?[]>(),
                It.IsAny<CancellationToken>()),
            Times.Once);
        clientProxy.Verify(
            p => p.SendCoreAsync(
                "EquipmentMetrics",
                It.IsAny<object?[]>(),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    private sealed class CountingScopeFactory : IServiceScopeFactory
    {
        private readonly IDashboardKpiService? _kpiService;

        public CountingScopeFactory(IDashboardKpiService? kpiService = null)
        {
            _kpiService = kpiService;
        }

        public int CreateScopeCount { get; private set; }

        public IServiceScope CreateScope()
        {
            CreateScopeCount++;
            if (_kpiService is null)
            {
                throw new InvalidOperationException("Scope should not be created without monitoring subscribers.");
            }

            var services = new ServiceCollection()
                .AddSingleton(_kpiService)
                .BuildServiceProvider();
            return services.CreateScope();
        }
    }

    private sealed class CountingDashboardKpiService : IDashboardKpiService
    {
        public int ComputeCount { get; private set; }

        public Task<DashboardDto> ComputeDashboardAsync(CancellationToken ct = default)
        {
            ComputeCount++;
            return Task.FromResult(new DashboardDto
            {
                Kpi = new KpiCardDto
                {
                    ScheduleAdherence = 91.2,
                    QualityPassRate = 98.1,
                    EquipmentUtilization = 73.4,
                    ActiveOrders = 8,
                },
                Equipment =
                [
                    new EquipmentStatusDto
                    {
                        Id = "EQ-001",
                        Name = "CNC-001",
                        Type = "CNC",
                        Status = "running",
                        StatusText = "运行中",
                    }
                ],
            });
        }
    }
}
