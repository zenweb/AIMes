using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Quality;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace MES.Tests.Unit.Domain;

/// <summary>
/// 设备实体测试
/// </summary>
public class EquipmentTests
{
    [Fact]
    public void Equipment_ShouldInitializeWithDefaultValues()
    {
        // Arrange & Act
        var equipment = new Equipment();

        // Assert
        equipment.Id.Should().NotBeNullOrEmpty();
        equipment.EquipmentCode.Should().BeEmpty();
        equipment.EquipmentName.Should().BeEmpty();
        equipment.EquipmentType.Should().BeEmpty();
        equipment.WorkshopId.Should().BeEmpty();
        equipment.Status.Should().Be(EquipmentStatus.Available);
        equipment.Capacity.Should().Be(0);
        equipment.UtilizationRate.Should().Be(0);
        equipment.Parameters.Should().NotBeNull();
        equipment.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public void Equipment_ShouldSetPropertiesCorrectly()
    {
        // Arrange
        var id = Guid.NewGuid().ToString();
        var now = DateTime.UtcNow;

        // Act
        var equipment = new Equipment
        {
            Id = id,
            EquipmentCode = "CNC-001",
            EquipmentName = "CNC Machine 1",
            EquipmentType = "CNC",
            WorkshopId = "WS-001",
            WorkshopName = "Workshop A",
            Status = EquipmentStatus.Running,
            Capacity = 100,
            UtilizationRate = 85.5,
            CurrentWorkOrderId = "WO-001",
            LastMaintenanceDate = now.AddDays(-30),
            NextMaintenanceDate = now.AddDays(60)
        };

        // Assert
        equipment.Id.Should().Be(id);
        equipment.EquipmentCode.Should().Be("CNC-001");
        equipment.EquipmentName.Should().Be("CNC Machine 1");
        equipment.Status.Should().Be(EquipmentStatus.Running);
        equipment.Capacity.Should().Be(100);
        equipment.UtilizationRate.Should().Be(85.5);
    }

    [Theory]
    [InlineData(EquipmentStatus.Available)]
    [InlineData(EquipmentStatus.Running)]
    [InlineData(EquipmentStatus.Idle)]
    [InlineData(EquipmentStatus.Maintenance)]
    [InlineData(EquipmentStatus.Fault)]
    [InlineData(EquipmentStatus.Offline)]
    public void Equipment_ShouldAcceptAllValidStatuses(EquipmentStatus status)
    {
        // Arrange & Act
        var equipment = new Equipment { Status = status };

        // Assert
        equipment.Status.Should().Be(status);
    }

    [Fact]
    public void Equipment_ParametersShouldBeModifiable()
    {
        // Arrange
        var equipment = new Equipment();

        // Act
        equipment.Parameters["Temperature"] = 25.5;
        equipment.Parameters["Speed"] = 1000;

        // Assert
        equipment.Parameters.Should().ContainKey("Temperature");
        equipment.Parameters["Temperature"].Should().Be(25.5);
        equipment.Parameters.Should().HaveCount(2);
    }
}
