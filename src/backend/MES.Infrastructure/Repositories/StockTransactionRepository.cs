using MES.Domain.Entities.Inventory;
using MES.Domain.Interfaces.Repositories;
using MES.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MES.Infrastructure.Repositories;

public class StockTransactionRepository : IStockTransactionRepository
{
    private readonly MesDbContext _context;

    public StockTransactionRepository(MesDbContext context)
    {
        _context = context;
    }

    public async Task<List<StockTransaction>> GetPagedAsync(string? materialCode, int page, int pageSize, CancellationToken ct = default)
    {
        var query = _context.StockTransactions.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(materialCode))
            query = query.Where(t => t.MaterialCode == materialCode);

        return await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);
    }

    public async Task<int> CountAsync(string? materialCode, CancellationToken ct = default)
    {
        var query = _context.StockTransactions.AsQueryable();
        if (!string.IsNullOrWhiteSpace(materialCode))
            query = query.Where(t => t.MaterialCode == materialCode);
        return await query.CountAsync(ct);
    }

    public async Task<int> CountTodayAsync(CancellationToken ct = default)
    {
        var today = DateTime.UtcNow.Date;
        return await _context.StockTransactions.CountAsync(t => t.CreatedAt.Date == today, ct);
    }

    public Task AddAsync(StockTransaction transaction, CancellationToken ct = default)
    {
        _context.StockTransactions.Add(transaction);
        return Task.CompletedTask;
    }
}
