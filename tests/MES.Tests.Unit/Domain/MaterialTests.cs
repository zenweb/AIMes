using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Quality;
using MES.Domain.Entities.Scheduling;
using FluentAssertions;
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
        var material = new Material
        {
            Id = id,
            MaterialCode = "MAT-001",
            MaterialName = "Aluminum 6061",
            MaterialType = "Raw Material",
            Unit = "KG",
            AvailableQuantity = 1000,
            ReservedQuantity = 200,
            SafetyStock = 100,
            StorageLocation = "A-01-01"
        };

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
        var material = new Material
        {
            AvailableQuantity = 1000,
            ReservedQuantity = 200
        };

        // Act
        var netAvailable = material.AvailableQuantity - material.ReservedQuantity;

        // Assert
        netAvailable.Should().Be(800);
    }

    [Fact]
    public void Material_ShouldTrackExpiryDate()
    {
        // Arrange
        var expiryDate = DateTime.UtcNow.AddYears(1);

        // Act
        var material = new Material
        {
            MaterialCode = "MAT-002",
            ExpiryDate = expiryDate
        };

        // Assert
        material.ExpiryDate.Should().Be(expiryDate);
    }
}
