using MES.Application.DTOs;
using MES.Domain.Entities;
using MES.Domain.Enums;
using MES.Domain.Interfaces.Repositories;

namespace MES.Application.Services;

public interface IAuditLogAppService
{
    Task<PagedResult<AuditLogDto>> GetAuditLogsAsync(string? action, string? traceId, int page, int pageSize, CancellationToken ct = default);
    Task<AuditLogDetailDto?> GetAuditLogByIdAsync(string id, CancellationToken ct = default);
    Task WriteAuditLogAsync(string userId, string action, string resource, string? resourceId, string? oldValues, string? newValues, string? ipAddress, string? userAgent, AuditInitiatedBy initiatedBy = AuditInitiatedBy.User, CancellationToken ct = default);
}

public class AuditLogAppService : IAuditLogAppService
{
    private readonly IAuditLogRepository _repo;

    public AuditLogAppService(IAuditLogRepository repo)
    {
        _repo = repo;
    }

    public async Task<PagedResult<AuditLogDto>> GetAuditLogsAsync(string? action, string? traceId, int page, int pageSize, CancellationToken ct = default)
    {
        var total = await _repo.CountAsync(action, traceId, ct);
        var items = await _repo.GetPagedAsync(action, traceId, page, pageSize, ct);

        return new PagedResult<AuditLogDto>
        {
            Items = items.Select(l => new AuditLogDto
            {
                Id = l.Id,
                UserId = l.UserId,
                InitiatedBy = l.InitiatedBy.ToString(),
                Action = l.Action,
                Resource = l.Resource,
                ResourceId = l.ResourceId,
                BusinessKey = l.BusinessKey,
                TraceId = l.TraceId,
                CreatedAt = l.CreatedAt,
            }).ToList(),
            TotalCount = total,
            Page = page,
            PageSize = pageSize,
        };
    }

    public async Task<AuditLogDetailDto?> GetAuditLogByIdAsync(string id, CancellationToken ct = default)
    {
        var log = await _repo.GetByIdAsync(id, ct);
        if (log == null) return null;

        return new AuditLogDetailDto
        {
            Id = log.Id,
            UserId = log.UserId,
            InitiatedBy = log.InitiatedBy.ToString(),
            Action = log.Action,
            Resource = log.Resource,
            ResourceId = log.ResourceId,
            BusinessKey = log.BusinessKey,
            TraceId = log.TraceId,
            OldValues = log.OldValues,
            NewValues = log.NewValues,
            PromptHash = log.PromptHash,
            ContextHash = log.ContextHash,
            IpAddress = log.IpAddress,
            UserAgent = log.UserAgent,
            CreatedAt = log.CreatedAt,
        };
    }

    public async Task WriteAuditLogAsync(
        string userId, string action, string resource, string? resourceId,
        string? oldValues, string? newValues, string? ipAddress, string? userAgent,
        AuditInitiatedBy initiatedBy = AuditInitiatedBy.User,
        CancellationToken ct = default)
    {
        var log = new AuditLog
        {
            UserId = userId,
            InitiatedBy = initiatedBy,
            Action = action,
            Resource = resource,
            ResourceId = resourceId,
            OldValues = oldValues,
            NewValues = newValues,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            CreatedAt = DateTime.UtcNow,
        };

        await _repo.AddAsync(log, ct);
    }
}
