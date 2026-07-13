using MES.Domain.Entities;
using MES.Domain.Interfaces.Repositories;
using MES.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MES.Infrastructure.Repositories;

public class AuditLogRepository : IAuditLogRepository
{
    private readonly MesDbContext _context;

    public AuditLogRepository(MesDbContext context)
    {
        _context = context;
    }

    public async Task<List<AuditLog>> GetPagedAsync(string? action, string? traceId, int page, int pageSize, CancellationToken ct = default)
    {
        var query = _context.AuditLogs.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(action))
            query = query.Where(l => l.Action == action);
        if (!string.IsNullOrWhiteSpace(traceId))
            query = query.Where(l => l.TraceId == traceId);

        return await query
            .OrderByDescending(l => l.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);
    }

    public async Task<AuditLog?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        return await _context.AuditLogs.AsNoTracking().FirstOrDefaultAsync(l => l.Id == id, ct);
    }

    public async Task<int> CountAsync(string? action, string? traceId, CancellationToken ct = default)
    {
        var query = _context.AuditLogs.AsQueryable();
        if (!string.IsNullOrWhiteSpace(action))
            query = query.Where(l => l.Action == action);
        if (!string.IsNullOrWhiteSpace(traceId))
            query = query.Where(l => l.TraceId == traceId);
        return await query.CountAsync(ct);
    }

    public Task AddAsync(AuditLog log, CancellationToken ct = default)
    {
        _context.AuditLogs.Add(log);
        return Task.CompletedTask;
    }
}
