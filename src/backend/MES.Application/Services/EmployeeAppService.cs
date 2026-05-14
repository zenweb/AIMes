using MES.Application.DTOs;
using MES.Domain.Entities.Employee;
using MES.Domain.Interfaces.Repositories;

namespace MES.Application.Services;

public interface IEmployeeAppService
{
    Task<PagedResult<EmployeeDto>> GetAllAsync(int page = 1, int pageSize = 20, CancellationToken ct = default);
    Task<EmployeeDto?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<EmployeeDto> CreateAsync(CreateEmployeeRequest request, CancellationToken ct = default);
    Task<EmployeeDto> UpdateAsync(string id, UpdateEmployeeRequest request, CancellationToken ct = default);
    Task DeactivateAsync(string id, CancellationToken ct = default);
    Task<List<EmployeeDto>> GetByTeamAsync(string team, CancellationToken ct = default);
}

public class EmployeeAppService : IEmployeeAppService
{
    private readonly IEmployeeRepository _employeeRepo;

    public EmployeeAppService(IEmployeeRepository employeeRepo)
    {
        _employeeRepo = employeeRepo;
    }

    public async Task<PagedResult<EmployeeDto>> GetAllAsync(int page = 1, int pageSize = 20, CancellationToken ct = default)
    {
        var all = await _employeeRepo.GetAllAsync(ct);
        var total = all.Count;
        var items = all.Skip((page - 1) * pageSize).Take(pageSize).Select(MapToDto).ToList();
        return new PagedResult<EmployeeDto>
        {
            Items = items,
            TotalCount = total,
            Page = page,
            PageSize = pageSize,
        };
    }

    public async Task<EmployeeDto?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        var emp = await _employeeRepo.GetByIdAsync(id, ct);
        return emp != null ? MapToDto(emp) : null;
    }

    public async Task<EmployeeDto> CreateAsync(CreateEmployeeRequest request, CancellationToken ct = default)
    {
        var emp = Employee.Create(
            request.EmployeeNumber, request.Name, request.Role,
            request.Team, request.Shift, request.Phone, request.Email);
        await _employeeRepo.AddAsync(emp, ct);
        return MapToDto(emp);
    }

    public async Task<EmployeeDto> UpdateAsync(string id, UpdateEmployeeRequest request, CancellationToken ct = default)
    {
        var emp = await _employeeRepo.GetByIdAsync(id, ct)
            ?? throw new InvalidOperationException($"员工 {id} 不存在");

        if (request.Name != null || request.Phone != null || request.Email != null)
            emp.UpdateProfile(request.Name ?? emp.Name, request.Phone ?? emp.Phone, request.Email ?? emp.Email);
        if (request.Role != null) emp.ChangeRole(request.Role);
        if (request.Team != null || request.Shift != null)
            emp.Transfer(request.Team ?? emp.Team, request.Shift ?? emp.Shift);
        if (request.IsActive.HasValue)
        {
            if (request.IsActive.Value) emp.Activate();
            else emp.Deactivate();
        }

        await _employeeRepo.UpdateAsync(emp, ct);
        return MapToDto(emp);
    }

    public async Task DeactivateAsync(string id, CancellationToken ct = default)
    {
        var emp = await _employeeRepo.GetByIdAsync(id, ct);
        if (emp != null)
        {
            emp.Deactivate();
            await _employeeRepo.UpdateAsync(emp, ct);
        }
    }

    public async Task<List<EmployeeDto>> GetByTeamAsync(string team, CancellationToken ct = default)
    {
        var result = await _employeeRepo.GetByTeamAsync(team, ct);
        return result.Select(MapToDto).ToList();
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
