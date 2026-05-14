namespace MES.Domain.ValueObjects;

/// <summary>
/// AI 决策追踪记录 — 所有 Agent 输出必须附带此值对象。
/// 缺字段的 AI 输出由中间件拒绝写入。
/// </summary>
public sealed class AiDecisionTrace
{
    public string TraceId { get; init; } = Guid.NewGuid().ToString();
    public string AgentName { get; init; } = string.Empty;
    public string AgentVersion { get; init; } = string.Empty;
    public string ModelProvider { get; init; } = string.Empty;
    public string ModelName { get; init; } = string.Empty;
    public string ModelVersion { get; init; } = string.Empty;
    public string PromptHash { get; init; } = string.Empty;
    public string ContextHash { get; init; } = string.Empty;
    public string? InputSummary { get; init; }
    public string? OutputSummary { get; init; }
    public decimal? Confidence { get; init; }
    public int? TokensInput { get; init; }
    public int? TokensOutput { get; init; }
    public int LatencyMs { get; init; }
    public HumanAdoptionStatus HumanAdoptionStatus { get; init; } = HumanAdoptionStatus.Pending;
    public string? SourceReferences { get; init; }
    public string? RelatedBusinessKeys { get; init; }
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
}

/// <summary>
/// 人工采纳状态
/// </summary>
public enum HumanAdoptionStatus
{
    Pending = 0,
    Accepted = 1,
    Rejected = 2,
    Modified = 3
}
