using MES.Domain.Entities.Admin;
using MES.Domain.Interfaces.Repositories;
using MES.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MES.Infrastructure.Repositories;

public class NotificationConfigRepository : INotificationConfigRepository
{
    private readonly MesDbContext _context;

    public NotificationConfigRepository(MesDbContext context)
    {
        _context = context;
    }

    public async Task<List<NotificationConfig>> GetAllAsync(CancellationToken ct = default)
    {
        return await _context.NotificationConfigs!
            .AsNoTracking()
            .OrderBy(c => c.Category)
            .ToListAsync(ct);
    }

    public async Task<NotificationConfig?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        return await _context.NotificationConfigs!
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id, ct);
    }

    public async Task<NotificationConfig> UpdateAsync(NotificationConfig config, CancellationToken ct = default)
    {
        _context.NotificationConfigs!.Update(config);
        await _context.SaveChangesAsync(ct);
        return config;
    }
}
