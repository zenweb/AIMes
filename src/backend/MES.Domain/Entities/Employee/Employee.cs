using MES.Domain.Exceptions;

namespace MES.Domain.Entities.Employee;

public class Employee
{
    internal Employee() { }

    public string Id { get; private set; } = Guid.NewGuid().ToString();
    public string EmployeeNumber { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Phone { get; private set; }
    public string? Email { get; private set; }
    public string Role { get; private set; } = "Operator";
    public string? Team { get; private set; }
    public string? Shift { get; private set; }
    public bool IsActive { get; private set; } = true;
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; private set; }

    public static Employee Create(string employeeNumber, string name, string role,
        string? team = null, string? shift = null, string? phone = null, string? email = null,
        string? id = null, DateTime? createdAt = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(employeeNumber);
        ArgumentException.ThrowIfNullOrWhiteSpace(name);

        if (role is not ("Operator" or "Engineer" or "QC" or "Lead" or "Admin"))
            throw new ArgumentException($"不支持的角色: {role}", nameof(role));

        return new Employee
        {
            Id = id ?? Guid.NewGuid().ToString(),
            EmployeeNumber = employeeNumber,
            Name = name,
            Role = role,
            Team = team,
            Shift = shift,
            Phone = phone,
            Email = email,
            CreatedAt = createdAt ?? DateTime.UtcNow,
        };
    }

    public void UpdateProfile(string name, string? phone, string? email)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        Name = name;
        Phone = phone;
        Email = email;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Transfer(string? team, string? shift)
    {
        Team = team;
        Shift = shift;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ChangeRole(string newRole)
    {
        if (newRole is not ("Operator" or "Engineer" or "QC" or "Lead" or "Admin"))
            throw new ArgumentException($"不支持的角色: {newRole}", nameof(newRole));
        Role = newRole;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Activate()
    {
        IsActive = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        if (!IsActive)
            throw new DomainRuleViolationException("员工已处于离职状态");
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }
}
