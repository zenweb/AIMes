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

    public async Task<PurchaseOrder?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        return await _context.PurchaseOrders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id, ct);
    }

    public async Task AddAsync(PurchaseOrder order, CancellationToken ct = default)
    {
        _context.PurchaseOrders.Add(order);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(PurchaseOrder order, CancellationToken ct = default)
    {
        _context.PurchaseOrders.Update(order);
        await _context.SaveChangesAsync(ct);
    }

    public async Task<bool> ExistsAsync(string id, CancellationToken ct = default)
    {
        return await _context.PurchaseOrders.AnyAsync(o => o.Id == id, ct);
    }
}
