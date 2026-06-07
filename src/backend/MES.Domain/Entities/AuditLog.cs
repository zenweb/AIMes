using MES.Domain.Enums;

namespace MES.Domain.Entities;

/// <summary>
/// 审计日志
/// </summary>
public class AuditLog
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string UserId { get; set; } = string.Empty;
    public AuditInitiatedBy InitiatedBy { get; set; } = AuditInitiatedBy.User;
    public string Action { get; set; } = string.Empty;
    public string Resource { get; set; } = string.Empty;
    public string? ResourceId { get; set; }
    public string? BusinessKey { get; set; }
    public string? TraceId { get; set; }
    public string? PromptHash { get; set; }
    public string? ContextHash { get; set; }
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
