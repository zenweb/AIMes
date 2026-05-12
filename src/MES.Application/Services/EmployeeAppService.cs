using MES.Application.DTOs;
using MES.Domain.Entities.Employee;

namespace MES.Application.Services;

public interface IEmployeeAppService
{
    Task<List<EmployeeDto>> GetAllAsync(CancellationToken ct = default);
    Task<EmployeeDto?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<EmployeeDto> CreateAsync(CreateEmployeeRequest request, CancellationToken ct = default);
    Task<EmployeeDto> UpdateAsync(string id, UpdateEmployeeRequest request, CancellationToken ct = default);
    Task DeactivateAsync(string id, CancellationToken ct = default);
    Task<List<EmployeeDto>> GetByTeamAsync(string team, CancellationToken ct = default);
}

public class EmployeeAppService : IEmployeeAppService
{
    private static readonly List<Employee> _employees = new();
    private static readonly object _lock = new();

    static EmployeeAppService()
    {
        _employees.AddRange(new[]
        {
            new Employee { Id = "emp1", EmployeeNumber = "EMP-001", Name = "张三", Role = "Operator", Team = "甲班", Shift = "Day", Phone = "13800138001", IsActive = true },
            new Employee { Id = "emp2", EmployeeNumber = "EMP-002", Name = "李四", Role = "Operator", Team = "甲班", Shift = "Day", IsActive = true },
            new Employee { Id = "emp3", EmployeeNumber = "EMP-003", Name = "王五", Role = "Operator", Team = "乙班", Shift = "Night", IsActive = true },
            new Employee { Id = "emp4", EmployeeNumber = "EMP-004", Name = "赵六", Role = "Engineer", Team = "技术组", Shift = "Day", IsActive = true },
            new Employee { Id = "emp5", EmployeeNumber = "EMP-005", Name = "钱七", Role = "QC", Team = "质检组", Shift = "Day", IsActive = true },
            new Employee { Id = "emp6", EmployeeNumber = "EMP-006", Name = "孙八", Role = "Lead", Team = "甲班", Shift = "Day", IsActive = true },
            new Employee { Id = "emp7", EmployeeNumber = "EMP-007", Name = "周九", Role = "Admin", Team = null, Shift = "Day", IsActive = true },
            new Employee { Id = "emp8", EmployeeNumber = "EMP-008", Name = "吴十", Role = "Operator", Team = "乙班", Shift = "Night", IsActive = false },
        });
    }

    public Task<List<EmployeeDto>> GetAllAsync(CancellationToken ct = default)
    {
        lock (_lock)
        {
            var result = _employees.OrderBy(e => e.EmployeeNumber).Select(MapToDto).ToList();
            return Task.FromResult(result);
        }
    }

    public Task<EmployeeDto?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        lock (_lock)
        {
            var emp = _employees.FirstOrDefault(e => e.Id == id);
            return Task.FromResult(emp != null ? MapToDto(emp) : null);
        }
    }

    public Task<EmployeeDto> CreateAsync(CreateEmployeeRequest request, CancellationToken ct = default)
    {
        lock (_lock)
        {
            var emp = new Employee
            {
                EmployeeNumber = request.EmployeeNumber,
                Name = request.Name,
                Phone = request.Phone,
                Email = request.Email,
                Role = request.Role,
                Team = request.Team,
                Shift = request.Shift,
            };
            _employees.Add(emp);
            return Task.FromResult(MapToDto(emp));
        }
    }

    public Task<EmployeeDto> UpdateAsync(string id, UpdateEmployeeRequest request, CancellationToken ct = default)
    {
        lock (_lock)
        {
            var emp = _employees.FirstOrDefault(e => e.Id == id)
                ?? throw new InvalidOperationException($"员工 {id} 不存在");

            if (request.Name != null) emp.Name = request.Name;
            if (request.Phone != null) emp.Phone = request.Phone;
            if (request.Email != null) emp.Email = request.Email;
            if (request.Role != null) emp.Role = request.Role;
            if (request.Team != null) emp.Team = request.Team;
            if (request.Shift != null) emp.Shift = request.Shift;
            if (request.IsActive.HasValue) emp.IsActive = request.IsActive.Value;
            emp.UpdatedAt = DateTime.UtcNow;

            return Task.FromResult(MapToDto(emp));
        }
    }

    public Task DeactivateAsync(string id, CancellationToken ct = default)
    {
        lock (_lock)
        {
            var emp = _employees.FirstOrDefault(e => e.Id == id);
            if (emp != null)
            {
                emp.IsActive = false;
                emp.UpdatedAt = DateTime.UtcNow;
            }
        }
        return Task.CompletedTask;
    }

    public Task<List<EmployeeDto>> GetByTeamAsync(string team, CancellationToken ct = default)
    {
        lock (_lock)
        {
            var result = _employees.Where(e => e.Team == team).Select(MapToDto).ToList();
            return Task.FromResult(result);
        }
    }

    private static EmployeeDto MapToDto(Employee e) => new()
    {
        Id = e.Id,
        EmployeeNumber = e.EmployeeNumber,
        Name = e.Name,
        Phone = e.Phone,
        Email = e.Email,
        Role = e.Role,
        Team = e.Team,
        Shift = e.Shift,
        IsActive = e.IsActive,
        CreatedAt = e.CreatedAt,
    };
}
