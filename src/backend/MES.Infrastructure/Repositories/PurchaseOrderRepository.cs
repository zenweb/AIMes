using MES.Domain.Entities.Purchase;
using MES.Domain.Interfaces.Repositories;
using MES.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MES.Infrastructure.Repositories;

public class PurchaseOrderRepository : IPurchaseOrderRepository
{
    private readonly MesDbContext _context;

    public PurchaseOrderRepository(MesDbContext context)
    {
        _context = context;
    }

    public async Task<List<PurchaseOrder>> GetAllAsync(CancellationToken ct = default)
    {
        return await _context.PurchaseOrders.AsNoTracking()
            .Include(o => o.Items)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<List<PurchaseOrder>> GetPagedAsync(int page, int pageSize, CancellationToken ct = default)
    {
        return await _context.PurchaseOrders.AsNoTracking()
            .Include(o => o.Items)
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);
    }

    public async Task<int> CountAsync(CancellationToken ct = default)
    {
        return await _context.PurchaseOrders.CountAsync(ct);
    }

    public async Task<PurchaseOrder?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        return await _context.PurchaseOrders
            .AsNoTracking()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id, ct);
    }

    public Task AddAsync(PurchaseOrder order, CancellationToken ct = default)
    {
        _context.PurchaseOrders.Add(order);
        return Task.CompletedTask;
    }

    public Task UpdateAsync(PurchaseOrder order, CancellationToken ct = default)
    {
        _context.PurchaseOrders.Update(order);
        return Task.CompletedTask;
    }

    public async Task<bool> ExistsAsync(string id, CancellationToken ct = default)
    {
        return await _context.PurchaseOrders.AnyAsync(o => o.Id == id, ct);
    }
}
