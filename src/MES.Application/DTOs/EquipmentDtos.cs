using System.ComponentModel.DataAnnotations;

namespace MES.Application.DTOs;

/// <summary>
/// 设备创建请求DTO
/// </summary>
public class CreateEquipmentRequest
{
    [Required(ErrorMessage = "设备编码不能为空")]
    [StringLength(50)]
    public string EquipmentCode { get; set; } = string.Empty;

    [Required(ErrorMessage = "设备名称不能为空")]
    [StringLength(200)]
    public string EquipmentName { get; set; } = string.Empty;

    [StringLength(50)]
    public string? EquipmentType { get; set; }

    [Required(ErrorMessage = "车间ID不能为空")]
    public string WorkshopId { get; set; } = string.Empty;

    [StringLength(200)]
    public string? WorkshopName { get; set; }

    [Range(0, double.MaxValue)]
    public double Capacity { get; set; }
}

/// <summary>
/// 设备响应DTO
/// </summary>
public class EquipmentDto
{
    public string Id { get; set; } = string.Empty;
    public string EquipmentCode { get; set; } = string.Empty;
    public string EquipmentName { get; set; } = string.Empty;
    public string? EquipmentType { get; set; }
    public string WorkshopId { get; set; } = string.Empty;
    public string? WorkshopName { get; set; }
    public string Status { get; set; } = string.Empty;
    public double Capacity { get; set; }
    public double UtilizationRate { get; set; }
    public DateTime? LastMaintenanceDate { get; set; }
    public DateTime? NextMaintenanceDate { get; set; }
    public string? CurrentWorkOrderId { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// 设备状态统计DTO
/// </summary>
public class EquipmentStatisticsDto
{
    public int TotalCount { get; set; }
    public int RunningCount { get; set; }
    public int IdleCount { get; set; }
    public int MaintenanceCount { get; set; }
    public int FaultCount { get; set; }
    public int OfflineCount { get; set; }
    public double UtilizationRate { get; set; }
    public double AvailabilityRate { get; set; }
}

/// <summary>
/// 设备健康报告DTO
/// </summary>
public class EquipmentHealthDto
{
    public string EquipmentId { get; set; } = string.Empty;
    public string EquipmentName { get; set; } = string.Empty;
    public double HealthScore { get; set; }
    public string HealthStatus { get; set; } = string.Empty;
    public List<AnomalyDto> Anomalies { get; set; } = new();
    public List<PredictedFailureDto> PredictedFailures { get; set; } = new();
    public DateTime RecommendedMaintenanceDate { get; set; }
    public List<MaintenanceTaskDto> MaintenanceTasks { get; set; } = new();
}

public class AnomalyDto
{
    public string ParameterName { get; set; } = string.Empty;
    public double Value { get; set; }
    public double ExpectedValue { get; set; }
    public double Deviation { get; set; }
    public string Severity { get; set; } = string.Empty;
}

public class PredictedFailureDto
{
    public string FailureType { get; set; } = string.Empty;
    public double Confidence { get; set; }
    public DateTime EstimatedTimeToFailure { get; set; }
    public string Recommendation { get; set; } = string.Empty;
}

public class MaintenanceTaskDto
{
    public string TaskName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string EstimatedDuration { get; set; } = string.Empty;
    public List<string> RequiredParts { get; set; } = new();
}
