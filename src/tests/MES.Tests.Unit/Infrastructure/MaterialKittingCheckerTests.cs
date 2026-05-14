using FluentAssertions;
using MES.Domain.Entities.Bom;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Interfaces.Repositories;
using MES.Domain.ValueObjects;
using MES.Infrastructure.Services;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Xunit;

namespace MES.Tests.Unit.Infrastructure;

public class MaterialKittingCheckerTests
{
    private readonly Mock<IBomRepository> _bomRepoMock;
    private readonly MaterialKittingChecker _checker;

    public MaterialKittingCheckerTests()
    {
        _bomRepoMock = new Mock<IBomRepository>();
        var bomService = new BomExplosionService(_bomRepoMock.Object, NullLogger<BomExplosionService>.Instance);
        _checker = new MaterialKittingChecker(bomService);
    }

    [Fact]
    public async Task CheckAsync_SufficientMaterials_ReturnsAllSufficient()
    {
        SetupBom("PROD-A", [("MAT-001", 2), ("MAT-002", 1)]);
        var availabilities = new List<MaterialAvailabilitySummary>
        {
            CreateMatAvail("MAT-001", 100, 0),
            CreateMatAvail("MAT-002", 50, 0),
        };

        var result = await _checker.CheckAsync("PROD-A", 10, availabilities);

        result.IsAllSufficient.Should().BeTrue();
        result.ShortageCount.Should().Be(0);
        result.Items.Should().HaveCount(2);
    }

    [Fact]
    public async Task CheckAsync_InsufficientMaterial_ReturnsShortage()
    {
        SetupBom("PROD-A", [("MAT-001", 5)]);   // need 5/unit
        var availabilities = new List<MaterialAvailabilitySummary>
        {
            CreateMatAvail("MAT-001", 10, 5),    // only 5 available (10-5 reserved)
        };

        var result = await _checker.CheckAsync("PROD-A", 3, availabilities);

        // Required = 5 × 3 = 15, Available = 5, Shortage = 10
        result.IsAllSufficient.Should().BeFalse();
        result.ShortageCount.Should().Be(1);
        result.Items[0].ShortageQuantity.Should().Be(10);
    }

    [Fact]
    public async Task CheckAsync_MissingMaterial_ReturnsShortage()
    {
        SetupBom("PROD-A", [("MAT-NOEXIST", 1)]);
        var availabilities = new List<MaterialAvailabilitySummary>();

        var result = await _checker.CheckAsync("PROD-A", 1, availabilities);

        result.IsAllSufficient.Should().BeFalse();
        result.Items[0].AvailableQuantity.Should().Be(0);
        result.Items[0].ShortageQuantity.Should().Be(1);
    }

    [Fact]
    public async Task CheckAsync_ZeroQuantity_NoShortage()
    {
        SetupBom("PROD-A", [("MAT-001", 2)]);
        var availabilities = new List<MaterialAvailabilitySummary>
        {
            CreateMatAvail("MAT-001", 0, 0),
        };

        var result = await _checker.CheckAsync("PROD-A", 0, availabilities);

        // Required = 2 × 0 = 0, Shortage = 0
        result.IsAllSufficient.Should().BeTrue();
    }

    [Fact]
    public async Task CheckAsync_ExactlyEnoughAfterReserve_IsSufficient()
    {
        SetupBom("PROD-A", [("MAT-001", 2)]);
        var availabilities = new List<MaterialAvailabilitySummary>
        {
            CreateMatAvail("MAT-001", 25, 5),     // 20 available
        };

        var result = await _checker.CheckAsync("PROD-A", 10, availabilities);

        // Required = 2 × 10 = 20, Available = 20, Shortage = 0
        result.IsAllSufficient.Should().BeTrue();
    }

    #region Helpers

    private void SetupBom(string productCode, List<(string code, decimal qty)> materials)
    {
        var bom = new BillOfMaterial($"BOM-{productCode}", $"BOM for {productCode}",
            new ProductCode(productCode), $"Product {productCode}",
            BomType.Manufacturing, "V1");
        foreach (var (code, qty) in materials)
        {
            bom.AddItem(new BomItem(new MaterialCode(code), $"Material {code}", qty, "PCS", 1));
        }
        _bomRepoMock.Setup(r => r.GetByProductCodeAsync(new ProductCode(productCode), It.IsAny<CancellationToken>()))
            .ReturnsAsync([bom]);
    }

    private static MaterialAvailabilitySummary CreateMatAvail(string code, decimal available, decimal reserved)
    {
        return new MaterialAvailabilitySummary(code, $"Material {code}", available, reserved, 10)
        {
            LastUpdatedAt = DateTime.UtcNow,
            DataSource = "WMS实时"
        };
    }

    #endregion
}
