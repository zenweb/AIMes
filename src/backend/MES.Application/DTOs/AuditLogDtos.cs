using MES.Domain.Entities;

namespace MES.Application.DTOs;

public class AuditLogDto
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string InitiatedBy { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string Resource { get; set; } = string.Empty;
    public string? ResourceId { get; set; }
    public string? BusinessKey { get; set; }
    public string? TraceId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AuditLogDetailDto : AuditLogDto
{
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public string? PromptHash { get; set; }
    public string? ContextHash { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
}
