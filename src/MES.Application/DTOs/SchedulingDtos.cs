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

/// <summary>
/// 批量优化对比请求
/// </summary>
public class BatchOptimizeRequest
{
    [Required(ErrorMessage = "车间ID不能为空")]
    public string WorkshopId { get; set; } = string.Empty;

    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    /// <summary>需要对比的优化目标列表，默认全部</summary>
    public List<string>? Objectives { get; set; }

    public List<string>? WorkOrderIds { get; set; }
    public bool ConsiderHistoricalData { get; set; } = true;
}

/// <summary>
/// 单个目标优化结果（用于对比）
/// </summary>
public class ObjectiveCompareItemDto
{
    public string Objective { get; set; } = string.Empty;
    public string ObjectiveLabel { get; set; } = string.Empty;
    public SchedulePlanDto Plan { get; set; } = new();
    public double UtilizationRate { get; set; }
    public double OnTimeDeliveryRate { get; set; }
    public double TotalChangeoverMinutes { get; set; }
    public int GroupCount { get; set; }
    public double EstimatedCompletionRate { get; set; }
    public int TotalWorkOrders { get; set; }
}

/// <summary>
/// 批量优化对比结果
/// </summary>
public class BatchOptimizeResultDto
{
    public List<ObjectiveCompareItemDto> Items { get; set; } = new();
    /// <summary>最优方案的目标名称</summary>
    public string? BestOverallObjective { get; set; }
}

/// <summary>
/// 排产方案采纳反馈请求
/// </summary>
public class AdoptionFeedbackRequest
{
    [Required(ErrorMessage = "排产计划ID不能为空")]
    public string SchedulePlanId { get; set; } = string.Empty;

    [Required(ErrorMessage = "车间ID不能为空")]
    public string WorkshopId { get; set; } = string.Empty;

    public string? OptimizationObjective { get; set; }

    [Required(ErrorMessage = "修改原因分类不能为空")]
    public string ReasonCategory { get; set; } = string.Empty;

    public string? ReasonDetail { get; set; }
    public List<string>? MovedOrderIds { get; set; }
    public string? AiTraceId { get; set; }
}
