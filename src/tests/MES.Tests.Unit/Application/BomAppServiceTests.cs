using FluentAssertions;
using MES.Application.DTOs;
using MES.Application.Services;
using MES.Domain.Entities.Bom;
using MES.Domain.Entities.Production;
using MES.Domain.Interfaces.Repositories;
using MES.Domain.ValueObjects;
using Moq;
using Xunit;

namespace MES.Tests.Unit.Application;

public class BomAppServiceTests
{
    private readonly Mock<IBomRepository> _bomRepoMock;
    private readonly Mock<IMaterialRepository> _materialRepoMock;
    private readonly BomAppService _sut;

    public BomAppServiceTests()
    {
        _bomRepoMock = new Mock<IBomRepository>();
        _materialRepoMock = new Mock<IMaterialRepository>();
        _sut = new BomAppService(_bomRepoMock.Object, _materialRepoMock.Object);
    }

    [Fact]
    public async Task GetAllBomsAsync_ShouldUseRepositoryPagingAndPreservePageMetadata()
    {
        var bom = CreateBom("BOM-PAGE-001", "PROD-PAGE", [CreateItem("MAT-PAGE", 1)]);
        _bomRepoMock.Setup(r => r.CountAsync(It.IsAny<CancellationToken>())).ReturnsAsync(42);
        _bomRepoMock.Setup(r => r.GetPagedAsync(3, 5, It.IsAny<CancellationToken>())).ReturnsAsync([bom]);

        var result = await _sut.GetAllBomsAsync(page: 3, pageSize: 5);

        result.Page.Should().Be(3);
        result.PageSize.Should().Be(5);
        result.TotalCount.Should().Be(42);
        result.Items.Should().ContainSingle(i => i.BomCode == "BOM-PAGE-001" && i.ItemCount == 1);
        _bomRepoMock.Verify(r => r.GetPagedAsync(3, 5, It.IsAny<CancellationToken>()), Times.Once);
        _bomRepoMock.Verify(r => r.GetAllAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task ExplodeBomAsync_ShouldMultiplyNestedQuantitiesForAuditTraceability()
    {
        var leaf = CreateItem("MAT-LEAF", 4);
        var parent = CreateItem("SUB-001", 2, children: [leaf]);
        var bom = CreateBom("BOM-EXP-001", "PROD-EXP", [parent]);
        _bomRepoMock.Setup(r => r.GetByIdAsync(bom.Id, It.IsAny<CancellationToken>())).ReturnsAsync(bom);

        var result = await _sut.ExplodeBomAsync(bom.Id, quantity: 3);

        result.Items.Should().ContainSingle(i => i.MaterialCode == "SUB-001");
        var subAssembly = result.Items.Single(i => i.MaterialCode == "SUB-001");
        subAssembly.TotalQuantity.Should().Be(6);
        subAssembly.Children.Should().ContainSingle(i => i.MaterialCode == "MAT-LEAF");
        subAssembly.Children[0].TotalQuantity.Should().Be(24);
    }

    [Fact]
    public async Task CheckKittingAsync_ShouldIncludeLossRateInRequiredQuantity()
    {
        var bom = CreateBom(
            "BOM-KIT-LOSS",
            "PROD-KIT",
            [CreateItem("MAT-LOSS", quantity: 10, lossRate: 0.1m)]);
        var material = Material.Create("MAT-LOSS", "Loss Material", "KG", availableQuantity: 20);
        _bomRepoMock.Setup(r => r.GetByIdAsync(bom.Id, It.IsAny<CancellationToken>())).ReturnsAsync(bom);
        _materialRepoMock.Setup(r => r.GetByCodeAsync("MAT-LOSS", It.IsAny<CancellationToken>())).ReturnsAsync(material);

        var result = await _sut.CheckKittingAsync(bom.Id, quantity: 2);

        result.AllAvailable.Should().BeFalse("10% BOM loss means 10 * 2 requires 22 KG, not the nominal 20 KG");
        result.Items.Should().ContainSingle();
        result.Items[0].RequiredQuantity.Should().Be(22);
        result.Items[0].AvailableQuantity.Should().Be(20);
        result.Items[0].ShortageQuantity.Should().Be(2);
    }

    private static BillOfMaterial CreateBom(string bomCode, string productCode, List<BomItem> items)
    {
        var bom = new BillOfMaterial(
            bomCode,
            $"BOM for {productCode}",
            new ProductCode(productCode),
            $"Product {productCode}",
            BomType.Manufacturing,
            "V1");

        foreach (var item in items)
        {
            bom.AddItem(item);
        }

        return bom;
    }

    private static BomItem CreateItem(
        string materialCode,
        decimal quantity,
        decimal? lossRate = null,
        List<BomItem>? children = null)
    {
        var item = new BomItem(
            new MaterialCode(materialCode),
            $"Material {materialCode}",
            quantity,
            "KG",
            sequence: 1,
            lossRate: lossRate);

        if (children is not null)
        {
            foreach (var child in children)
            {
                item.AddChild(child);
            }
        }

        return item;
    }
}
