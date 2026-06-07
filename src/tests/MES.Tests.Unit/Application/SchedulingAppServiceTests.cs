using FluentAssertions;
using MES.Application.DTOs;
using MES.Application.Services;
using MES.Domain.Entities.Bom;
using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Enums;
using MES.Domain.Interfaces.Repositories;
using MES.Domain.Interfaces.Services;
using Moq;
using Xunit;

namespace MES.Tests.Unit.Application;

public class SchedulingAppServiceTests
{
    private readonly Mock<IWorkOrderRepository> _workOrderRepoMock;
    private readonly Mock<IEquipmentRepository> _equipmentRepoMock;
    private readonly Mock<IMaterialRepository> _materialRepoMock;
    private readonly Mock<IScheduleRepository> _scheduleRepoMock;
    private readonly Mock<IScheduleOptimizationService> _optimizationMock;
    private readonly Mock<IAdoptionFeedbackService> _feedbackMock;
    private readonly Mock<IBomRepository> _bomRepoMock;
    private readonly Mock<ISchedulingContextProvider> _contextProviderMock;
    private readonly Mock<IAgentDecisionRepository> _agentDecisionRepoMock;
    private readonly Mock<IAuditLogRepository> _auditLogRepoMock;
    private readonly SchedulingAppService _sut;

    public SchedulingAppServiceTests()
    {
        _workOrderRepoMock = new Mock<IWorkOrderRepository>();
        _equipmentRepoMock = new Mock<IEquipmentRepository>();
        _materialRepoMock = new Mock<IMaterialRepository>();
        _scheduleRepoMock = new Mock<IScheduleRepository>();
        _optimizationMock = new Mock<IScheduleOptimizationService>();
        _feedbackMock = new Mock<IAdoptionFeedbackService>();
        _bomRepoMock = new Mock<IBomRepository>();
        _contextProviderMock = new Mock<ISchedulingContextProvider>();
        _agentDecisionRepoMock = new Mock<IAgentDecisionRepository>();
        _auditLogRepoMock = new Mock<IAuditLogRepository>();

        _sut = new SchedulingAppService(
            _workOrderRepoMock.Object,
            _equipmentRepoMock.Object,
            _materialRepoMock.Object,
            _scheduleRepoMock.Object,
            _optimizationMock.Object,
            _feedbackMock.Object,
            _bomRepoMock.Object,
            _contextProviderMock.Object,
            _agentDecisionRepoMock.Object,
            _auditLogRepoMock.Object);
    }

