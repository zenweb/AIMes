using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Quality;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Interfaces.Repositories;
using MES.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MES.Infrastructure.Repositories;

/// <summary>
/// 物料仓储实现
/// </summary>
public class MaterialRepository : IMaterialRepository
{
    private readonly MesDbContext _context;

    public MaterialRepository(MesDbContext context)
    {
        _context = context;
    }

    public async Task<List<Material>> GetAllAsync()
    {
        return await _context.Materials
            .OrderBy(m => m.MaterialCode)
            .ToListAsync();
    }

    public async Task<Material?> GetByIdAsync(string id)
    {
        return await _context.Materials
            .FirstOrDefaultAsync(m => m.Id == id);
    }

    public async Task<Material?> GetByCodeAsync(string materialCode)
    {
        return await _context.Materials
            .FirstOrDefaultAsync(m => m.MaterialCode == materialCode);
    }

    public async Task<Material> CreateAsync(Material material)
    {
        material.CreatedAt = DateTime.UtcNow;
        material.Id = string.IsNullOrEmpty(material.Id) ? Guid.NewGuid().ToString() : material.Id;

        _context.Materials.Add(material);
        await _context.SaveChangesAsync();
        return material;
    }

    public async Task<Material> UpdateAsync(Material material)
    {
        material.UpdatedAt = DateTime.UtcNow;
        _context.Materials.Update(material);
        await _context.SaveChangesAsync();
        return material;
    }

    public async Task DeleteAsync(string id)
    {
        var material = await GetByIdAsync(id);
        if (material != null)
        {
            _context.Materials.Remove(material);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> CheckAvailabilityAsync(string materialCode, int quantity)
    {
        var material = await GetByCodeAsync(materialCode);
        if (material == null)
        {
            return false;
        }

        return material.AvailableQuantity - material.ReservedQuantity >= quantity;
    }
}
