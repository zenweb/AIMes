using MES.Domain.Entities.Admin;
using MES.Domain.Interfaces.Repositories;
using MES.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MES.Infrastructure.Repositories;

public class SystemConfigRepository : ISystemConfigRepository
{
    private readonly MesDbContext _context;

    public SystemConfigRepository(MesDbContext context)
    {
        _context = context;
    }

    public async Task<List<SystemConfig>> GetAllAsync(CancellationToken ct = default)
    {
        return await _context.SystemConfigs
            .AsNoTracking()
            .OrderBy(c => c.Category)
            .ThenBy(c => c.ConfigKey)
            .ToListAsync(ct);
    }

    public async Task<SystemConfig?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        return await _context.SystemConfigs
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id, ct);
    }

    public async Task<SystemConfig> UpdateAsync(SystemConfig config, CancellationToken ct = default)
    {
        _context.SystemConfigs.Update(config);
        await _context.SaveChangesAsync(ct);
        return config;
    }
}
