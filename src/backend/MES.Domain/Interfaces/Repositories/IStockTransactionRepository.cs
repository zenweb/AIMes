using MES.Domain.Entities.Inventory;

namespace MES.Domain.Interfaces.Repositories;

public interface IStockTransactionRepository
{
    Task<List<StockTransaction>> GetPagedAsync(string? materialCode, int page, int pageSize, CancellationToken ct = default);
    Task<int> CountAsync(string? materialCode, CancellationToken ct = default);
    Task<int> CountTodayAsync(CancellationToken ct = default);
    Task AddAsync(StockTransaction transaction, CancellationToken ct = default);
}
