using System.ComponentModel.DataAnnotations;

namespace MES.Application.DTOs;

public class ProductionAnomalyDto
{
    public string Id { get; set; } = string.Empty;
    public string WorkOrderNumber { get; set; } = string.Empty;
    public string OperationCode { get; set; } = string.Empty;
    public string? EquipmentId { get; set; }
    public string AnomalyType { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime DetectedAt { get; set; }
    public string? DetectedBy { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? RootCause { get; set; }
    public string? Resolution { get; set; }
    public int ResponseCount { get; set; }
}

public class ProductionAnomalyDetailDto
{
    public string Id { get; set; } = string.Empty;
    public string WorkOrderNumber { get; set; } = string.Empty;
    public string OperationCode { get; set; } = string.Empty;
    public string? EquipmentId { get; set; }
    public string AnomalyType { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime DetectedAt { get; set; }
    public string? DetectedBy { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? RootCause { get; set; }
    public string? Resolution { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public string? ResolvedBy { get; set; }
    public List<ProdAnomalyResponseDto> Responses { get; set; } = new();
}

public class ProdAnomalyResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string ResponseType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string SuggestedAction { get; set; } = string.Empty;
    public string SuggestedBy { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime? ExecutedAt { get; set; }
    public string? ExecutedBy { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AnalyzeAnomalyResultDto
{
    public string AnomalyId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? SuggestedRootCause { get; set; }
    public string? SuggestedResolution { get; set; }
    public string? AnalysisSummary { get; set; }
    public List<AnomalySuggestedActionDto> SuggestedActions { get; set; } = new();
}

public class AnomalySuggestedActionDto
{
    public string Action { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public int Priority { get; set; }
}

public class CreateAnomalyRequest
{
    [Required] public string WorkOrderNumber { get; set; } = string.Empty;
    [Required] public string OperationCode { get; set; } = string.Empty;
    public string? EquipmentId { get; set; }
    [Required] public string AnomalyType { get; set; } = string.Empty;
    public string Severity { get; set; } = "Medium";
    [Required] public string Title { get; set; } = string.Empty;
    [Required] public string Description { get; set; } = string.Empty;
    public string? DetectedBy { get; set; }
}

public class AddAnomalyResponseRequest
{
    [Required] public string Description { get; set; } = string.Empty;
    [Required] public string SuggestedAction { get; set; } = string.Empty;
    [Required] public string SuggestedBy { get; set; } = string.Empty;
    public string ResponseType { get; set; } = "Manual";
}

public class ResolveAnomalyRequest
{
    [Required] public string RootCause { get; set; } = string.Empty;
    [Required] public string Resolution { get; set; } = string.Empty;
    [Required] public string ResolvedBy { get; set; } = string.Empty;
}
