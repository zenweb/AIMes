using System.ComponentModel.DataAnnotations;

namespace MES.Application.DTOs;

public class ProcessRouteDto
{
    public string Id { get; set; } = string.Empty;
    public string RouteCode { get; set; } = string.Empty;
    public string RouteName { get; set; } = string.Empty;
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public double? TotalLeadTimeMinutes { get; set; }
    public int StepCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class RouteDetailDto
{
    public string Id { get; set; } = string.Empty;
    public string RouteCode { get; set; } = string.Empty;
    public string RouteName { get; set; } = string.Empty;
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public double? TotalLeadTimeMinutes { get; set; }
    public List<RoutingStepDto> Steps { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}

public class RoutingStepDto
{
    public string Id { get; set; } = string.Empty;
    public int StepSequence { get; set; }
    public string OperationCode { get; set; } = string.Empty;
    public string OperationName { get; set; } = string.Empty;
    public string WorkstationType { get; set; } = string.Empty;
    public double StandardSetupMinutes { get; set; }
    public double StandardRunMinutesPerUnit { get; set; }
    public string EquipmentType { get; set; } = string.Empty;
    public bool InspectionRequired { get; set; }
    public List<StepParameterDto> Parameters { get; set; } = new();
}

public class StepParameterDto
{
    public string ParameterCode { get; set; } = string.Empty;
    public string ParameterName { get; set; } = string.Empty;
    public string DefaultValue { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public double? UpperLimit { get; set; }
    public double? LowerLimit { get; set; }
    public bool IsMandatory { get; set; }
}

public class CreateRouteRequest
{
    [Required] public string RouteCode { get; set; } = string.Empty;
    [Required] public string RouteName { get; set; } = string.Empty;
    [Required] public string ProductCode { get; set; } = string.Empty;
    [Required] public string ProductName { get; set; } = string.Empty;
    public List<CreateRoutingStepRequest> Steps { get; set; } = new();
}

public class CreateRoutingStepRequest
{
    [Required] public string OperationCode { get; set; } = string.Empty;
    [Required] public string OperationName { get; set; } = string.Empty;
    [Required] public string WorkstationType { get; set; } = string.Empty;
    public double StandardSetupMinutes { get; set; }
    public double StandardRunMinutesPerUnit { get; set; }
    public string EquipmentType { get; set; } = string.Empty;
    public bool InspectionRequired { get; set; }
    public int Sequence { get; set; }
    public List<CreateStepParameterRequest> Parameters { get; set; } = new();
}

public class CreateStepParameterRequest
{
    [Required] public string ParameterCode { get; set; } = string.Empty;
    [Required] public string ParameterName { get; set; } = string.Empty;
    [Required] public string DefaultValue { get; set; } = string.Empty;
    [Required] public string Unit { get; set; } = string.Empty;
    public double? UpperLimit { get; set; }
    public double? LowerLimit { get; set; }
    public bool IsMandatory { get; set; }
}
