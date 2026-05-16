using MES.Application.DTOs;
using MES.Domain.Entities.Inventory;
using MES.Domain.Interfaces.Repositories;
using MES.Domain.Interfaces.Services;

namespace MES.Application.Services;

public interface IInventoryAppService
{
    Task<InventoryDashboardDto> GetDashboardAsync(CancellationToken ct = default);
    Task<List<InventoryItemDto>> GetAllItemsAsync(CancellationToken ct = default);
    Task<InventoryItemDto?> GetItemByCodeAsync(string materialCode, CancellationToken ct = default);
    Task<List<StockTransactionDto>> GetTransactionsAsync(string? materialCode = null, int page = 1, int pageSize = 20, CancellationToken ct = default);
    Task<StockTransactionDto> StockInAsync(StockInRequest request, CancellationToken ct = default);
    Task<StockTransactionDto> StockOutAsync(StockOutRequest request, CancellationToken ct = default);
    Task<StockTransactionDto> TransferAsync(TransferRequest request, CancellationToken ct = default);
    Task<StockTransactionDto> AdjustAsync(AdjustmentRequest request, CancellationToken ct = default);
}

public class InventoryAppService : IInventoryAppService
{
    private readonly IMaterialRepository _materialRepo;
    private readonly IStockTransactionRepository _txRepo;
    private readonly IUnitOfWork _unitOfWork;

