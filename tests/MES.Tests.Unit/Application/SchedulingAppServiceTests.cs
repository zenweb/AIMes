using MES.Application.DTOs;
using MES.Application.Services;
using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Quality;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Enums;
using MES.Domain.Interfaces.Repositories;
using MES.AI.Agents;
using Moq;
using FluentAssertions;
using Xunit;

namespace MES.Tests.Unit.Application;

/// <summary>
/// 排产应用服务测试
/// </summary>
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
        
        // 创建一个mock kernel和llmGateway来构造SchedulingAgent
        // 在实际测试中，应该使用更完整的mock
        _sut = new SchedulingAppService(
            _workOrderRepoMock.Object,
            _equipmentRepoMock.Object,
            _materialRepoMock.Object,
            _scheduleRepoMock.Object,
            null!); // 实际测试中需要mock
    }

    [Fact]
    public async Task CreateWorkOrderAsync_ShouldCreateWorkOrderWithCorrectProperties()
    {
        // Arrange
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

        // Act
        var result = await _sut.CreateWorkOrderAsync(request);

        // Assert
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
        // Arrange
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

        // Act
        var result = await _sut.GetWorkOrderByIdAsync("wo-001");

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be("wo-001");
        result.OrderNumber.Should().Be("WO-001");
    }

    [Fact]
    public async Task GetWorkOrderByIdAsync_WhenNotExists_ShouldReturnNull()
    {
        // Arrange
        _workOrderRepoMock.Setup(r => r.GetByIdAsync("non-existent"))
            .ReturnsAsync((WorkOrder?)null);

        // Act
        var result = await _sut.GetWorkOrderByIdAsync("non-existent");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task UpdateWorkOrderStatusAsync_ShouldUpdateStatus()
    {
        // Arrange
        var workOrder = new WorkOrder
        {
            Id = "wo-001",
            Status = WorkOrderStatus.Created
        };

        _workOrderRepoMock.Setup(r => r.GetByIdAsync("wo-001"))
            .ReturnsAsync(workOrder);
        _workOrderRepoMock.Setup(r => r.UpdateAsync(It.IsAny<WorkOrder>()))
            .ReturnsAsync((WorkOrder w) => w);

        // Act
        var result = await _sut.UpdateWorkOrderStatusAsync("wo-001", "Scheduled");

        // Assert
        result.Status.Should().Be("Scheduled");
        _workOrderRepoMock.Verify(r => r.UpdateAsync(It.IsAny<WorkOrder>()), Times.Once);
    }

    [Fact]
    public async Task DeleteWorkOrderAsync_ShouldCallRepositoryDelete()
    {
        // Arrange
        var workOrder = new WorkOrder { Id = "wo-001" };
        _workOrderRepoMock.Setup(r => r.GetByIdAsync("wo-001"))
            .ReturnsAsync(workOrder);

        // Act
        await _sut.DeleteWorkOrderAsync("wo-001");

        // Assert
        _workOrderRepoMock.Verify(r => r.DeleteAsync("wo-001"), Times.Once);
    }

    [Fact]
    public async Task GetAllPlansAsync_ShouldReturnAllPlans()
    {
        // Arrange
        var plans = new List<SchedulePlan>
        {
            new() { Id = "plan-001", PlanName = "Plan 1" },
            new() { Id = "plan-002", PlanName = "Plan 2" }
        };

        _scheduleRepoMock.Setup(r => r.GetAllAsync())
            .ReturnsAsync(plans);

        // Act
        var result = await _sut.GetAllPlansAsync();

        // Assert
        result.Should().HaveCount(2);
        result[0].PlanName.Should().Be("Plan 1");
    }
}
