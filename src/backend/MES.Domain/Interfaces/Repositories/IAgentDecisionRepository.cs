using MES.Domain.Entities;
using MES.Domain.Entities.Agent;

namespace MES.Domain.Interfaces.Repositories;

public interface IAgentDecisionRepository
{
    Task AddTriggerEventAsync(AgentTriggerEvent triggerEvent, CancellationToken ct = default);
    Task AddDecisionAsync(AgentDecision decision, CancellationToken ct = default);
    Task<AgentDecision?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<List<AgentDecision>> QueryRecentAsync(string? boundedContext, int take, CancellationToken ct = default);
    Task RecordAdoptionAsync(string decisionId, string scenarioId, string? reason, CancellationToken ct = default);
    Task RecordRejectionAsync(string decisionId, string? reason, CancellationToken ct = default);
    Task AddActionResultAsync(AgentActionResult result, CancellationToken ct = default);
    Task AddEvidenceLinkAsync(AgentEvidenceLink link, CancellationToken ct = default);
    Task UpsertEvidenceLinkAsync(AgentEvidenceLink link, CancellationToken ct = default);
    Task<List<AgentEvidenceLink>> QueryEvidenceLinksAsync(string evidenceType, int take, CancellationToken ct = default);
    Task AddTraceAsync(AiDecisionTraceEntity trace, CancellationToken ct = default);
}
