using MES.Domain.Entities;

namespace MES.Domain.Interfaces.Repositories;

public interface IAuditLogRepository
{
    Task<List<AuditLog>> GetPagedAsync(string? action, int page, int pageSize, CancellationToken ct = default);
    Task<AuditLog?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<int> CountAsync(string? action, CancellationToken ct = default);
    Task AddAsync(AuditLog log, CancellationToken ct = default);
}
