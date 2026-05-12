using System.ComponentModel.DataAnnotations;

namespace MES.Application.DTOs;

/// <summary>
/// 工单创建请求DTO
/// </summary>
public class CreateWorkOrderRequest
{
    [Required(ErrorMessage = "工单号不能为空")]
    [StringLength(50, ErrorMessage = "工单号长度不能超过50")]
    public string OrderNumber { get; set; } = string.Empty;

    [Required(ErrorMessage = "产品编码不能为空")]
    [StringLength(50, ErrorMessage = "产品编码长度不能超过50")]
    public string ProductCode { get; set; } = string.Empty;

    [Required(ErrorMessage = "产品名称不能为空")]
    [StringLength(200, ErrorMessage = "产品名称长度不能超过200")]
    public string ProductName { get; set; } = string.Empty;

    [Required(ErrorMessage = "计划数量不能为空")]
    [Range(1, int.MaxValue, ErrorMessage = "计划数量必须大于0")]
    public int PlannedQuantity { get; set; }

    [Required(ErrorMessage = "计划开始日期不能为空")]
    public DateTime PlannedStartDate { get; set; }

    [Required(ErrorMessage = "计划结束日期不能为空")]
    public DateTime PlannedEndDate { get; set; }

    [Required(ErrorMessage = "车间ID不能为空")]
    public string WorkshopId { get; set; } = string.Empty;

    [StringLength(50)]
    public string? RouteCode { get; set; }

    [Range(0, 100, ErrorMessage = "优先级必须在0-100之间")]
    public int Priority { get; set; } = 0;
}

/// <summary>
/// 工单更新请求DTO
/// </summary>
public class UpdateWorkOrderRequest
{
    [StringLength(200)]
    public string? ProductName { get; set; }

    [Range(0, int.MaxValue)]
    public int? PlannedQuantity { get; set; }

    public DateTime? PlannedStartDate { get; set; }
    public DateTime? PlannedEndDate { get; set; }
    public int? Priority { get; set; }
}

/// <summary>
/// 工单响应DTO
/// </summary>
public class WorkOrderDto
{
    public string Id { get; set; } = string.Empty;
    public string OrderNumber { get; set; } = string.Empty;
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int PlannedQuantity { get; set; }
    public int CompletedQuantity { get; set; }
    public DateTime PlannedStartDate { get; set; }
    public DateTime PlannedEndDate { get; set; }
    public DateTime? ActualStartDate { get; set; }
    public DateTime? ActualEndDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string WorkshopId { get; set; } = string.Empty;
    public string? RouteCode { get; set; }
    public int Priority { get; set; }
    public double ProgressPercentage { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// 工单列表查询参数
/// </summary>
public class WorkOrderQueryParameters
{
    public string? Status { get; set; }
    public string? WorkshopId { get; set; }
    public string? ProductCode { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
