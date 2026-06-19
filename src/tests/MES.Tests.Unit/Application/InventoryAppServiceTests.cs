using FluentAssertions;
using MES.Application.DTOs;
using MES.Application.Services;
using MES.Domain.Entities.Inventory;
using MES.Domain.Entities.Production;
using MES.Domain.Enums;
using MES.Domain.Interfaces.Repositories;
using MES.Domain.Interfaces.Services;
using Moq;
using Xunit;

namespace MES.Tests.Unit.Application;

public class InventoryAppServiceTests
{
    private readonly Mock<IMaterialRepository> _materialRepoMock;
    private readonly Mock<IStockTransactionRepository> _txRepoMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<IAuditLogAppService> _auditLogMock;
    private readonly InventoryAppService _sut;

    public InventoryAppServiceTests()
    {
        _materialRepoMock = new Mock<IMaterialRepository>();
        _txRepoMock = new Mock<IStockTransactionRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _auditLogMock = new Mock<IAuditLogAppService>();
        // lambda 模式：测试桩直接调用 action 跑过去（不真起事务，单测里不需要）
        _unitOfWorkMock
            .Setup(u => u.ExecuteAsync(It.IsAny<Func<CancellationToken, Task<StockTransactionDto>>>(), It.IsAny<CancellationToken>()))
            .Returns<Func<CancellationToken, Task<StockTransactionDto>>, CancellationToken>(
                (action, ct) => action(ct));
        _sut = new InventoryAppService(_materialRepoMock.Object, _txRepoMock.Object, _unitOfWorkMock.Object, _auditLogMock.Object);
    }

    [Fact]
    public async Task GetDashboardAsync_ShouldReturnCorrectCounts()
    {
        var materials = new List<Material>
        {
            Material.Create("AL-6061", "铝合金", "KG", safetyStock: 100, availableQuantity: 1000, id: "m1"),
            CreateReservedMaterial("STEEL-001", "钢材", 50, 30, 100, "m2"),
            Material.Create("BRASS-001", "黄铜", "KG", safetyStock: 50, availableQuantity: 0, id: "m3"),
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
            Material.Create("AL-6061", "铝合金", "KG", materialType: "原材料", availableQuantity: 1000, id: "m1"),
            Material.Create("STEEL-001", "钢材", "KG", availableQuantity: 500, id: "m2"),
        };
        _materialRepoMock.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(materials);

        var result = await _sut.GetAllItemsAsync();

        result.Should().HaveCount(2);
        result.Should().Contain(i => i.MaterialCode == "AL-6061");
    }

    [Fact]
    public async Task GetItemByCodeAsync_WhenExists_ShouldReturnItem()
    {
        var material = Material.Create("AL-6061", "铝合金", "KG", id: "m1");
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
        var material = Material.Create("AL-6061", "铝合金", "KG", availableQuantity: 100, id: "m1");
        _materialRepoMock.Setup(r => r.GetByCodeForUpdateAsync("AL-6061", It.IsAny<CancellationToken>())).ReturnsAsync(material);
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
        _auditLogMock.Verify(a => a.WriteAuditLogAsync(
            "test-op",
            "InventoryStockIn",
            "Inventory",
            It.IsAny<string>(),
            null,
            It.Is<string>(value => value.Contains("AL-6061", StringComparison.Ordinal)),
            null,
            null,
            AuditInitiatedBy.User,
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task StockOutAsync_ShouldDecreaseQuantityAndCreateTransaction()
    {
        var material = Material.Create("AL-6061", "铝合金", "KG", availableQuantity: 100, id: "m1");
        _materialRepoMock.Setup(r => r.GetByCodeForUpdateAsync("AL-6061", It.IsAny<CancellationToken>())).ReturnsAsync(material);
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
        var material = CreateReservedMaterial("AL-6061", "铝合金", 20, 10, 0, "m1");
        _materialRepoMock.Setup(r => r.GetByCodeForUpdateAsync("AL-6061", It.IsAny<CancellationToken>())).ReturnsAsync(material);

        var act = () => _sut.StockOutAsync(new StockOutRequest { MaterialCode = "AL-6061", Quantity = 30 });

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*可用库存不足*");
    }

    [Fact]
    public async Task TransferAsync_ShouldMoveStockAndUpdateLocation()
    {
        var material = Material.Create("AL-6061", "铝合金", "KG", storageLocation: "WH-A", availableQuantity: 100, id: "m1");
        _materialRepoMock.Setup(r => r.GetByCodeForUpdateAsync("AL-6061", It.IsAny<CancellationToken>())).ReturnsAsync(material);
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
        var material = Material.Create("AL-6061", "铝合金", "KG", availableQuantity: 100, id: "m1");
        _materialRepoMock.Setup(r => r.GetByCodeForUpdateAsync("AL-6061", It.IsAny<CancellationToken>())).ReturnsAsync(material);
        _materialRepoMock.Setup(r => r.UpdateAsync(It.IsAny<Material>())).ReturnsAsync(material);

        var result = await _sut.AdjustAsync(new AdjustmentRequest { MaterialCode = "AL-6061", NewQuantity = 200, Operator = "test-op" });

        result.TransactionType.Should().Be("Adjustment");
        material.AvailableQuantity.Should().Be(200);
        _txRepoMock.Verify(r => r.AddAsync(It.IsAny<StockTransaction>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task StockInAsync_WhenMaterialNotFound_ShouldThrow()
    {
        _materialRepoMock.Setup(r => r.GetByCodeForUpdateAsync("NONEXIST", It.IsAny<CancellationToken>())).ReturnsAsync((Material?)null);

        var act = () => _sut.StockInAsync(new StockInRequest { MaterialCode = "NONEXIST", Quantity = 10 });

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*不存在*");
    }

    private static Material CreateReservedMaterial(
        string code,
        string name,
        int availableQuantity,
        int reservedQuantity,
        int safetyStock,
        string id)
    {
        var material = Material.Create(
            code,
            name,
            "KG",
            safetyStock: safetyStock,
            availableQuantity: availableQuantity,
            id: id);
        material.Reserve(reservedQuantity);
        return material;
    }
}
