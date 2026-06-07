namespace MES.Domain.Entities.Agent;

public class AgentDecisionScenario
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string AgentDecisionId { get; set; } = string.Empty;
    public string StrategyName { get; set; } = string.Empty;
    public string? PriorityRule { get; set; }
    public string? CapacityStrategy { get; set; }
    public string? Objective { get; set; }
    public string TasksJson { get; set; } = "[]";
    public double OtdProjection { get; set; }
    public double UtilizationProjection { get; set; }
    public double ChangeoverProjection { get; set; }
    public string? Explanation { get; set; }
    public string? SacrificedObjectives { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public AgentDecision? AgentDecision { get; set; }
}
