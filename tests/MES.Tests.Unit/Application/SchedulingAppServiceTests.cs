using MES.Application.DTOs;
using MES.Application.Services;
using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Enums;
using MES.Domain.Interfaces.Repositories;
using MES.AI.Core.Models;
using MES.AI.Core.Scheduling;
using MES.AI.Pro.Agents;
using MES.AI.Pro.Services;
using Microsoft.SemanticKernel;
using Moq;
using FluentAssertions;
using Xunit;

namespace MES.Tests.Unit.Application;

public class SchedulingAppServiceTests
{
    private readonly Mock<IWorkOrderRepository> _workOrderRepoMock;
    private readonly Mock<IEquipmentRepository> _equipmentRepoMock;
    private readonly Mock<IMaterialRepository> _materialRepoMock;
    private readonly Mock<IScheduleRepository> _scheduleRepoMock;
    private readonly Mock<SchedulingAgent> _schedulingAgentMock;
    private readonly SchedulingAppService _sut;

    public SchedulingAppServiceTests()
    {
        _workOrderRepoMock = new Mock<IWorkOrderRepository>();
        _equipmentRepoMock = new Mock<IEquipmentRepository>();
        _materialRepoMock = new Mock<IMaterialRepository>();
        _scheduleRepoMock = new Mock<IScheduleRepository>();

        var kernel = Kernel.CreateBuilder().Build();
        var llmGatewayMock = new Mock<ILlmGateway>();
        var contextProviderMock = new Mock<ISchedulingContextProvider>();
        var ruleEngineMock = new Mock<ISchedulingRuleEngine>();
        var constraintValidatorMock = new Mock<IConstraintValidator>();

        _schedulingAgentMock = new Mock<SchedulingAgent>(
            kernel,
            llmGatewayMock.Object,
            contextProviderMock.Object,
            ruleEngineMock.Object,
            constraintValidatorMock.Object)
        { CallBase = false };

        _sut = new SchedulingAppService(
            _workOrderRepoMock.Object,
            _equipmentRepoMock.Object,
            _materialRepoMock.Object,
            _scheduleRepoMock.Object,
            _schedulingAgentMock.Object);
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

        var workOrders = new List<WorkOrder>
        {
            new()
            {
                Id = "wo-001", OrderNumber = "WO-001", ProductCode = "PROD-A1",
                ProductName = "Product A", PlannedQuantity = 100,
                PlannedStartDate = now, PlannedEndDate = now.AddDays(7),
                WorkshopId = "WS-001", RouteCode = "R001", Priority = 10,
                Status = WorkOrderStatus.Created
            }
        };

        var equipments = new List<Equipment>
        {
            new()
            {
                Id = "eq-001", EquipmentCode = "CNC-001", EquipmentType = "CNC",
                Capacity = 100, Status = EquipmentStatus.Available
            }
        };

        var scheduleResult = new SchedulingResult
        {
            Assignments = new List<ScheduleAssignment>
            {
                new()
                {
                    WorkOrderId = "wo-001", EquipmentId = "eq-001",
                    StartTime = now, EndTime = now.AddHours(8)
                }
            },
            UtilizationRate = 85.0,
            OnTimeDeliveryRate = 95.0,
            OptimizationNotes = "测试排产结果"
        };

        _workOrderRepoMock.Setup(r => r.GetAllAsync(WorkOrderStatus.Created))
            .ReturnsAsync(workOrders);
        _workOrderRepoMock.Setup(r => r.GetAllAsync(WorkOrderStatus.Scheduled))
            .ReturnsAsync(new List<WorkOrder>());
        _equipmentRepoMock.Setup(r => r.GetByWorkshopAsync("WS-001"))
            .ReturnsAsync(equipments);
        _schedulingAgentMock
            .Setup(a => a.OptimizeScheduleAsync(It.IsAny<ScheduleRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(scheduleResult);
        _scheduleRepoMock.Setup(r => r.CreateAsync(It.IsAny<SchedulePlan>()))
            .ReturnsAsync((SchedulePlan p) => p);

        var result = await _sut.OptimizeScheduleAsync(request);

        result.Should().NotBeNull();
        result.UtilizationRate.Should().Be(85.0);
        result.OptimizationReason.Should().Be("测试排产结果");
        result.Assignments.Should().HaveCount(1);
        result.Assignments[0].WorkOrderId.Should().Be("wo-001");
        result.Assignments[0].EquipmentId.Should().Be("eq-001");

        _schedulingAgentMock.Verify(
            a => a.OptimizeScheduleAsync(It.IsAny<ScheduleRequest>(), It.IsAny<CancellationToken>()),
            Times.Once);
        _scheduleRepoMock.Verify(r => r.CreateAsync(It.IsAny<SchedulePlan>()), Times.Once);
    }

    [Fact]
    public async Task OptimizeScheduleAsync_WithWorkOrderIds_ShouldUseSpecifiedOrders()
    {
        var now = new DateTime(2026, 5, 12, 8, 0, 0, DateTimeKind.Utc);
        var request = new OptimizeScheduleRequest
        {
            WorkshopId = "WS-001",
            WorkOrderIds = new List<string> { "wo-002" }
        };

        var workOrder = new WorkOrder
        {
            Id = "wo-002", OrderNumber = "WO-002", ProductCode = "PROD-B1",
            ProductName = "Product B", PlannedQuantity = 50,
            PlannedStartDate = now, PlannedEndDate = now.AddDays(3),
            WorkshopId = "WS-001", Priority = 5,
            Status = WorkOrderStatus.Created
        };

        var equipments = new List<Equipment>
        {
            new()
            {
                Id = "eq-001", EquipmentCode = "CNC-001", EquipmentType = "CNC",
                Capacity = 100, Status = EquipmentStatus.Available
            }
        };

        var scheduleResult = new SchedulingResult
        {
            Assignments = new List<ScheduleAssignment>
            {
                new()
                {
                    WorkOrderId = "wo-002", EquipmentId = "eq-001",
                    StartTime = now, EndTime = now.AddHours(4)
                }
            },
            UtilizationRate = 45.0,
            OptimizationNotes = "指定工单排产"
        };

        _workOrderRepoMock.Setup(r => r.GetByIdAsync("wo-002"))
            .ReturnsAsync(workOrder);
        _equipmentRepoMock.Setup(r => r.GetByWorkshopAsync("WS-001"))
            .ReturnsAsync(equipments);
        _schedulingAgentMock
            .Setup(a => a.OptimizeScheduleAsync(It.IsAny<ScheduleRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(scheduleResult);
        _scheduleRepoMock.Setup(r => r.CreateAsync(It.IsAny<SchedulePlan>()))
            .ReturnsAsync((SchedulePlan p) => p);

        var result = await _sut.OptimizeScheduleAsync(request);

        result.Assignments.Should().HaveCount(1);
        result.Assignments[0].WorkOrderId.Should().Be("wo-002");
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

        _workOrderRepoMock.Setup(r => r.CreateAsync(It.IsAny<WorkOrder>()))
            .ReturnsAsync((WorkOrder w) => w);

        var result = await _sut.CreateWorkOrderAsync(request);

        result.Should().NotBeNull();
        result.OrderNumber.Should().Be("WO-001");
        result.ProductCode.Should().Be("PROD-001");
        result.ProductName.Should().Be("Test Product");
        result.PlannedQuantity.Should().Be(100);
        result.Priority.Should().Be(10);

        _workOrderRepoMock.Verify(r => r.CreateAsync(It.IsAny<WorkOrder>()), Times.Once);
    }

    [Fact]
    public async Task GetWorkOrderByIdAsync_WhenExists_ShouldReturnWorkOrder()
    {
        var workOrder = new WorkOrder
        {
            Id = "wo-001",
            OrderNumber = "WO-001",
            ProductCode = "PROD-001",
            ProductName = "Test Product",
            Status = WorkOrderStatus.Created
        };

        _workOrderRepoMock.Setup(r => r.GetByIdAsync("wo-001"))
            .ReturnsAsync(workOrder);

        var result = await _sut.GetWorkOrderByIdAsync("wo-001");

        result.Should().NotBeNull();
        result!.Id.Should().Be("wo-001");
        result.OrderNumber.Should().Be("WO-001");
    }

    [Fact]
    public async Task GetWorkOrderByIdAsync_WhenNotExists_ShouldReturnNull()
    {
        _workOrderRepoMock.Setup(r => r.GetByIdAsync("non-existent"))
            .ReturnsAsync((WorkOrder?)null);

        var result = await _sut.GetWorkOrderByIdAsync("non-existent");

        result.Should().BeNull();
    }

    [Fact]
    public async Task UpdateWorkOrderStatusAsync_ShouldUpdateStatus()
    {
        var workOrder = new WorkOrder
        {
            Id = "wo-001",
            Status = WorkOrderStatus.Created
        };

        _workOrderRepoMock.Setup(r => r.GetByIdAsync("wo-001"))
            .ReturnsAsync(workOrder);
        _workOrderRepoMock.Setup(r => r.UpdateAsync(It.IsAny<WorkOrder>()))
            .ReturnsAsync((WorkOrder w) => w);

        var result = await _sut.UpdateWorkOrderStatusAsync("wo-001", "Scheduled");

        result.Status.Should().Be("Scheduled");
        _workOrderRepoMock.Verify(r => r.UpdateAsync(It.IsAny<WorkOrder>()), Times.Once);
    }

    [Fact]
    public async Task DeleteWorkOrderAsync_ShouldCallRepositoryDelete()
    {
        var workOrder = new WorkOrder { Id = "wo-001" };
        _workOrderRepoMock.Setup(r => r.GetByIdAsync("wo-001"))
            .ReturnsAsync(workOrder);

        await _sut.DeleteWorkOrderAsync("wo-001");

        _workOrderRepoMock.Verify(r => r.DeleteAsync("wo-001"), Times.Once);
    }

    [Fact]
    public async Task GetAllPlansAsync_ShouldReturnAllPlans()
    {
        var plans = new List<SchedulePlan>
        {
            new() { Id = "plan-001", PlanName = "Plan 1" },
            new() { Id = "plan-002", PlanName = "Plan 2" }
        };

        _scheduleRepoMock.Setup(r => r.GetAllAsync())
            .ReturnsAsync(plans);

        var result = await _sut.GetAllPlansAsync();

        result.Should().HaveCount(2);
        result[0].PlanName.Should().Be("Plan 1");
    }
}
