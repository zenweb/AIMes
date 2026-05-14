using MES.AI.Pro.Agents;
using MES.Domain.Entities.Quality;
using MES.Domain.Interfaces.Services;

namespace MES.AI.Adapters;

public class QualityAnalysisAdapter : IQualityAnalysisService
{
    private readonly QualityAgent _agent;

    public QualityAnalysisAdapter(QualityAgent agent)
    {
        _agent = agent;
    }

    public async Task<QualityAnalysisResult> AnalyzeQualityIssueAsync(QualityInspection inspection, CancellationToken ct = default)
    {
        var result = await _agent.AnalyzeQualityIssueAsync(inspection, ct);
        return new QualityAnalysisResult(
            result.RootCauses.Select(rc => new QualityRootCauseItem(rc.Cause, rc.Probability, rc.Evidence)).ToList(),
            result.CorrectiveActions,
            result.PreventiveMeasures);
    }

    public async Task<SpcAnalysisResult> AnalyzeSpcTrendAsync(List<double> data, double usl, double lsl, double cl, CancellationToken ct = default)
    {
        var result = await _agent.AnalyzeSpcTrendAsync(data, usl, lsl, cl, ct);
        return new SpcAnalysisResult(
            result.HasTrend,
            result.HasDrift,
            result.HasCycle,
            result.IsNearLimit,
            result.TrendDirection,
            result.RecommendedAction);
    }
}
