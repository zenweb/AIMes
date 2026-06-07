namespace MES.Domain.Entities.Agent;

public class AgentActionResult
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string AgentDecisionId { get; set; } = string.Empty;
    public string ActionType { get; set; } = string.Empty;
    public string ResultStatus { get; set; } = string.Empty;
    public string Actor { get; set; } = string.Empty;
    public string? Role { get; set; }
    public string InitiatedBy { get; set; } = "User";
    public string? Reason { get; set; }
    public string ResultPayloadJson { get; set; } = "{}";
    public string? AuditLogId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
