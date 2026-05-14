using MES.AI.Pro.Agents;
using MES.Domain.Entities.Anomalies;
using MES.Domain.Interfaces.Services;

namespace MES.AI.Adapters;

public class AnomalyAnalysisAdapter : IAnomalyAnalysisService
{
    private readonly AnomalyAgent _agent;

    public AnomalyAnalysisAdapter(AnomalyAgent agent)
    {
        _agent = agent;
    }

    public async Task<List<AnomalyResponse>> AnalyzeAsync(ProductionAnomaly anomaly, CancellationToken ct = default)
    {
        return await _agent.AnalyzeAsync(anomaly);
    }
}
