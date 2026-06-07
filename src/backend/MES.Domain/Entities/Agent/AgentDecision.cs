namespace MES.Domain.Entities.Agent;

public class AgentDecision
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string TriggerEventId { get; set; } = string.Empty;
    public string BoundedContext { get; set; } = string.Empty;
    public string DecisionType { get; set; } = string.Empty;
    public string Status { get; set; } = "PendingReview";
    public int ScenarioCount { get; set; }
    public string? RecommendedScenarioId { get; set; }
    public string? AdoptedScenarioId { get; set; }
    public string? AdoptionReason { get; set; }
    public string? RejectionReason { get; set; }
    public string AgentName { get; set; } = string.Empty;
    public string AgentVersion { get; set; } = string.Empty;
    public string? TraceId { get; set; }
    public string PromptHash { get; set; } = string.Empty;
    public string ContextHash { get; set; } = string.Empty;
    public string? InputSummary { get; set; }
    public string? OutputSummary { get; set; }
    public string BusinessKey { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public List<AgentDecisionScenario> Scenarios { get; set; } = new();
}
