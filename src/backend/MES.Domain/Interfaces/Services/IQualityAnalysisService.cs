using MES.Domain.Entities.Quality;

namespace MES.Domain.Interfaces.Services;

public record QualityRootCauseItem(string Cause, double Probability, string Evidence);

public record QualityAnalysisResult(
    List<QualityRootCauseItem> RootCauses,
    List<string> CorrectiveActions,
    List<string> PreventiveMeasures);

public record SpcAnalysisResult(
    bool HasTrend,
    bool HasDrift,
    bool HasCycle,
    bool IsNearLimit,
    string TrendDirection,
    string RecommendedAction);

public interface IQualityAnalysisService
{
    Task<QualityAnalysisResult> AnalyzeQualityIssueAsync(QualityInspection inspection, CancellationToken ct = default);
    Task<SpcAnalysisResult> AnalyzeSpcTrendAsync(List<double> data, double usl, double lsl, double cl, CancellationToken ct = default);
}
