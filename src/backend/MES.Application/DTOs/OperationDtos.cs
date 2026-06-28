using System.ComponentModel.DataAnnotations;
using MES.Domain.Enums;

namespace MES.Application.DTOs;

public class ScanOperationRequest
{
    [Required]
    public string Code { get; set; } = string.Empty;

    public string? OperatorId { get; set; }
    public string? StationId { get; set; }
}

public class OperationInfoDto
{
    public string OperationId { get; set; } = string.Empty;
    public string WorkOrderId { get; set; } = string.Empty;
    public string WorkOrderNumber { get; set; } = string.Empty;
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string OperationCode { get; set; } = string.Empty;
    public string OperationName { get; set; } = string.Empty;
    public int PlannedQuantity { get; set; }
    public int CompletedQuantity { get; set; }
    public string Status { get; set; } = string.Empty;
    public OperationInfoDto? NextOperation { get; set; }
}

public class StartOperationRequest
{
    [Required]
    public string OperatorId { get; set; } = string.Empty;

    [Required]
    public string StationId { get; set; } = string.Empty;

    public string? EquipmentId { get; set; }
}

public class CompleteOperationRequest
{
    [Range(0, int.MaxValue)]
    public int Quantity { get; set; }

    [Range(0, int.MaxValue)]
    public int DefectQuantity { get; set; }

    public Dictionary<string, string> Parameters { get; set; } = new();
    public List<MaterialConsumedDto> Materials { get; set; } = new();
    public InspectionResult InspectionResult { get; set; } = InspectionResult.Pass;
    public string? ReportedBy { get; set; }
}

public class MaterialConsumedDto
{
    public string MaterialCode { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public string Unit { get; set; } = string.Empty;
    public string? BatchNumber { get; set; }
}

public class ReportExceptionRequest
{
    [Required]
    public string Reason { get; set; } = string.Empty;
}

public class OperationResultDto
{
    public string OperationId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Message { get; set; }
}
