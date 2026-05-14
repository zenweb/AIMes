using MES.Domain.Entities.Anomalies;

namespace MES.Domain.Interfaces.Services;

public interface IAnomalyAnalysisService
{
    Task<List<AnomalyResponse>> AnalyzeAsync(ProductionAnomaly anomaly, CancellationToken ct = default);
}
