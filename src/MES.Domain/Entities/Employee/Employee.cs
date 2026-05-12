namespace MES.Domain.Entities.Employee;

public class Employee
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string EmployeeNumber { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string Role { get; set; } = "Operator"; // Operator, Engineer, Lead, QC, Admin
    public string? Team { get; set; }        // 班组
    public string? Shift { get; set; }       // 班次: Day, Night, Rotating
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
