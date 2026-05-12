using System.ComponentModel.DataAnnotations;

namespace MES.Application.DTOs;

/// <summary>
/// 质量检验创建请求DTO
/// </summary>
public class CreateInspectionRequest
{
    [Required(ErrorMessage = "工单ID不能为空")]
    public string WorkOrderId { get; set; } = string.Empty;

    [Required(ErrorMessage = "产品编码不能为空")]
    public string ProductCode { get; set; } = string.Empty;

    [Required(ErrorMessage = "工序名称不能为空")]
    public string ProcessName { get; set; } = string.Empty;

    [Required(ErrorMessage = "检验点不能为空")]
    public string InspectionPoint { get; set; } = string.Empty;

    [Required(ErrorMessage = "检验数量不能为空")]
    [Range(1, int.MaxValue)]
    public int InspectionQuantity { get; set; }

    [Required(ErrorMessage = "合格数量不能为空")]
    [Range(0, int.MaxValue)]
    public int QualifiedQuantity { get; set; }

    [Required(ErrorMessage = "不良数量不能为空")]
    [Range(0, int.MaxValue)]
    public int DefectQuantity { get; set; }

    [Required(ErrorMessage = "检验结果不能为空")]
    public string Result { get; set; } = string.Empty;

    [Required(ErrorMessage = "检验员ID不能为空")]
    public string InspectorId { get; set; } = string.Empty;
}

/// <summary>
/// 质量检验响应DTO
/// </summary>
public class InspectionDto
{
    public string Id { get; set; } = string.Empty;
    public string WorkOrderId { get; set; } = string.Empty;
    public string ProductCode { get; set; } = string.Empty;
    public string ProcessName { get; set; } = string.Empty;
    public string InspectionPoint { get; set; } = string.Empty;
    public int InspectionQuantity { get; set; }
    public int QualifiedQuantity { get; set; }
    public int DefectQuantity { get; set; }
    public string Result { get; set; } = string.Empty;
    public string InspectorId { get; set; } = string.Empty;
    public DateTime InspectedAt { get; set; }
    public double PassRate { get; set; }
}

/// <summary>
/// 质量统计DTO
/// </summary>
public class QualityStatisticsDto
{
    public int TotalInspections { get; set; }
    public int PassedCount { get; set; }
    public int FailedCount { get; set; }
    public int ReworkCount { get; set; }
    public double PassRate { get; set; }
    public double DefectRate { get; set; }
    public double ReworkRate { get; set; }
}

/// <summary>
/// 根因分析请求DTO
/// </summary>
public class RootCauseAnalysisRequest
{
    [Required(ErrorMessage = "检验ID不能为空")]
    public string InspectionId { get; set; } = string.Empty;
}

/// <summary>
/// 根因分析响应DTO
/// </summary>
public class RootCauseAnalysisDto
{
    public string InspectionId { get; set; } = string.Empty;
    public List<RootCauseItemDto> RootCauses { get; set; } = new();
    public List<string> CorrectiveActions { get; set; } = new();
    public List<string> PreventiveMeasures { get; set; } = new();
    public string AnalysisSummary { get; set; } = string.Empty;
}

public class RootCauseItemDto
{
    public string Cause { get; set; } = string.Empty;
    public double Probability { get; set; }
    public string Evidence { get; set; } = string.Empty;
}
