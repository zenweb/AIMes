using MES.Domain.Enums;

namespace MES.AI.Models;

/// <summary>
/// 设备健康报告
/// </summary>
public class EquipmentHealthReport
{
    public string EquipmentId { get; set; } = string.Empty;
    public double HealthScore { get; set; }
    public List<AnomalyInfo> Anomalies { get; set; } = new();
    public List<PredictedFailure> PredictedFailures { get; set; } = new();
    public DateTime RecommendedMaintenanceDate { get; set; }
    public List<MaintenanceTask> MaintenanceTasks { get; set; } = new();
}

public class AnomalyInfo
{
    public string ParameterName { get; set; } = string.Empty;
    public double Value { get; set; }
    public double ExpectedValue { get; set; }
    public double Deviation { get; set; }
    public string Severity { get; set; } = string.Empty;
}

public class PredictedFailure
{
    public string FailureType { get; set; } = string.Empty;
    public double Confidence { get; set; }
    public DateTime EstimatedTimeToFailure { get; set; }
    public string Recommendation { get; set; } = string.Empty;
}

public class MaintenanceTask
{
    public string TaskName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string EstimatedDuration { get; set; } = string.Empty;
    public List<string> RequiredParts { get; set; } = new();
}

/// <summary>
/// 预测预警
/// </summary>
public class PredictionAlert
{
    public string EquipmentId { get; set; } = string.Empty;
    public AlertLevel AlertLevel { get; set; }
    public string PredictedFailure { get; set; } = string.Empty;
    public DateTime EstimatedTimeToFailure { get; set; }
    public string Recommendation { get; set; } = string.Empty;
    public List<string> SuggestedMaintenanceParts { get; set; } = new();
}

/// <summary>
/// 诊断报告
/// </summary>
public class DiagnosticReport
{
    public string MostLikelyCause { get; set; } = string.Empty;
    public string DiagnosticBasis { get; set; } = string.Empty;
    public List<string> SuggestedSteps { get; set; } = new();
    public List<string> RequiredSpareParts { get; set; } = new();
    public string EstimatedRepairTime { get; set; } = string.Empty;
}