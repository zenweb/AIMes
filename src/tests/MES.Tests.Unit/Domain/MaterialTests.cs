using FluentAssertions;
using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Quality;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Exceptions;
using Xunit;

namespace MES.Tests.Unit.Domain;

/// <summary>
/// 物料实体测试
/// </summary>
public class MaterialTests
{
    [Fact]
    public void Material_ShouldInitializeWithDefaultValues()
    {
        // Arrange & Act
        var material = new Material();

        // Assert
        material.Id.Should().NotBeNullOrEmpty();
        material.MaterialCode.Should().BeEmpty();
        material.MaterialName.Should().BeEmpty();
        material.MaterialType.Should().BeEmpty();
        material.Unit.Should().BeEmpty();
        material.AvailableQuantity.Should().Be(0);
        material.ReservedQuantity.Should().Be(0);
        material.SafetyStock.Should().Be(0);
        material.StorageLocation.Should().BeEmpty();
        material.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public void Material_ShouldSetPropertiesCorrectly()
    {
        // Arrange
        var id = Guid.NewGuid().ToString();

        // Act
        var material = Material.Create(
            "MAT-001",
            "Aluminum 6061",
            "KG",
            safetyStock: 100,
            storageLocation: "A-01-01",
            materialType: "Raw Material",
            availableQuantity: 1000,
            id: id);
        material.Reserve(200);

        // Assert
        material.Id.Should().Be(id);
        material.MaterialCode.Should().Be("MAT-001");
        material.MaterialName.Should().Be("Aluminum 6061");
        material.AvailableQuantity.Should().Be(1000);
        material.ReservedQuantity.Should().Be(200);
    }

    [Fact]
    public void Material_NetAvailableQuantityShouldBeCalculatedCorrectly()
    {
        // Arrange
        var material = Material.Create("MAT-001", "Aluminum 6061", "KG", availableQuantity: 1000);
        material.Reserve(200);

        // Act
        var netAvailable = material.NetAvailable;

        // Assert
        netAvailable.Should().Be(800);
    }

    [Fact]
    public void Material_ShouldInitializeExpiryDateAsEmpty()
    {
        // Act
        var material = Material.Create("MAT-002", "Expiring Material", "PCS");

        // Assert
        material.ExpiryDate.Should().BeNull();
    }

    [Fact]
    public void Reserve_WhenQuantityExceedsNetAvailable_ShouldThrowDomainRuleViolation()
    {
        var material = Material.Create("MAT-003", "Reserved Material", "PCS", availableQuantity: 100);
        material.Reserve(80);

        var act = () => material.Reserve(30);

        act.Should().Throw<DomainRuleViolationException>()
            .WithMessage("可用库存不足：需要 30，可用 20");
    }

    [Fact]
    public void Consume_WhenQuantityExceedsAvailable_ShouldThrowDomainRuleViolation()
    {
        var material = Material.Create("MAT-004", "Consumable Material", "PCS", availableQuantity: 10);

        var act = () => material.Consume(11);

        act.Should().Throw<DomainRuleViolationException>()
            .WithMessage("库存不足：需要消耗 11，可用 10");
    }
}
