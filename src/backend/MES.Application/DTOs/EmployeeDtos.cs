using System.ComponentModel.DataAnnotations;

namespace MES.Application.DTOs;

public class EmployeeDto
{
    public string Id { get; set; } = string.Empty;
    public string EmployeeNumber { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string Role { get; set; } = string.Empty;
    public string? Team { get; set; }
    public string? Shift { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateEmployeeRequest
{
    [Required] public string EmployeeNumber { get; set; } = string.Empty;
    [Required] public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string Role { get; set; } = "Operator";
    public string? Team { get; set; }
    public string? Shift { get; set; }
}

public class UpdateEmployeeRequest
{
    public string? Name { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Role { get; set; }
    public string? Team { get; set; }
    public string? Shift { get; set; }
    public bool? IsActive { get; set; }
}
