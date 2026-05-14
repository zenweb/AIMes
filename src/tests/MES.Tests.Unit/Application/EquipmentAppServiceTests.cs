using FluentAssertions;
using MES.Application.DTOs;
using MES.Application.Services;
using MES.Domain.Entities.Equipment;
using MES.Domain.Enums;
using MES.Domain.Interfaces.Repositories;
using Moq;
using Xunit;

namespace MES.Tests.Unit.Application;

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
        var request = new CreateEquipmentRequest
        {
            EquipmentCode = "CNC-001",
            EquipmentName = "CNC Machine 1",
            EquipmentType = "CNC",
            WorkshopId = "WS-001",
            WorkshopName = "Workshop A",
            Capacity = 100
        };

        _equipmentRepoMock.Setup(r => r.CreateAsync(It.IsAny<Equipment>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Equipment e, CancellationToken _) => e);

        var result = await _sut.CreateEquipmentAsync(request);

        result.Should().NotBeNull();
        result.EquipmentCode.Should().Be("CNC-001");
        result.EquipmentName.Should().Be("CNC Machine 1");
        result.EquipmentType.Should().Be("CNC");
        result.Capacity.Should().Be(100);

        _equipmentRepoMock.Verify(r => r.CreateAsync(It.IsAny<Equipment>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetEquipmentByIdAsync_WhenExists_ShouldReturnEquipment()
    {
        var equipment = Equipment.Create("CNC-001", "CNC Machine 1", "CNC", "WS-001", "Workshop A", 100);

        _equipmentRepoMock.Setup(r => r.GetByIdAsync(equipment.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(equipment);

        var result = await _sut.GetEquipmentByIdAsync(equipment.Id);

        result.Should().NotBeNull();
        result!.Id.Should().Be(equipment.Id);
        result.EquipmentCode.Should().Be("CNC-001");
        result.Status.Should().Be("Available");
    }

    [Fact]
    public async Task GetEquipmentByIdAsync_WhenNotExists_ShouldReturnNull()
    {
        _equipmentRepoMock.Setup(r => r.GetByIdAsync("non-existent", It.IsAny<CancellationToken>()))
            .ReturnsAsync((Equipment?)null);

        var result = await _sut.GetEquipmentByIdAsync("non-existent");

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetEquipmentsAsync_ShouldReturnFilteredEquipments()
    {
        var eq1 = Equipment.Create("CNC-001", "CNC Machine 1", "CNC", "WS-001", "Workshop A", 100);
        var eq2 = Equipment.Create("CNC-002", "CNC Machine 2", "CNC", "WS-001", "Workshop A", 100);
        var eq3 = Equipment.Create("CNC-003", "CNC Machine 3", "CNC", "WS-002", "Workshop B", 100);

        _equipmentRepoMock.Setup(r => r.GetByWorkshopAsync("WS-001", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Equipment> { eq1, eq2 });

        var result = await _sut.GetEquipmentsAsync("WS-001", null);

        result.Items.Should().HaveCount(2);
        result.Items.All(e => e.WorkshopId == "WS-001").Should().BeTrue();
    }

    [Fact]
    public async Task GetStatisticsAsync_ShouldReturnCorrectStatistics()
    {
        var eq1 = Equipment.Create("CNC-001", "CNC 1", "CNC", "WS-001", "A", 100);
        eq1.StartWork("WO-001");

        var eq2 = Equipment.Create("CNC-002", "CNC 2", "CNC", "WS-001", "A", 100);
        eq2.StartWork("WO-002");

        var eq3 = Equipment.Create("CNC-003", "CNC 3", "CNC", "WS-001", "A", 100);
        eq3.SetIdle();

        var eq4 = Equipment.Create("CNC-004", "CNC 4", "CNC", "WS-001", "A", 100);
        eq4.SetMaintenance();

        var eq5 = Equipment.Create("CNC-005", "CNC 5", "CNC", "WS-001", "A", 100);
        eq5.StartWork("WO-003");
        eq5.SetFault();

        _equipmentRepoMock.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Equipment> { eq1, eq2, eq3, eq4, eq5 });

        var result = await _sut.GetStatisticsAsync();

        result.TotalCount.Should().Be(5);
        result.RunningCount.Should().Be(2);
        result.IdleCount.Should().Be(1);
        result.MaintenanceCount.Should().Be(1);
        result.FaultCount.Should().Be(1);
        result.UtilizationRate.Should().BeApproximately(40.0, 0.01);
    }

    [Fact]
    public async Task UpdateStatusAsync_ShouldUpdateEquipmentStatus()
    {
        var equipment = Equipment.Create("CNC-001", "CNC Machine 1", "CNC", "WS-001", "Workshop A", 100);

        _equipmentRepoMock.Setup(r => r.GetByIdAsync(equipment.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(equipment);
        _equipmentRepoMock.Setup(r => r.UpdateAsync(It.IsAny<Equipment>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Equipment e, CancellationToken _) => e);

        var result = await _sut.UpdateStatusAsync(equipment.Id, "Idle");

        result.Status.Should().Be("Idle");
        _equipmentRepoMock.Verify(r => r.UpdateAsync(It.IsAny<Equipment>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetMaintenanceHistoryAsync_ShouldReturnMaintenanceRecords()
    {
        var records = new List<MaintenanceRecord>
        {
            new() { Id = "maint-001", EquipmentId = "eq-001", MaintenanceType = "Preventive" },
            new() { Id = "maint-002", EquipmentId = "eq-001", MaintenanceType = "Corrective" }
        };

        _equipmentRepoMock.Setup(r => r.GetFailureHistoryAsync("eq-001"))
            .ReturnsAsync(records);

        var result = await _sut.GetMaintenanceHistoryAsync("eq-001");

        result.Should().HaveCount(2);
        result.All(r => r.EquipmentId == "eq-001").Should().BeTrue();
    }
}