    public InventoryAppService(IMaterialRepository materialRepo, IStockTransactionRepository txRepo, IUnitOfWork unitOfWork)
    {
        _materialRepo = materialRepo;
        _txRepo = txRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<InventoryDashboardDto> GetDashboardAsync(CancellationToken ct = default)
    {
        var materials = await _materialRepo.GetAllAsync();
        var lowStock = materials.Count(m => m.AvailableQuantity - m.ReservedQuantity <= m.SafetyStock && m.AvailableQuantity > 0);
        var outOfStock = materials.Count(m => m.AvailableQuantity <= 0);
        var todayTx = await _txRepo.CountTodayAsync(ct);

        return new InventoryDashboardDto
        {
            TotalMaterials = materials.Count,
            LowStockCount = lowStock,
            OutOfStockCount = outOfStock,
            TodayTransactions = todayTx,
        };
    }

    public async Task<List<InventoryItemDto>> GetAllItemsAsync(CancellationToken ct = default)
    {
        var materials = await _materialRepo.GetAllAsync();
        return materials.Select(m => new InventoryItemDto
        {
            Id = m.Id,
            MaterialCode = m.MaterialCode,
            MaterialName = m.MaterialName,
            MaterialType = m.MaterialType,
            Unit = m.Unit,
            AvailableQuantity = m.AvailableQuantity,
            ReservedQuantity = m.ReservedQuantity,
            SafetyStock = m.SafetyStock,
            StorageLocation = m.StorageLocation,
            ExpiryDate = m.ExpiryDate,
            CreatedAt = m.CreatedAt,
        }).ToList();
    }

    public async Task<InventoryItemDto?> GetItemByCodeAsync(string materialCode, CancellationToken ct = default)
    {
        var material = await _materialRepo.GetByCodeAsync(materialCode);
        if (material == null) return null;

        return new InventoryItemDto
        {
            Id = material.Id,
            MaterialCode = material.MaterialCode,
            MaterialName = material.MaterialName,
            MaterialType = material.MaterialType,
            Unit = material.Unit,
            AvailableQuantity = material.AvailableQuantity,
            ReservedQuantity = material.ReservedQuantity,
            SafetyStock = material.SafetyStock,
            StorageLocation = material.StorageLocation,
            ExpiryDate = material.ExpiryDate,
            CreatedAt = material.CreatedAt,
        };
    }

    public async Task<List<StockTransactionDto>> GetTransactionsAsync(string? materialCode = null, int page = 1, int pageSize = 20, CancellationToken ct = default)
    {
        var items = await _txRepo.GetPagedAsync(materialCode, page, pageSize, ct);
        return items.Select(MapTransaction).ToList();
    }

    public async Task<StockTransactionDto> StockInAsync(StockInRequest request, CancellationToken ct = default)
    {
        await using var scope = await _unitOfWork.BeginAsync(ct);
        var material = await _materialRepo.GetByCodeAsync(request.MaterialCode)
            ?? throw new InvalidOperationException($"物料 {request.MaterialCode} 不存在");

        var before = material.AvailableQuantity;
        material.StockIn(request.Quantity);
        await _materialRepo.UpdateAsync(material);

        var tx = CreateTransaction(material.MaterialCode, material.MaterialName, TransactionType.StockIn,
            request.Quantity, before, material.AvailableQuantity,
            request.ReferenceType, request.ReferenceNumber, request.Remark, request.Warehouse, request.Location, request.Operator);
        await _txRepo.AddAsync(tx, ct);

        await scope.CommitAsync(ct);
        return MapTransaction(tx);
    }

    public async Task<StockTransactionDto> StockOutAsync(StockOutRequest request, CancellationToken ct = default)
    {
        await using var scope = await _unitOfWork.BeginAsync(ct);
        var material = await _materialRepo.GetByCodeAsync(request.MaterialCode)
            ?? throw new InvalidOperationException($"物料 {request.MaterialCode} 不存在");

        var realQty = material.NetAvailable;
        if (realQty < request.Quantity)
            throw new InvalidOperationException($"物料 {request.MaterialCode} 可用库存不足 (可用: {realQty}, 需求: {request.Quantity})");

        var before = material.AvailableQuantity;
        material.Consume(request.Quantity);
        await _materialRepo.UpdateAsync(material);

        var tx = CreateTransaction(material.MaterialCode, material.MaterialName, TransactionType.StockOut,
            request.Quantity, before, material.AvailableQuantity,
            request.ReferenceType, request.ReferenceNumber, request.Remark, null, null, request.Operator);
        await _txRepo.AddAsync(tx, ct);

        await scope.CommitAsync(ct);
        return MapTransaction(tx);
    }

    public async Task<StockTransactionDto> TransferAsync(TransferRequest request, CancellationToken ct = default)
    {
        await using var scope = await _unitOfWork.BeginAsync(ct);
        var material = await _materialRepo.GetByCodeAsync(request.MaterialCode)
            ?? throw new InvalidOperationException($"物料 {request.MaterialCode} 不存在");

        var realQty = material.NetAvailable;
        if (realQty < request.Quantity)
            throw new InvalidOperationException($"物料 {request.MaterialCode} 可用库存不足");

        var before = material.AvailableQuantity;
        material.Consume(request.Quantity);
        material.UpdateLocation(request.ToWarehouse);
        await _materialRepo.UpdateAsync(material);

        var tx = CreateTransaction(material.MaterialCode, material.MaterialName, TransactionType.TransferOut,
            request.Quantity, before, material.AvailableQuantity,
            "Transfer", $"{request.FromWarehouse}->{request.ToWarehouse}", request.Remark, request.FromWarehouse, request.ToWarehouse, request.Operator);
        await _txRepo.AddAsync(tx, ct);

        await scope.CommitAsync(ct);
        return MapTransaction(tx);
    }

    public async Task<StockTransactionDto> AdjustAsync(AdjustmentRequest request, CancellationToken ct = default)
    {
        await using var scope = await _unitOfWork.BeginAsync(ct);
        var material = await _materialRepo.GetByCodeAsync(request.MaterialCode)
            ?? throw new InvalidOperationException($"物料 {request.MaterialCode} 不存在");

        var before = material.AvailableQuantity;
        var diff = request.NewQuantity - before;
        if (diff > 0) material.StockIn(diff);
        else if (diff < 0) material.Consume(-diff);
        await _materialRepo.UpdateAsync(material);

        var tx = CreateTransaction(material.MaterialCode, material.MaterialName, TransactionType.Adjustment,
            Math.Abs(diff), before, material.AvailableQuantity,
            "Adjustment", null, request.Remark, null, null, request.Operator);
        await _txRepo.AddAsync(tx, ct);

        await scope.CommitAsync(ct);
        return MapTransaction(tx);
    }

    private static StockTransaction CreateTransaction(
        string materialCode, string materialName, TransactionType type,
        decimal qty, decimal before, decimal after,
        string? refType, string? refNumber, string? remark,
        string? warehouse, string? location, string? op)
    {
        return new StockTransaction
        {
            MaterialCode = materialCode,
            MaterialName = materialName,
            TransactionType = type,
            Quantity = qty,
            BalanceBefore = before,
            BalanceAfter = after,
            ReferenceType = refType,
            ReferenceNumber = refNumber,
            Warehouse = warehouse,
            Location = location,
            Operator = op,
            Remark = remark,
            CreatedAt = DateTime.UtcNow,
        };
    }

    private static StockTransactionDto MapTransaction(StockTransaction tx) => new()
    {
        Id = tx.Id,
        MaterialCode = tx.MaterialCode,
        MaterialName = tx.MaterialName,
        TransactionType = tx.TransactionType.ToString(),
        Quantity = tx.Quantity,
        BalanceBefore = tx.BalanceBefore,
        BalanceAfter = tx.BalanceAfter,
        ReferenceType = tx.ReferenceType,
        ReferenceNumber = tx.ReferenceNumber,
        Warehouse = tx.Warehouse,
        Operator = tx.Operator,
        Remark = tx.Remark,
        CreatedAt = tx.CreatedAt,
    };
}
