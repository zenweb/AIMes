using MES.Domain.Entities.Bom;
using MES.Domain.Interfaces.Repositories;
using MES.Domain.ValueObjects;
using MES.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MES.Infrastructure.Repositories;

public class BomRepository : IBomRepository
{
    private readonly MesDbContext _context;

    public BomRepository(MesDbContext context)
    {
        _context = context;
    }

    public async Task<BillOfMaterial?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        return await _context.BillsOfMaterial.FirstOrDefaultAsync(e => e.Id == id, ct);
    }

    public async Task<List<BillOfMaterial>> GetByProductCodeAsync(ProductCode productCode, CancellationToken ct = default)
    {
        return await _context.BillsOfMaterial.AsNoTracking().Where(e => e.ProductCode == productCode).ToListAsync(ct);
    }

    public async Task<BillOfMaterial?> GetByBomCodeAsync(string bomCode, CancellationToken ct = default)
    {
        return await _context.BillsOfMaterial.FirstOrDefaultAsync(e => e.BomCode == bomCode, ct);
    }

    public async Task<BillOfMaterial> AddAsync(BillOfMaterial bom, CancellationToken ct = default)
    {
        _context.BillsOfMaterial.Add(bom);
        await _context.SaveChangesAsync(ct);
        return bom;
    }

    public async Task<BillOfMaterial> UpdateAsync(BillOfMaterial bom, CancellationToken ct = default)
    {
        _context.BillsOfMaterial.Update(bom);
        await _context.SaveChangesAsync(ct);
        return bom;
    }
}