    [Fact]
    public async Task OptimizeScheduleAsync_ShouldCallAgentAndSavePlan()
    {
        var now = new DateTime(2026, 5, 12, 8, 0, 0, DateTimeKind.Utc);
        var request = new OptimizeScheduleRequest
        {
            WorkshopId = "WS-001",
            ConsiderHistoricalData = false
        };

        var workOrder = WorkOrder.Create("WO-001", "PROD-A1", "Product A", 100,
            now, now.AddDays(7), "WS-001", 10, "R001");

        var equipments = new List<Equipment>
        {
            Equipment.Create("CNC-001", "CNC Machine 1", "CNC", "WS-001", "Workshop A", 100)
        };

        var scheduleResult = new ScheduleOptimizationResult(
            [new ScheduleAssignmentData(workOrder.Id, "eq-001", now, now.AddHours(8), [], null, 0, false)],
            now,
            85.0,
            95.0,
            0,
            1,
            null,
            "测试排产结果",
            [],
            []);

        _workOrderRepoMock.Setup(r => r.GetAllAsync(WorkOrderStatus.Created, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<WorkOrder> { workOrder });
        _workOrderRepoMock.Setup(r => r.GetAllAsync(WorkOrderStatus.Scheduled, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<WorkOrder>());
        _equipmentRepoMock.Setup(r => r.GetByWorkshopAsync("WS-001", It.IsAny<CancellationToken>()))
            .ReturnsAsync(equipments);
        _bomRepoMock.Setup(r => r.GetByProductCodeAsync(It.IsAny<MES.Domain.ValueObjects.ProductCode>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<BillOfMaterial>());
        _optimizationMock
            .Setup(a => a.OptimizeAsync(It.IsAny<ScheduleOptimizationRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(scheduleResult);
        _scheduleRepoMock.Setup(r => r.CreateAsync(It.IsAny<SchedulePlan>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((SchedulePlan p, CancellationToken _) => p);

        var result = await _sut.OptimizeScheduleAsync(request);

        result.Should().NotBeNull();
        result.UtilizationRate.Should().Be(85.0);
        result.OptimizationReason.Should().Be("测试排产结果");
        result.Assignments.Should().HaveCount(1);
        result.Assignments[0].WorkOrderId.Should().Be(workOrder.Id);

        _optimizationMock.Verify(
            a => a.OptimizeAsync(It.IsAny<ScheduleOptimizationRequest>(), It.IsAny<CancellationToken>()),
            Times.Once);
        _scheduleRepoMock.Verify(r => r.CreateAsync(It.IsAny<SchedulePlan>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task OptimizeScheduleAsync_WithHistoricalData_ShouldPassSerializedContextToOptimizer()
    {
        var now = new DateTime(2026, 5, 12, 8, 0, 0, DateTimeKind.Utc);
        var request = new OptimizeScheduleRequest
        {
            WorkshopId = "WS-001",
            ConsiderHistoricalData = true
        };

        var workOrder = WorkOrder.Create("WO-003", "PROD-C1", "Product C", 30,
            now, now.AddDays(4), "WS-001", 9, "R003");

        var equipments = new List<Equipment>
        {
            Equipment.Create("CNC-001", "CNC Machine 1", "CNC", "WS-001", "Workshop A", 100)
        };

        var context = new SchedulingContextSnapshot
        {
            WorkshopId = "WS-001",
            SnapshotTime = now,
            WorkOrders = [new WorkOrderSummary("WO-003", "PROD-C1", "Product C", 30, 10, "Created", now, now.AddDays(4), "R003", 9, "WS-001")],
            WipItems = [new WipSummary("WO-003", "OP-10", 10, 1, 30)],
            CurrentExecutions = [new ExecutionStatusSummary("WO-003", "OP-10", "eq-001", "Running", now, 10, 30)],
            ChangeoverMatrix = [new ChangeoverEntry("PROD-C1", "PROD-C2", 60, ChangeoverType.SimilarMaterial)],
        };

        var scheduleResult = new ScheduleOptimizationResult(
            [new ScheduleAssignmentData(workOrder.Id, "eq-001", now, now.AddHours(6), [], null, 0, false)],
            now.AddHours(6),
            60.0,
            80.0,
            30.0,
            1,
            null,
            "含历史数据的排产结果",
            [],
            []);

        _workOrderRepoMock.Setup(r => r.GetAllAsync(WorkOrderStatus.Created, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<WorkOrder> { workOrder });
        _workOrderRepoMock.Setup(r => r.GetAllAsync(WorkOrderStatus.Scheduled, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<WorkOrder>());
        _equipmentRepoMock.Setup(r => r.GetByWorkshopAsync("WS-001", It.IsAny<CancellationToken>()))
            .ReturnsAsync(equipments);
        _bomRepoMock.Setup(r => r.GetByProductCodeAsync(It.IsAny<MES.Domain.ValueObjects.ProductCode>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<BillOfMaterial>());
        _contextProviderMock.Setup(r => r.GetContextAsync("WS-001", It.IsAny<CancellationToken>()))
            .ReturnsAsync(context);
        _optimizationMock
            .Setup(a => a.OptimizeAsync(
                It.Is<ScheduleOptimizationRequest>(r => r.HistoricalData != null && r.HistoricalData.Contains("WO-003") && r.HistoricalData.Contains("ChangeoverMatrix")),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(scheduleResult);
        _scheduleRepoMock.Setup(r => r.CreateAsync(It.IsAny<SchedulePlan>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((SchedulePlan p, CancellationToken _) => p);

        var result = await _sut.OptimizeScheduleAsync(request);

        result.Should().NotBeNull();
        result.OptimizationReason.Should().Be("含历史数据的排产结果");
        _contextProviderMock.Verify(r => r.GetContextAsync("WS-001", It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task OptimizeScheduleAsync_WithWorkOrderIds_ShouldUseSpecifiedOrders()
    {
        var now = new DateTime(2026, 5, 12, 8, 0, 0, DateTimeKind.Utc);
        var workOrder = WorkOrder.Create("WO-002", "PROD-B1", "Product B", 50,
            now, now.AddDays(3), "WS-001", 5);
        var request = new OptimizeScheduleRequest
        {
            WorkshopId = "WS-001",
            WorkOrderIds = new List<string> { workOrder.Id }
        };

        var equipments = new List<Equipment>
        {
            Equipment.Create("CNC-001", "CNC Machine 1", "CNC", "WS-001", "Workshop A", 100)
        };

        var scheduleResult = new ScheduleOptimizationResult(
            [new ScheduleAssignmentData(workOrder.Id, "eq-001", now, now.AddHours(4), [], null, 0, false)],
            now,
            45.0,
            0,
            0,
            1,
            null,
            "指定工单排产",
            [],
            []);

        _workOrderRepoMock.Setup(r => r.GetByIdAsync(workOrder.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(workOrder);
        _equipmentRepoMock.Setup(r => r.GetByWorkshopAsync("WS-001", It.IsAny<CancellationToken>()))
            .ReturnsAsync(equipments);
        _bomRepoMock.Setup(r => r.GetByProductCodeAsync(It.IsAny<MES.Domain.ValueObjects.ProductCode>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<BillOfMaterial>());
        _optimizationMock
            .Setup(a => a.OptimizeAsync(It.IsAny<ScheduleOptimizationRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(scheduleResult);
        _scheduleRepoMock.Setup(r => r.CreateAsync(It.IsAny<SchedulePlan>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((SchedulePlan p, CancellationToken _) => p);

        var result = await _sut.OptimizeScheduleAsync(request);

        result.Assignments.Should().HaveCount(1);
        result.Assignments[0].WorkOrderId.Should().Be(workOrder.Id);
    }

    [Fact]
    public async Task CreateWorkOrderAsync_ShouldCreateWorkOrderWithCorrectProperties()
    {
        var request = new CreateWorkOrderRequest
        {
            OrderNumber = "WO-001",
            ProductCode = "PROD-001",
            ProductName = "Test Product",
            PlannedQuantity = 100,
            PlannedStartDate = DateTime.UtcNow,
            PlannedEndDate = DateTime.UtcNow.AddDays(7),
            WorkshopId = "WS-001",
            Priority = 10
        };

        _workOrderRepoMock.Setup(r => r.CreateAsync(It.IsAny<WorkOrder>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((WorkOrder w, CancellationToken _) => w);

        var result = await _sut.CreateWorkOrderAsync(request);

        result.Should().NotBeNull();
        result.OrderNumber.Should().Be("WO-001");
        result.ProductCode.Should().Be("PROD-001");
        result.ProductName.Should().Be("Test Product");
        result.PlannedQuantity.Should().Be(100);
        result.Priority.Should().Be(10);

        _workOrderRepoMock.Verify(r => r.CreateAsync(It.IsAny<WorkOrder>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetWorkOrderByIdAsync_WhenExists_ShouldReturnWorkOrder()
    {
        var workOrder = WorkOrder.Create("WO-001", "PROD-001", "Test Product", 100,
            DateTime.UtcNow, DateTime.UtcNow.AddDays(7), "WS-001");

        _workOrderRepoMock.Setup(r => r.GetByIdAsync(workOrder.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(workOrder);

        var result = await _sut.GetWorkOrderByIdAsync(workOrder.Id);

        result.Should().NotBeNull();
        result!.Id.Should().Be(workOrder.Id);
        result.OrderNumber.Should().Be("WO-001");
    }

    [Fact]
    public async Task GetWorkOrderByIdAsync_WhenNotExists_ShouldReturnNull()
    {
        _workOrderRepoMock.Setup(r => r.GetByIdAsync("non-existent", It.IsAny<CancellationToken>()))
            .ReturnsAsync((WorkOrder?)null);

        var result = await _sut.GetWorkOrderByIdAsync("non-existent");

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetWorkOrdersAsync_ShouldUseRepositoryPagingWithFilters()
    {
        var plannedStart = new DateTime(2026, 5, 1, 8, 0, 0, DateTimeKind.Utc);
        var plannedEnd = plannedStart.AddDays(7);
        var workOrders = new List<WorkOrder>
        {
            WorkOrder.Create("WO-101", "PROD-A", "Product A", 10, plannedStart, plannedEnd, "WS-001", 8),
            WorkOrder.Create("WO-102", "PROD-A", "Product A", 20, plannedStart.AddHours(1), plannedEnd, "WS-001", 7)
        };
        var parameters = new WorkOrderQueryParameters
        {
            Status = "Created",
            WorkshopId = "WS-001",
            ProductCode = "PROD-A",
            StartDate = plannedStart,
            EndDate = plannedEnd,
            Page = 2,
            PageSize = 2
        };

        _workOrderRepoMock
            .Setup(r => r.GetPagedAsync(
                WorkOrderStatus.Created,
                parameters.WorkshopId,
                parameters.ProductCode,
                parameters.StartDate,
                parameters.EndDate,
                parameters.Page,
                parameters.PageSize,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(workOrders);
        _workOrderRepoMock
            .Setup(r => r.CountAsync(
                WorkOrderStatus.Created,
                parameters.WorkshopId,
                parameters.ProductCode,
                parameters.StartDate,
                parameters.EndDate,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(5);

        var result = await _sut.GetWorkOrdersAsync(parameters);

        result.Items.Should().HaveCount(2);
        result.TotalCount.Should().Be(5);
        result.Page.Should().Be(2);
        result.PageSize.Should().Be(2);
        _workOrderRepoMock.Verify(r => r.GetAllAsync(It.IsAny<WorkOrderStatus?>(), It.IsAny<CancellationToken>()), Times.Never);
        _workOrderRepoMock.Verify(r => r.GetPagedAsync(
            WorkOrderStatus.Created,
            parameters.WorkshopId,
            parameters.ProductCode,
            parameters.StartDate,
            parameters.EndDate,
            parameters.Page,
            parameters.PageSize,
            It.IsAny<CancellationToken>()), Times.Once);
        _workOrderRepoMock.Verify(r => r.CountAsync(
            WorkOrderStatus.Created,
            parameters.WorkshopId,
            parameters.ProductCode,
            parameters.StartDate,
            parameters.EndDate,
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateWorkOrderStatusAsync_ShouldUpdateStatus()
    {
        var workOrder = WorkOrder.Create("WO-001", "PROD-001", "Test Product", 100,
            DateTime.UtcNow, DateTime.UtcNow.AddDays(7), "WS-001");

        _workOrderRepoMock.Setup(r => r.GetByIdAsync(workOrder.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(workOrder);
        _workOrderRepoMock.Setup(r => r.UpdateAsync(It.IsAny<WorkOrder>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((WorkOrder w, CancellationToken _) => w);

        var result = await _sut.UpdateWorkOrderStatusAsync(workOrder.Id, "Scheduled");

        result.Status.Should().Be("Scheduled");
        _workOrderRepoMock.Verify(r => r.UpdateAsync(It.IsAny<WorkOrder>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeleteWorkOrderAsync_ShouldCallRepositoryDelete()
    {
        var workOrder = WorkOrder.Create("WO-001", "PROD-001", "Test Product", 100,
            DateTime.UtcNow, DateTime.UtcNow.AddDays(7), "WS-001");

        _workOrderRepoMock.Setup(r => r.GetByIdAsync(workOrder.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(workOrder);

        await _sut.DeleteWorkOrderAsync(workOrder.Id);

        _workOrderRepoMock.Verify(r => r.DeleteAsync(workOrder.Id, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetAllPlansAsync_ShouldReturnAllPlans()
    {
        var plans = new List<SchedulePlan>
        {
            SchedulePlan.Create("Plan 1", DateTime.UtcNow, DateTime.UtcNow.AddDays(7)),
            SchedulePlan.Create("Plan 2", DateTime.UtcNow, DateTime.UtcNow.AddDays(14)),
        };

        _scheduleRepoMock.Setup(r => r.GetAllAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(plans);

        var result = await _sut.GetAllPlansAsync();

        result.Should().HaveCount(2);
        result[0].PlanName.Should().Be("Plan 1");
    }
}
