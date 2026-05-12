using System.ComponentModel.DataAnnotations;

namespace MES.Application.DTOs;

/// <summary>
/// 智能排产请求DTO
/// </summary>
public class OptimizeScheduleRequest
{
    [Required(ErrorMessage = "车间ID不能为空")]
    public string WorkshopId { get; set; } = string.Empty;

    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    /// <summary>优化目标：due_date / utilization / changeover / balanced</summary>
    public string? OptimizationObjective { get; set; }

    public List<string>? WorkOrderIds { get; set; }
    public bool ConsiderHistoricalData { get; set; } = true;
    public Dictionary<string, object>? Constraints { get; set; }
}

/// <summary>
/// 排产计划响应DTO
/// </summary>
public class SchedulePlanDto
{
    public string Id { get; set; } = string.Empty;
    public string PlanName { get; set; } = string.Empty;
    public DateTime PlanStartDate { get; set; }
    public DateTime PlanEndDate { get; set; }
    public List<ScheduleItemDto> Items { get; set; } = new();
    public double OverallUtilizationRate { get; set; }
    public double OnTimeDeliveryRate { get; set; }
    public double TotalChangeoverMinutes { get; set; }
    public int GroupCount { get; set; }
    public string? OptimizationNotes { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// 排产明细DTO
/// </summary>
public class ScheduleItemDto
{
    public string Id { get; set; } = string.Empty;
    public string WorkOrderId { get; set; } = string.Empty;
    public string WorkOrderNumber { get; set; } = string.Empty;
    public string EquipmentId { get; set; } = string.Empty;
    public string EquipmentName { get; set; } = string.Empty;
    public DateTime PlannedStartTime { get; set; }
    public DateTime PlannedEndTime { get; set; }
    public int Sequence { get; set; }
    public string SetupTime { get; set; } = string.Empty;
    public List<string> DependentItems { get; set; } = new();
}

/// <summary>
/// 排产优化结果DTO
/// </summary>
public class SchedulingResultDto
{
    public SchedulePlanDto Plan { get; set; } = new();
    public List<ScheduleAssignmentDto> Assignments { get; set; } = new();
    public double EstimatedCompletionRate { get; set; }
    public double UtilizationRate { get; set; }
    public string? OptimizationReason { get; set; }
    public List<string> Warnings { get; set; } = new();
}

public class ScheduleAssignmentDto
{
    public string WorkOrderId { get; set; } = string.Empty;
    public string EquipmentId { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public List<string> Dependencies { get; set; } = new();
}

/// <summary>
/// 工艺参数推荐请求DTO
/// </summary>
public class ProcessParameterRequest
{
    [Required(ErrorMessage = "产品编码不能为空")]
    public string ProductCode { get; set; } = string.Empty;

    [Required(ErrorMessage = "工艺路线编码不能为空")]
    public string RouteCode { get; set; } = string.Empty;
}

/// <summary>
/// 工艺参数推荐响应DTO
/// </summary>
public class ProcessParameterRecommendationDto
{
    public string ProductCode { get; set; } = string.Empty;
    public string RouteCode { get; set; } = string.Empty;
    public Dictionary<string, double> OptimalParameters { get; set; } = new();
    public List<ParameterSensitivityDto> SensitivityAnalysis { get; set; } = new();
    public List<string> QualityControlPoints { get; set; } = new();
    public string RecommendationReason { get; set; } = string.Empty;
    public double ConfidenceLevel { get; set; }
}

public class ParameterSensitivityDto
{
    public string ParameterName { get; set; } = string.Empty;
    public double Sensitivity { get; set; }
    public string Direction { get; set; } = string.Empty;
    public string Impact { get; set; } = string.Empty;
}
