using MES.Domain.Entities.Knowledge;
using MES.Domain.ValueObjects;

namespace MES.AI.Pro.Models;

public sealed class TracedInspectionResult : InspectionResult
{
    public AiDecisionTrace AiDecisionTrace { get; set; } = new();
}

public sealed class TracedRootCauseAnalysis : RootCauseAnalysis
{
    public AiDecisionTrace AiDecisionTrace { get; set; } = new();
}

public sealed class TracedSpcAlert : SpcAlert
{
    public double Mean { get; set; }
    public double StandardDeviation { get; set; }
    public double Cpk { get; set; }
    public List<string> RunRuleViolations { get; set; } = new();
    public AiDecisionTrace AiDecisionTrace { get; set; } = new();
}

public sealed class DefectRootCauseSummary
{
    public string DefectType { get; set; } = string.Empty;
    public string ProductCode { get; set; } = string.Empty;
    public List<RootCause> RootCauses { get; set; } = new();
    public List<string> Evidence { get; set; } = new();
    public AiDecisionTrace AiDecisionTrace { get; set; } = new();
}

public sealed class FailurePredictionResult
{
    public string EquipmentId { get; set; } = string.Empty;
    public List<PredictedFailure> PredictedFailures { get; set; } = new();
    public double Confidence { get; set; }
    public string Reasoning { get; set; } = string.Empty;
    public AiDecisionTrace AiDecisionTrace { get; set; } = new();
}

public sealed class MaintenanceRecommendationResult
{
    public string EquipmentId { get; set; } = string.Empty;
    public DateTime RecommendedDate { get; set; }
    public List<MaintenanceTask> Tasks { get; set; } = new();
    public string Reasoning { get; set; } = string.Empty;
    public AiDecisionTrace AiDecisionTrace { get; set; } = new();
}

public sealed class TelemetryAnomalyAnalysis
{
    public string EquipmentId { get; set; } = string.Empty;
    public List<AnomalyInfo> Anomalies { get; set; } = new();
    public string Severity { get; set; } = string.Empty;
    public string RecommendedAction { get; set; } = string.Empty;
    public AiDecisionTrace AiDecisionTrace { get; set; } = new();
}

public sealed class TracedProcessParameterRecommendation : ProcessParameterRecommendation
{
    public AiDecisionTrace AiDecisionTrace { get; set; } = new();
}

public sealed class ProcessMatchResult
{
    public string ProductCode { get; set; } = string.Empty;
    public Dictionary<string, double> Parameters { get; set; } = new();
    public List<SimilarCase> SimilarCases { get; set; } = new();
    public double Confidence { get; set; }
    public AiDecisionTrace AiDecisionTrace { get; set; } = new();
}

public sealed class KnowledgeAnswer
{
    public string Answer { get; set; } = string.Empty;
    public List<DocumentChunk> Sources { get; set; } = new();
    public AiDecisionTrace AiDecisionTrace { get; set; } = new();
}
