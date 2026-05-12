using MES.Application.DTOs;
using MES.Domain.Entities;

namespace MES.Application.Services;

public interface IAuditLogAppService
{
    Task<List<AuditLogDto>> GetAuditLogsAsync(string? action, int page, int pageSize, CancellationToken ct = default);
    Task<AuditLogDetailDto?> GetAuditLogByIdAsync(string id, CancellationToken ct = default);
}

public class AuditLogAppService : IAuditLogAppService
{
    private static readonly List<AuditLog> _logs = new();
    private static readonly object _lock = new();

    static AuditLogAppService()
    {
        var now = DateTime.UtcNow;
        _logs.AddRange(new[]
        {
            new AuditLog { Id = "al1", UserId = "admin", Action = "POST", Resource = "Equipment", ResourceId = null, NewValues = "{\"name\":\"CNC-003\",\"type\":\"CNC\"}", IpAddress = "192.168.1.100", UserAgent = "Mozilla/5.0", CreatedAt = now.AddHours(-3) },
            new AuditLog { Id = "al2", UserId = "operator1", Action = "PUT", Resource = "Production", ResourceId = "wo-001", NewValues = "{\"status\":\"Completed\"}", OldValues = "{\"status\":\"Running\"}", IpAddress = "192.168.1.101", UserAgent = "Mozilla/5.0", CreatedAt = now.AddHours(-2) },
            new AuditLog { Id = "al3", UserId = "admin", Action = "POST", Resource = "Purchase", ResourceId = "po-003", NewValues = "{\"supplier\":\"供应商A\",\"totalAmount\":50000}", IpAddress = "192.168.1.100", UserAgent = "Mozilla/5.0", CreatedAt = now.AddHours(-1) },
            new AuditLog { Id = "al4", UserId = "qc1", Action = "PUT", Resource = "Quality", ResourceId = "insp-002", NewValues = "{\"result\":\"Failed\"}", OldValues = "{\"result\":\"Pending\"}", IpAddress = "192.168.1.102", UserAgent = "Mozilla/5.0", CreatedAt = now.AddMinutes(-45) },
            new AuditLog { Id = "al5", UserId = "admin", Action = "DELETE", Resource = "Employee", ResourceId = "emp-008", NewValues = null, IpAddress = "192.168.1.100", UserAgent = "Mozilla/5.0", CreatedAt = now.AddMinutes(-30) },
            new AuditLog { Id = "al6", UserId = "lead1", Action = "POST", Resource = "Scheduling", ResourceId = "plan-005", NewValues = "{\"planDate\":\"2026-05-13\"}", IpAddress = "192.168.1.103", UserAgent = "Mozilla/5.0", CreatedAt = now.AddMinutes(-15) },
            new AuditLog { Id = "al7", UserId = "engineer1", Action = "PUT", Resource = "Bom", ResourceId = "bom-001", NewValues = "{\"version\":\"2.0\"}", OldValues = "{\"version\":\"1.0\"}", IpAddress = "192.168.1.104", UserAgent = "PostmanRuntime/7.36", CreatedAt = now.AddMinutes(-10) },
            new AuditLog { Id = "al8", UserId = "admin", Action = "PUT", Resource = "Admin", ResourceId = "u2", NewValues = "{\"role\":\"Lead\"}", OldValues = "{\"role\":\"Operator\"}", IpAddress = "192.168.1.100", UserAgent = "Mozilla/5.0", CreatedAt = now.AddMinutes(-5) },
        });
    }

    public Task<List<AuditLogDto>> GetAuditLogsAsync(string? action, int page, int pageSize, CancellationToken ct = default)
    {
        lock (_lock)
        {
            var query = _logs.AsEnumerable();
            if (!string.IsNullOrWhiteSpace(action))
                query = query.Where(l => l.Action == action);

            var total = query.Count();
            var items = query
                .OrderByDescending(l => l.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(l => new AuditLogDto
                {
                    Id = l.Id,
                    UserId = l.UserId,
                    Action = l.Action,
                    Resource = l.Resource,
                    ResourceId = l.ResourceId,
                    CreatedAt = l.CreatedAt,
                }).ToList();

            return Task.FromResult(items);
        }
    }

    public Task<AuditLogDetailDto?> GetAuditLogByIdAsync(string id, CancellationToken ct = default)
    {
        lock (_lock)
        {
            var log = _logs.FirstOrDefault(l => l.Id == id);
            if (log == null) return Task.FromResult<AuditLogDetailDto?>(null);

            return Task.FromResult<AuditLogDetailDto?>(new AuditLogDetailDto
            {
                Id = log.Id,
                UserId = log.UserId,
                Action = log.Action,
                Resource = log.Resource,
                ResourceId = log.ResourceId,
                OldValues = log.OldValues,
                NewValues = log.NewValues,
                IpAddress = log.IpAddress,
                UserAgent = log.UserAgent,
                CreatedAt = log.CreatedAt,
            });
        }
    }
}
