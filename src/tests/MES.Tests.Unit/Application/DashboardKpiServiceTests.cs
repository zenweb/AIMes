using FluentAssertions;
using MES.Application.Services;
using MES.Domain.Entities.Anomalies;
using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Quality;
using MES.Domain.Enums;
using MES.Domain.Interfaces.Repositories;
using MES.Domain.ValueObjects;
using Moq;

namespace MES.Tests.Unit.Application;

public class DashboardKpiServiceTests
{
    private readonly Mock<IWorkOrderRepository> _workOrderRepoMock = new();
    private readonly Mock<IEquipmentRepository> _equipmentRepoMock = new();
    private readonly Mock<IQualityInspectionRepository> _qualityRepoMock = new();
    private readonly Mock<IMaterialRepository> _materialRepoMock = new();
    private readonly Mock<IAnomalyRepository> _anomalyRepoMock = new();
    private readonly DashboardKpiService _sut;

    public DashboardKpiServiceTests()
    {
        _sut = new DashboardKpiService(
            _workOrderRepoMock.Object,
            _equipmentRepoMock.Object,
            _qualityRepoMock.Object,
            _materialRepoMock.Object,
            _anomalyRepoMock.Object);

        _workOrderRepoMock.Setup(r => r.GetAllAsync(null, It.IsAny<CancellationToken>())).ReturnsAsync([]);
        _equipmentRepoMock.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([]);
        _qualityRepoMock.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([]);
        _materialRepoMock.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([]);
        _anomalyRepoMock.Setup(r => r.GetCriticalOpenAsync(It.IsAny<CancellationToken>())).ReturnsAsync([]);
    }

    [Fact]
    public async Task ComputeDashboardAsync_ShouldCountOverdueUnfinishedWorkOrdersInScheduleAdherenceDenominator()
    {
        var now = DateTime.UtcNow;
        var onTimeCompleted = CreateWorkOrder("WO-DASH-ONTIME", now.AddDays(-3), now.AddDays(1), WorkOrderStatus.Completed);
        var lateCompleted = CreateWorkOrder("WO-DASH-LATE", now.AddDays(-5), now.AddDays(-1), WorkOrderStatus.Completed);
        var overdueUnfinished = CreateWorkOrder("WO-DASH-OVERDUE", now.AddDays(-4), now.AddDays(-2), WorkOrderStatus.InProgress);
        var futureUnfinished = CreateWorkOrder("WO-DASH-FUTURE", now, now.AddDays(2), WorkOrderStatus.InProgress);
        _workOrderRepoMock.Setup(r => r.GetAllAsync(null, It.IsAny<CancellationToken>()))
            .ReturnsAsync([onTimeCompleted, lateCompleted, overdueUnfinished, futureUnfinished]);

        var result = await _sut.ComputeDashboardAsync(CancellationToken.None);

        result.Kpi.ScheduleAdherence.Should().Be(33.3, "超期未完成工单已经承诺交付，应进入分母并按未准时计算");
        result.Kpi.ActiveOrders.Should().Be(2);
    }

    [Fact]
    public async Task ComputeDashboardAsync_ShouldMapEquipmentQualityAndMaterialAlerts()
    {
        var running = Equipment.Create("EQ-001", "CNC 一号", "CNC", "WS-001", "一车间", 100);
        running.StartWork("WO-001");
        var idle = Equipment.Create("EQ-002", "装配台", "ASM", "WS-001", "一车间", 20);
        idle.SetIdle();
        var pass = QualityInspection.Create("WO-001", "PROD-001", "装配", "终检", 10, 10, 0, "qc");
        var fail = QualityInspection.Create("WO-002", "PROD-001", "装配", "终检", 10, 8, 2, "qc");
        var material = Material.Create("M-001", "轴承", "pcs", safetyStock: 10, availableQuantity: 0);
        var anomaly = new ProductionAnomaly(
            new WorkOrderNumber("WO-001"),
            new OperationCode("OP-010"),
            "Quality",
            AnomalySeverity.Critical,
            "尺寸超差",
            "终检尺寸超差");

        _equipmentRepoMock.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([running, idle]);
        _qualityRepoMock.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([pass, fail]);
        _materialRepoMock.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([material]);
        _anomalyRepoMock.Setup(r => r.GetCriticalOpenAsync(It.IsAny<CancellationToken>())).ReturnsAsync([anomaly]);

        var result = await _sut.ComputeDashboardAsync(CancellationToken.None);

        result.Kpi.EquipmentUtilization.Should().Be(50);
        result.Kpi.QualityPassRate.Should().Be(50);
        result.Equipment.Should().Contain(e => e.Id == running.Id && e.Status == "running" && e.StatusText == "运行中");
        result.MaterialAlerts.Should().ContainSingle().Which.Level.Should().Be("critical");
        result.QualityStats.TotalInspections.Should().Be(2);
        result.QualityStats.Passed.Should().Be(1);
        result.QualityStats.Defects.Should().Be(1);
        result.QualityStats.PendingAnomalies.Should().Be(1);
    }

    [Fact]
    public async Task ComputeDashboardAsync_ShouldPropagateCancellationTokenToRepositories()
    {
        using var cts = new CancellationTokenSource();
        var ct = cts.Token;

        await _sut.ComputeDashboardAsync(ct);

        _workOrderRepoMock.Verify(r => r.GetAllAsync(null, ct), Times.Once);
        _equipmentRepoMock.Verify(r => r.GetAllAsync(ct), Times.Once);
        _qualityRepoMock.Verify(r => r.GetAllAsync(ct), Times.Once);
        _materialRepoMock.Verify(r => r.GetAllAsync(ct), Times.Once);
        _anomalyRepoMock.Verify(r => r.GetCriticalOpenAsync(ct), Times.Once);
    }

    private static WorkOrder CreateWorkOrder(
        string orderNumber,
        DateTime plannedStart,
        DateTime plannedEnd,
        WorkOrderStatus status)
    {
        var workOrder = WorkOrder.Create(orderNumber, "PROD-A", "Product A", 10, plannedStart, plannedEnd, "WS-001");
        if (status is WorkOrderStatus.InProgress)
        {
            workOrder.Start();
        }

        if (status is WorkOrderStatus.Completed)
        {
            workOrder.Start();
            workOrder.Complete(10);
        }

        return workOrder;
    }
}
