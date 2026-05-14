using FluentAssertions;
using MES.Application.DTOs;
using MES.Application.Services;
using MES.Domain.Entities.Inventory;
using MES.Domain.Entities.Production;
using MES.Domain.Interfaces.Repositories;
using Moq;
using Xunit;

namespace MES.Tests.Unit.Application;

public class InventoryAppServiceTests
{
    private readonly Mock<IMaterialRepository> _materialRepoMock;
    private readonly Mock<IStockTransactionRepository> _txRepoMock;
    private readonly InventoryAppService _sut;

    public InventoryAppServiceTests()
    {
        _materialRepoMock = new Mock<IMaterialRepository>();
        _txRepoMock = new Mock<IStockTransactionRepository>();
        _sut = new InventoryAppService(_materialRepoMock.Object, _txRepoMock.Object);
    }

    [Fact]
    public async Task GetDashboardAsync_ShouldReturnCorrectCounts()
    {
        var materials = new List<Material>
        {
            new() { Id = "m1", MaterialCode = "AL-6061", AvailableQuantity = 1000, ReservedQuantity = 0, SafetyStock = 100 },
            new() { Id = "m2", MaterialCode = "STEEL-001", AvailableQuantity = 50, ReservedQuantity = 30, SafetyStock = 100 },
            new() { Id = "m3", MaterialCode = "BRASS-001", AvailableQuantity = 0, ReservedQuantity = 0, SafetyStock = 50 },
        };
        _materialRepoMock.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(materials);
        _txRepoMock.Setup(r => r.CountTodayAsync(It.IsAny<CancellationToken>())).ReturnsAsync(5);

        var result = await _sut.GetDashboardAsync();

        result.TotalMaterials.Should().Be(3);
        result.LowStockCount.Should().Be(1); // m2: 50-30=20 < 100
        result.OutOfStockCount.Should().Be(1); // m3: 0
        result.TodayTransactions.Should().Be(5);
    }

    [Fact]
    public async Task GetAllItemsAsync_ShouldReturnAllMaterials()
    {
        var materials = new List<Material>
        {
            new() { Id = "m1", MaterialCode = "AL-6061", MaterialName = "铝合金", MaterialType = "原材料", Unit = "KG", AvailableQuantity = 1000 },
            new() { Id = "m2", MaterialCode = "STEEL-001", MaterialName = "钢材", Unit = "KG", AvailableQuantity = 500 },
        };
        _materialRepoMock.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(materials);

        var result = await _sut.GetAllItemsAsync();

        result.Should().HaveCount(2);
        result.Should().Contain(i => i.MaterialCode == "AL-6061");
    }

    [Fact]
    public async Task GetItemByCodeAsync_WhenExists_ShouldReturnItem()
    {
        var material = new Material { Id = "m1", MaterialCode = "AL-6061", MaterialName = "铝合金" };
        _materialRepoMock.Setup(r => r.GetByCodeAsync("AL-6061")).ReturnsAsync(material);

        var result = await _sut.GetItemByCodeAsync("AL-6061");

        result.Should().NotBeNull();
        result!.MaterialCode.Should().Be("AL-6061");
    }

    [Fact]
    public async Task GetItemByCodeAsync_WhenNotExists_ShouldReturnNull()
    {
        _materialRepoMock.Setup(r => r.GetByCodeAsync("NONEXIST")).ReturnsAsync((Material?)null);

        var result = await _sut.GetItemByCodeAsync("NONEXIST");

        result.Should().BeNull();
    }

