using MES.Domain.Entities.Production;
using MES.Domain.Interfaces.Repositories;
using MES.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MES.Infrastructure.Repositories;

public class MaterialRepository : IMaterialRepository
{
    private readonly MesDbContext _context;

    public MaterialRepository(MesDbContext context)
    {
        _context = context;
    }

    public async Task<List<Material>> GetAllAsync(CancellationToken ct = default)
    {
        return await _context.Materials
            .AsNoTracking()
            .OrderBy(m => m.MaterialCode)
            .ToListAsync(ct);
    }

    public async Task<Material?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        return await _context.Materials
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.Id == id, ct);
    }

    public async Task<Material?> GetByCodeAsync(string materialCode, CancellationToken ct = default)
    {
        return await _context.Materials
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.MaterialCode == materialCode, ct);
    }

    public async Task<Material> CreateAsync(Material material, CancellationToken ct = default)
    {
        _context.Materials.Add(material);
        await _context.SaveChangesAsync(ct);
        return material;
    }

    public Task<Material> UpdateAsync(Material material, CancellationToken ct = default)
    {
        _context.Materials.Update(material);
        return Task.FromResult(material);
    }

    public async Task DeleteAsync(string id, CancellationToken ct = default)
    {
        var material = await GetByIdAsync(id, ct);
        if (material != null)
        {
            _context.Materials.Remove(material);
            await _context.SaveChangesAsync(ct);
        }
    }

    public async Task<bool> CheckAvailabilityAsync(string materialCode, int quantity, CancellationToken ct = default)
    {
        var material = await GetByCodeAsync(materialCode, ct);
        if (material == null)
            return false;

        return material.AvailableQuantity - material.ReservedQuantity >= quantity;
    }
}
