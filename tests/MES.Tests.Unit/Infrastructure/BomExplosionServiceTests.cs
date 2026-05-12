using MES.Domain.Entities.Bom;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Interfaces.Repositories;
using MES.Domain.ValueObjects;
using MES.Infrastructure.Services;
using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Xunit;

namespace MES.Tests.Unit.Infrastructure;

public class BomExplosionServiceTests
{
    private readonly Mock<IBomRepository> _bomRepoMock;
    private readonly BomExplosionService _service;

    public BomExplosionServiceTests()
    {
        _bomRepoMock = new Mock<IBomRepository>();
        _service = new BomExplosionService(_bomRepoMock.Object, NullLogger<BomExplosionService>.Instance);
    }

    [Fact]
    public async Task ExplodeAsync_SingleLevel_ReturnsFlattenedMaterials()
    {
        var bom = CreateBom("BOM-001", "PROD-A", items:
        [
            CreateBomItem("MAT-001", "Material 1", 2),
            CreateBomItem("MAT-002", "Material 2", 1.5m),
        ]);

        _bomRepoMock.Setup(r => r.GetByProductCodeAsync(new ProductCode("PROD-A"), It.IsAny<CancellationToken>()))
            .ReturnsAsync([bom]);

        var result = await _service.ExplodeAsync("PROD-A");

        result.Should().HaveCount(2);
        result.Should().Contain(m => m.MaterialCode == "MAT-001" && m.QuantityPerUnit == 2);
        result.Should().Contain(m => m.MaterialCode == "MAT-002" && m.QuantityPerUnit == 1.5m);
    }

    [Fact]
    public async Task ExplodeAsync_MultiLevel_ReturnsAggregatedQuantities()
    {
        var child1 = CreateBomItem("MAT-001", "Raw Material", 2);    // level 2
        var child2 = CreateBomItem("MAT-002", "Sub Assembly", 3);    // level 2
        var parent = CreateBomItem("SUB-001", "Sub Component", 2, children: [child1, child2]); // level 1
        var bom = CreateBom("BOM-001", "PROD-A", items: [parent]);

        _bomRepoMock.Setup(r => r.GetByProductCodeAsync(new ProductCode("PROD-A"), It.IsAny<CancellationToken>()))
            .ReturnsAsync([bom]);

        var result = await _service.ExplodeAsync("PROD-A");

        // SUB-001 has children, so it's not a leaf — should not appear in output
        result.Should().NotContain(m => m.MaterialCode == "SUB-001");
        // MAT-001: parent qty(2) * child qty(2) = 4
        result.Should().Contain(m => m.MaterialCode == "MAT-001" && m.QuantityPerUnit == 4);
        // MAT-002: parent qty(2) * child qty(3) = 6
        result.Should().Contain(m => m.MaterialCode == "MAT-002" && m.QuantityPerUnit == 6);
    }

    [Fact]
    public async Task ExplodeAsync_NoBom_ReturnsEmpty()
    {
        _bomRepoMock.Setup(r => r.GetByProductCodeAsync(It.IsAny<ProductCode>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        var result = await _service.ExplodeAsync("NONEXISTENT");

        result.Should().BeEmpty();
    }

    [Fact]
    public async Task ExplodeAsync_ThreeLevels_CorrectlyMultiplies()
    {
        // Level 3 leaf
        var rawMat = CreateBomItem("RAW-001", "Raw Ore", 5);
        // Level 2: intermediate needs 3x raw mat
        var inter = CreateBomItem("INT-001", "Intermediate", 3, children: [rawMat]);
        // Level 1: finished product needs 2x intermediate
        var finished = CreateBomItem("FIN-001", "Finished Part", 2, children: [inter]);
        var bom = CreateBom("BOM-001", "PROD-X", items: [finished]);

        _bomRepoMock.Setup(r => r.GetByProductCodeAsync(It.IsAny<ProductCode>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([bom]);

        var result = await _service.ExplodeAsync("PROD-X");

        // RAW-001: 2 (finished) * 3 (inter) * 5 (raw) = 30
        result.Should().ContainSingle(m => m.MaterialCode == "RAW-001");
        result.First(m => m.MaterialCode == "RAW-001").QuantityPerUnit.Should().Be(30);
    }

    [Fact]
    public async Task ExplodeBatchAsync_MultipleProducts_ReturnsAll()
    {
        var bomA = CreateBom("BOM-A", "PROD-A", items: [CreateBomItem("MAT-A", "Material A", 1)]);
        var bomB = CreateBom("BOM-B", "PROD-B", items: [CreateBomItem("MAT-B", "Material B", 2)]);

        _bomRepoMock.Setup(r => r.GetByProductCodeAsync(new ProductCode("PROD-A"), It.IsAny<CancellationToken>()))
            .ReturnsAsync([bomA]);
        _bomRepoMock.Setup(r => r.GetByProductCodeAsync(new ProductCode("PROD-B"), It.IsAny<CancellationToken>()))
            .ReturnsAsync([bomB]);

        var result = await _service.ExplodeBatchAsync(["PROD-A", "PROD-B"]);

        result.Should().HaveCount(2);
        result["PROD-A"].Should().ContainSingle(m => m.MaterialCode == "MAT-A");
        result["PROD-B"].Should().ContainSingle(m => m.MaterialCode == "MAT-B");
    }

    [Fact]
    public async Task ExplodeAsync_PrefersReleasedVersion()
    {
        var draftBom = CreateBom("BOM-DRAFT", "PROD-A", items: [CreateBomItem("MAT-OLD", "Old", 1)]);
        var releasedBom = CreateBom("BOM-REL", "PROD-A", items: [CreateBomItem("MAT-NEW", "New", 1)]);
        releasedBom.Release(DateTime.UtcNow, "tester");

        _bomRepoMock.Setup(r => r.GetByProductCodeAsync(new ProductCode("PROD-A"), It.IsAny<CancellationToken>()))
            .ReturnsAsync([draftBom, releasedBom]);

        var result = await _service.ExplodeAsync("PROD-A");

        // Should prefer the Released version (releasedBom → MAT-NEW)
        result.Should().ContainSingle();
        result[0].MaterialCode.Should().Be("MAT-NEW");
    }

    #region Helpers

    private static BillOfMaterial CreateBom(string bomCode, string productCode, List<BomItem> items)
    {
        var bom = new BillOfMaterial(bomCode, $"BOM for {productCode}",
            new ProductCode(productCode), $"Product {productCode}",
            BomType.Manufacturing, "V1");
        foreach (var item in items)
            bom.AddItem(item);
        return bom;
    }

    private static BomItem CreateBomItem(string materialCode, string materialName, decimal quantity,
        List<BomItem>? children = null)
    {
        var item = new BomItem(
            new MaterialCode(materialCode),
            materialName,
            quantity,
            "PCS",
            1);
        if (children is not null)
        {
            foreach (var child in children)
                item.AddChild(child);
        }
        return item;
    }

    #endregion
}