    [Fact]
    public async Task StockInAsync_ShouldIncreaseQuantityAndCreateTransaction()
    {
        var material = new Material { Id = "m1", MaterialCode = "AL-6061", MaterialName = "铝合金", AvailableQuantity = 100 };
        _materialRepoMock.Setup(r => r.GetByCodeAsync("AL-6061")).ReturnsAsync(material);
        _materialRepoMock.Setup(r => r.UpdateAsync(It.IsAny<Material>())).ReturnsAsync(material);

        var request = new StockInRequest { MaterialCode = "AL-6061", Quantity = 50, Warehouse = "WH-01", Operator = "test-op" };

        var result = await _sut.StockInAsync(request);

        result.TransactionType.Should().Be("StockIn");
        result.Quantity.Should().Be(50);
        result.BalanceBefore.Should().Be(100);
        result.BalanceAfter.Should().Be(150);
        result.Warehouse.Should().Be("WH-01");
        material.AvailableQuantity.Should().Be(150);
        _txRepoMock.Verify(r => r.AddAsync(It.IsAny<StockTransaction>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task StockOutAsync_ShouldDecreaseQuantityAndCreateTransaction()
    {
        var material = new Material { Id = "m1", MaterialCode = "AL-6061", MaterialName = "铝合金", AvailableQuantity = 100, ReservedQuantity = 0 };
        _materialRepoMock.Setup(r => r.GetByCodeAsync("AL-6061")).ReturnsAsync(material);
        _materialRepoMock.Setup(r => r.UpdateAsync(It.IsAny<Material>())).ReturnsAsync(material);

        var result = await _sut.StockOutAsync(new StockOutRequest { MaterialCode = "AL-6061", Quantity = 30, Operator = "test-op" });

        result.TransactionType.Should().Be("StockOut");
        result.Quantity.Should().Be(30);
        result.BalanceBefore.Should().Be(100);
        result.BalanceAfter.Should().Be(70);
        material.AvailableQuantity.Should().Be(70);
        _txRepoMock.Verify(r => r.AddAsync(It.IsAny<StockTransaction>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task StockOutAsync_WhenInsufficientStock_ShouldThrow()
    {
        var material = new Material { Id = "m1", MaterialCode = "AL-6061", AvailableQuantity = 20, ReservedQuantity = 10 };
        _materialRepoMock.Setup(r => r.GetByCodeAsync("AL-6061")).ReturnsAsync(material);

        var act = () => _sut.StockOutAsync(new StockOutRequest { MaterialCode = "AL-6061", Quantity = 30 });

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*可用库存不足*");
    }

    [Fact]
    public async Task TransferAsync_ShouldMoveStockAndUpdateLocation()
    {
        var material = new Material { Id = "m1", MaterialCode = "AL-6061", AvailableQuantity = 100, ReservedQuantity = 0, StorageLocation = "WH-A" };
        _materialRepoMock.Setup(r => r.GetByCodeAsync("AL-6061")).ReturnsAsync(material);
        _materialRepoMock.Setup(r => r.UpdateAsync(It.IsAny<Material>())).ReturnsAsync(material);

        var result = await _sut.TransferAsync(new TransferRequest
        {
            MaterialCode = "AL-6061",
            Quantity = 40,
            FromWarehouse = "WH-A",
            ToWarehouse = "WH-B",
            Operator = "test-op"
        });

        result.TransactionType.Should().Be("TransferOut");
        result.Quantity.Should().Be(40);
        material.StorageLocation.Should().Be("WH-B");
        material.AvailableQuantity.Should().Be(60);
        _txRepoMock.Verify(r => r.AddAsync(It.IsAny<StockTransaction>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task AdjustAsync_ShouldSetExactQuantity()
    {
        var material = new Material { Id = "m1", MaterialCode = "AL-6061", AvailableQuantity = 100 };
        _materialRepoMock.Setup(r => r.GetByCodeAsync("AL-6061")).ReturnsAsync(material);
        _materialRepoMock.Setup(r => r.UpdateAsync(It.IsAny<Material>())).ReturnsAsync(material);

        var result = await _sut.AdjustAsync(new AdjustmentRequest { MaterialCode = "AL-6061", NewQuantity = 200, Operator = "test-op" });

        result.TransactionType.Should().Be("Adjustment");
        material.AvailableQuantity.Should().Be(200);
        _txRepoMock.Verify(r => r.AddAsync(It.IsAny<StockTransaction>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task StockInAsync_WhenMaterialNotFound_ShouldThrow()
    {
        _materialRepoMock.Setup(r => r.GetByCodeAsync("NONEXIST")).ReturnsAsync((Material?)null);

        var act = () => _sut.StockInAsync(new StockInRequest { MaterialCode = "NONEXIST", Quantity = 10 });

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*不存在*");
    }
}
