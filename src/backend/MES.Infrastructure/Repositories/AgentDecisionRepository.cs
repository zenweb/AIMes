using MES.Domain.Entities;
using MES.Domain.Entities.Agent;
using MES.Domain.Interfaces.Repositories;
using MES.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MES.Infrastructure.Repositories;

public class AgentDecisionRepository : IAgentDecisionRepository
{
    private readonly MesDbContext _context;

    public AgentDecisionRepository(MesDbContext context)
    {
        _context = context;
    }

    public async Task AddTriggerEventAsync(AgentTriggerEvent triggerEvent, CancellationToken ct = default)
    {
        _context.AgentTriggerEvents.Add(triggerEvent);
        await _context.SaveChangesAsync(ct);
    }

    public async Task AddDecisionAsync(AgentDecision decision, CancellationToken ct = default)
    {
        _context.AgentDecisions.Add(decision);
        await _context.SaveChangesAsync(ct);
    }

    public async Task<AgentDecision?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        return await _context.AgentDecisions
            .AsNoTracking()
            .Include(d => d.Scenarios)
            .FirstOrDefaultAsync(d => d.Id == id, ct);
    }

    public async Task<List<AgentDecision>> QueryRecentAsync(string? boundedContext, int take, CancellationToken ct = default)
    {
        var query = _context.AgentDecisions
            .AsNoTracking()
            .Include(d => d.Scenarios)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(boundedContext))
            query = query.Where(d => d.BoundedContext == boundedContext);

        return await query
            .OrderByDescending(d => d.CreatedAt)
            .Take(Math.Clamp(take, 1, 100))
            .ToListAsync(ct);
    }

    public async Task RecordAdoptionAsync(string decisionId, string scenarioId, string? reason, CancellationToken ct = default)
    {
        var decision = await _context.AgentDecisions.FirstOrDefaultAsync(d => d.Id == decisionId, ct)
            ?? throw new InvalidOperationException($"Agent decision {decisionId} not found.");

        decision.Status = "Adopted";
        decision.AdoptedScenarioId = scenarioId;
        decision.AdoptionReason = reason;
        decision.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(ct);
    }

    public async Task RecordRejectionAsync(string decisionId, string? reason, CancellationToken ct = default)
    {
        var decision = await _context.AgentDecisions.FirstOrDefaultAsync(d => d.Id == decisionId, ct)
            ?? throw new InvalidOperationException($"Agent decision {decisionId} not found.");

        decision.Status = "Rejected";
        decision.RejectionReason = reason;
        decision.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(ct);
    }

    public async Task AddActionResultAsync(AgentActionResult result, CancellationToken ct = default)
    {
        _context.AgentActionResults.Add(result);
        await _context.SaveChangesAsync(ct);
    }

    public async Task AddEvidenceLinkAsync(AgentEvidenceLink link, CancellationToken ct = default)
    {
        _context.AgentEvidenceLinks.Add(link);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpsertEvidenceLinkAsync(AgentEvidenceLink link, CancellationToken ct = default)
    {
        var existingLinks = await _context.AgentEvidenceLinks
            .Where(e => e.EvidenceType == link.EvidenceType && e.EvidenceKey == link.EvidenceKey)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync(ct);
        var existing = existingLinks.FirstOrDefault();

        if (existing is null)
        {
            _context.AgentEvidenceLinks.Add(link);
        }
        else
        {
            existing.AgentDecisionId = link.AgentDecisionId;
            existing.EvidenceSummary = link.EvidenceSummary;
            existing.CreatedAt = link.CreatedAt;
            if (existingLinks.Count > 1)
            {
                _context.AgentEvidenceLinks.RemoveRange(existingLinks.Skip(1));
            }
        }

        await _context.SaveChangesAsync(ct);
    }

    public async Task<List<AgentEvidenceLink>> QueryEvidenceLinksAsync(string evidenceType, int take, CancellationToken ct = default)
    {
        return await _context.AgentEvidenceLinks
            .AsNoTracking()
            .Where(e => e.EvidenceType == evidenceType)
            .OrderByDescending(e => e.CreatedAt)
            .Take(Math.Clamp(take, 1, 100))
            .ToListAsync(ct);
    }

    public async Task AddTraceAsync(AiDecisionTraceEntity trace, CancellationToken ct = default)
    {
        _context.AiDecisionTraces.Add(trace);
        await _context.SaveChangesAsync(ct);
    }
}
