using FluentAssertions;
using MES.Domain.Entities.Equipment;
using MES.Domain.Enums;
using Xunit;

namespace MES.Tests.Unit.Domain;

public class EquipmentTests
{
    [Fact]
    public void Create_ShouldInitializeWithCorrectProperties()
    {
        var result = Equipment.Create("CNC-001", "CNC Machine 1", "CNC", "WS-001", "Workshop A", 100);

        result.Should().NotBeNull();
        result.EquipmentCode.Should().Be("CNC-001");
        result.EquipmentName.Should().Be("CNC Machine 1");
        result.EquipmentType.Should().Be("CNC");
        result.WorkshopId.Should().Be("WS-001");
        result.WorkshopName.Should().Be("Workshop A");
        result.Capacity.Should().Be(100);
        result.Status.Should().Be(EquipmentStatus.Available);
        result.UtilizationRate.Should().Be(0);
        result.Parameters.Should().NotBeNull();
        result.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public void Create_ShouldGenerateNonEmptyId()
    {
        var result = Equipment.Create("CNC-001", "CNC Machine 1", "CNC", "WS-001", "Workshop A", 100);

        result.Id.Should().NotBeNullOrEmpty();
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Create_InvalidEquipmentCode_ShouldThrow(string? code)
    {
        var act = () => Equipment.Create(code!, "Name", "CNC", "WS-001", "Workshop A", 100);

        act.Should().Throw<ArgumentException>();
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Create_NonPositiveCapacity_ShouldThrow(double capacity)
    {
        var act = () => Equipment.Create("CNC-001", "Name", "CNC", "WS-001", "Workshop A", capacity);

        act.Should().Throw<ArgumentOutOfRangeException>();
    }

    [Fact]
    public void StartWork_ShouldSetRunningAndWorkOrder()
    {
        var eq = CreateDefaultEquipment();

        eq.StartWork("WO-001");

        eq.Status.Should().Be(EquipmentStatus.Running);
        eq.CurrentWorkOrderId.Should().Be("WO-001");
    }

    [Fact]
    public void StartWork_WhenAlreadyRunning_ShouldThrow()
    {
        var eq = CreateDefaultEquipment();
        eq.StartWork("WO-001");

        var act = () => eq.StartWork("WO-002");

        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void CompleteWork_ShouldSetAvailable()
    {
        var eq = CreateDefaultEquipment();
        eq.StartWork("WO-001");

        eq.CompleteWork();

        eq.Status.Should().Be(EquipmentStatus.Available);
        eq.CurrentWorkOrderId.Should().BeEmpty();
    }

    [Fact]
    public void CompleteWork_WhenNotRunning_ShouldThrow()
    {
        var eq = CreateDefaultEquipment();

        var act = () => eq.CompleteWork();

        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void SetIdle_ShouldTransitionToIdle()
    {
        var eq = CreateDefaultEquipment();

        eq.SetIdle();

        eq.Status.Should().Be(EquipmentStatus.Idle);
    }

    [Fact]
    public void SetIdle_WhenRunning_ShouldThrow()
    {
        var eq = CreateDefaultEquipment();
        eq.StartWork("WO-001");

        var act = () => eq.SetIdle();

        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void SetFault_ShouldTransitionToFault()
    {
        var eq = CreateDefaultEquipment();
        eq.StartWork("WO-001");

        eq.SetFault();

        eq.Status.Should().Be(EquipmentStatus.Fault);
    }

    [Fact]
    public void SetFault_WhenAvailable_ShouldThrow()
    {
        var eq = CreateDefaultEquipment();

        var act = () => eq.SetFault();

        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void SetMaintenance_ShouldTransitionToMaintenance()
    {
        var eq = CreateDefaultEquipment();

        eq.SetMaintenance();

        eq.Status.Should().Be(EquipmentStatus.Maintenance);
    }

    [Fact]
    public void SetMaintenance_WhenFault_ShouldThrow()
    {
        var eq = CreateDefaultEquipment();
        eq.StartWork("WO-001");
        eq.SetFault();

        var act = () => eq.SetMaintenance();

        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void CompleteMaintenance_ShouldSetAvailable()
    {
        var eq = CreateDefaultEquipment();
        eq.SetMaintenance();

        eq.CompleteMaintenance();

        eq.Status.Should().Be(EquipmentStatus.Available);
        eq.LastMaintenanceDate.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public void CompleteMaintenance_WhenNotInMaintenance_ShouldThrow()
    {
        var eq = CreateDefaultEquipment();

        var act = () => eq.CompleteMaintenance();

        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void SetOffline_ShouldTransitionToOffline()
    {
        var eq = CreateDefaultEquipment();

        eq.SetOffline();

        eq.Status.Should().Be(EquipmentStatus.Offline);
    }

    [Fact]
    public void SetOnline_ShouldTransitionToAvailable()
    {
        var eq = CreateDefaultEquipment();
        eq.SetOffline();

        eq.SetOnline();

        eq.Status.Should().Be(EquipmentStatus.Available);
    }

    [Fact]
    public void ScheduleMaintenance_ShouldSetDate()
    {
        var eq = CreateDefaultEquipment();
        var date = DateTime.UtcNow.AddDays(30);

        eq.ScheduleMaintenance(date);

        eq.NextMaintenanceDate.Should().Be(date);
    }

    [Fact]
    public void UpdateParameters_ShouldReplaceDictionary()
    {
        var eq = CreateDefaultEquipment();
        var parameters = new Dictionary<string, double> { { "Speed", 1000 } };

        eq.UpdateParameters(parameters);

        eq.Parameters.Should().ContainKey("Speed");
        eq.Parameters["Speed"].Should().Be(1000);
    }

    [Fact]
    public void Parameters_ShouldBeModifiable()
    {
        var eq = CreateDefaultEquipment();

        eq.Parameters["Temperature"] = 25.5;
        eq.Parameters["Speed"] = 1000;

        eq.Parameters.Should().ContainKey("Temperature");
        eq.Parameters["Temperature"].Should().Be(25.5);
        eq.Parameters.Should().HaveCount(2);
    }

    [Fact]
    public void CanStartWork_WhenAvailable_ShouldBeTrue()
    {
        var eq = CreateDefaultEquipment();

        eq.CanStartWork.Should().BeTrue();
    }

    [Fact]
    public void CanStartWork_WhenRunning_ShouldBeFalse()
    {
        var eq = CreateDefaultEquipment();
        eq.StartWork("WO-001");

        eq.CanStartWork.Should().BeFalse();
    }

    [Fact]
    public void CanCompleteWork_WhenRunning_ShouldBeTrue()
    {
        var eq = CreateDefaultEquipment();
        eq.StartWork("WO-001");

        eq.CanCompleteWork.Should().BeTrue();
    }

    [Fact]
    public void CanCompleteWork_WhenAvailable_ShouldBeFalse()
    {
        var eq = CreateDefaultEquipment();

        eq.CanCompleteWork.Should().BeFalse();
    }

    [Fact]
    public void TransitionTo_Idle_ShouldTransition()
    {
        var eq = CreateDefaultEquipment();

        eq.TransitionTo(EquipmentStatus.Idle);

        eq.Status.Should().Be(EquipmentStatus.Idle);
    }

    [Fact]
    public void TransitionTo_InvalidTarget_ShouldThrow()
    {
        var eq = CreateDefaultEquipment();

        var act = () => eq.TransitionTo((EquipmentStatus)99);

        act.Should().Throw<InvalidOperationException>();
    }

    private static Equipment CreateDefaultEquipment()
    {
        return Equipment.Create("CNC-001", "CNC Machine 1", "CNC", "WS-001", "Workshop A", 100);
    }
}
