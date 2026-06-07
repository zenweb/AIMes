namespace MES.Domain.Entities.Agent;

public class AgentEvidenceLink
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string AgentDecisionId { get; set; } = string.Empty;
    public string EvidenceType { get; set; } = string.Empty;
    public string EvidenceKey { get; set; } = string.Empty;
    public string? EvidenceSummary { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
