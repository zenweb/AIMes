namespace MES.AI.Pro.Models;

/// <summary>
/// 质检结果
/// </summary>
public class InspectionResult
{
    public bool IsPassed { get; set; }
    public List<DefectInfo> Defects { get; set; } = new();
    public List<SimilarCase> SimilarHistoricalCases { get; set; } = new();
    public string? Recommendation { get; set; }
}

public class DefectInfo
{
    public string DefectType { get; set; } = string.Empty;
    public double AreaRatio { get; set; }
    public string Severity { get; set; } = string.Empty;
}

public class SimilarCase
{
    public string CaseId { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string CorrectiveAction { get; set; } = string.Empty;
}

/// <summary>
/// 工艺参数推荐
/// </summary>
public class ProcessParameterRecommendation
{
    public Dictionary<string, double> OptimalParameters { get; set; } = new();
    public List<ParameterSensitivity> SensitivityAnalysis { get; set; } = new();
    public List<string> QualityControlPoints { get; set; } = new();
    public string RecommendationReason { get; set; } = string.Empty;
}

public class ParameterSensitivity
{
    public string ParameterName { get; set; } = string.Empty;
    public double Sensitivity { get; set; }
    public string Direction { get; set; } = string.Empty;
}

/// <summary>
/// 根因分析结果
/// </summary>
public class RootCauseAnalysis
{
    public List<RootCause> RootCauses { get; set; } = new();
    public List<string> CorrectiveActions { get; set; } = new();
    public List<string> PreventiveMeasures { get; set; } = new();
}

public class RootCause
{
    public string Cause { get; set; } = string.Empty;
    public double Probability { get; set; }
    public string Evidence { get; set; } = string.Empty;
}
