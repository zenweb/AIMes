using MES.Application.DTOs;
using MES.Application.Services;
using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Quality;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Enums;
using MES.Domain.Interfaces.Repositories;
using Moq;
using FluentAssertions;
using Xunit;

namespace MES.Tests.Unit.Application;

/// <summary>
/// 设备应用服务测试
/// </summary>
public class EquipmentAppServiceTests
{
    private readonly Mock<IEquipmentRepository> _equipmentRepoMock;
    private readonly EquipmentAppService _sut;

    public EquipmentAppServiceTests()
    {
        _equipmentRepoMock = new Mock<IEquipmentRepository>();
        _sut = new EquipmentAppService(_equipmentRepoMock.Object);
    }

    [Fact]
    public async Task CreateEquipmentAsync_ShouldCreateEquipmentWithCorrectProperties()
    {
        // Arrange
        var request = new CreateEquipmentRequest
        {
            EquipmentCode = "CNC-001",
            EquipmentName = "CNC Machine 1",
            EquipmentType = "CNC",
            WorkshopId = "WS-001",
            WorkshopName = "Workshop A",
            Capacity = 100
        };

        _equipmentRepoMock.Setup(r => r.CreateAsync(It.IsAny<Equipment>()))
            .ReturnsAsync((Equipment e) => e);

        // Act
        var result = await _sut.CreateEquipmentAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.EquipmentCode.Should().Be("CNC-001");
        result.EquipmentName.Should().Be("CNC Machine 1");
        result.EquipmentType.Should().Be("CNC");
        result.Capacity.Should().Be(100);

        _equipmentRepoMock.Verify(r => r.CreateAsync(It.IsAny<Equipment>()), Times.Once);
    }

    [Fact]
    public async Task GetEquipmentByIdAsync_WhenExists_ShouldReturnEquipment()
    {
        // Arrange
        var equipment = new Equipment
        {
            Id = "eq-001",
            EquipmentCode = "CNC-001",
            EquipmentName = "CNC Machine 1",
            Status = EquipmentStatus.Running
        };

        _equipmentRepoMock.Setup(r => r.GetByIdAsync("eq-001"))
            .ReturnsAsync(equipment);

        // Act
        var result = await _sut.GetEquipmentByIdAsync("eq-001");

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be("eq-001");
        result.EquipmentCode.Should().Be("CNC-001");
        result.Status.Should().Be("Running");
    }

    [Fact]
    public async Task GetEquipmentByIdAsync_WhenNotExists_ShouldReturnNull()
    {
        // Arrange
        _equipmentRepoMock.Setup(r => r.GetByIdAsync("non-existent"))
            .ReturnsAsync((Equipment?)null);

        // Act
        var result = await _sut.GetEquipmentByIdAsync("non-existent");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetEquipmentsAsync_ShouldReturnFilteredEquipments()
    {
        // Arrange
        var equipments = new List<Equipment>
        {
            new() { Id = "eq-001", WorkshopId = "WS-001", Status = EquipmentStatus.Running },
            new() { Id = "eq-002", WorkshopId = "WS-001", Status = EquipmentStatus.Idle },
            new() { Id = "eq-003", WorkshopId = "WS-002", Status = EquipmentStatus.Running }
        };

        _equipmentRepoMock.Setup(r => r.GetByWorkshopAsync("WS-001"))
            .ReturnsAsync(equipments.Where(e => e.WorkshopId == "WS-001").ToList());

        // Act
        var result = await _sut.GetEquipmentsAsync("WS-001", null);

        // Assert
        result.Should().HaveCount(2);
        result.All(e => e.WorkshopId == "WS-001").Should().BeTrue();
    }

    [Fact]
    public async Task GetStatisticsAsync_ShouldReturnCorrectStatistics()
    {
        // Arrange
        var equipments = new List<Equipment>
        {
            new() { Status = EquipmentStatus.Running },
            new() { Status = EquipmentStatus.Running },
            new() { Status = EquipmentStatus.Idle },
            new() { Status = EquipmentStatus.Maintenance },
            new() { Status = EquipmentStatus.Fault }
        };

        _equipmentRepoMock.Setup(r => r.GetAllAsync())
            .ReturnsAsync(equipments);

        // Act
        var result = await _sut.GetStatisticsAsync();

        // Assert
        result.TotalCount.Should().Be(5);
        result.RunningCount.Should().Be(2);
        result.IdleCount.Should().Be(1);
        result.MaintenanceCount.Should().Be(1);
        result.FaultCount.Should().Be(1);
        result.UtilizationRate.Should().BeApproximately(40.0, 0.01); // 2/5 * 100
    }

    [Fact]
    public async Task UpdateStatusAsync_ShouldUpdateEquipmentStatus()
    {
        // Arrange
        var equipment = new Equipment
        {
            Id = "eq-001",
            Status = EquipmentStatus.Available
        };

        _equipmentRepoMock.Setup(r => r.GetByIdAsync("eq-001"))
            .ReturnsAsync(equipment);
        _equipmentRepoMock.Setup(r => r.UpdateAsync(It.IsAny<Equipment>()))
            .ReturnsAsync((Equipment e) => e);

        // Act
        var result = await _sut.UpdateStatusAsync("eq-001", "Running");

        // Assert
        result.Status.Should().Be("Running");
        _equipmentRepoMock.Verify(r => r.UpdateAsync(It.IsAny<Equipment>()), Times.Once);
    }

    [Fact]
    public async Task GetMaintenanceHistoryAsync_ShouldReturnMaintenanceRecords()
    {
        // Arrange
        var records = new List<MaintenanceRecord>
        {
            new() { Id = "maint-001", EquipmentId = "eq-001", MaintenanceType = "Preventive" },
            new() { Id = "maint-002", EquipmentId = "eq-001", MaintenanceType = "Corrective" }
        };

        _equipmentRepoMock.Setup(r => r.GetFailureHistoryAsync("eq-001"))
            .ReturnsAsync(records);

        // Act
        var result = await _sut.GetMaintenanceHistoryAsync("eq-001");

        // Assert
        result.Should().HaveCount(2);
        result.All(r => r.EquipmentId == "eq-001").Should().BeTrue();
    }
}
