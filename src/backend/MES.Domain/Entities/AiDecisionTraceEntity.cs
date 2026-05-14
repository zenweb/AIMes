using MES.Domain.ValueObjects;

namespace MES.Domain.Entities;

/// <summary>
/// AI 决策追踪持久化实体。
/// 对应 AiDecisionTrace 值对象的数据库映射。
/// </summary>
public class AiDecisionTraceEntity
{
    public string TraceId { get; set; } = Guid.NewGuid().ToString();
    public string AgentName { get; set; } = string.Empty;
    public string AgentVersion { get; set; } = string.Empty;
    public string ModelProvider { get; set; } = string.Empty;
    public string ModelName { get; set; } = string.Empty;
    public string ModelVersion { get; set; } = string.Empty;
    public string PromptHash { get; set; } = string.Empty;
    public string ContextHash { get; set; } = string.Empty;
    public string? InputSummary { get; set; }
    public string? OutputSummary { get; set; }
    public decimal? Confidence { get; set; }
    public int? TokensInput { get; set; }
    public int? TokensOutput { get; set; }
    public int LatencyMs { get; set; }
    public HumanAdoptionStatus HumanAdoptionStatus { get; set; } = HumanAdoptionStatus.Pending;
    public string? SourceReferences { get; set; }
    public string? RelatedBusinessKeys { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
