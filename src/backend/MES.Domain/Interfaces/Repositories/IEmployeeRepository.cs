using MES.Domain.Entities.Employee;

namespace MES.Domain.Interfaces.Repositories;

public interface IEmployeeRepository
{
    Task<List<Employee>> GetAllAsync(CancellationToken ct = default);
    Task<Employee?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<List<Employee>> GetByTeamAsync(string team, CancellationToken ct = default);
    Task AddAsync(Employee employee, CancellationToken ct = default);
    Task UpdateAsync(Employee employee, CancellationToken ct = default);
    Task<bool> ExistsAsync(string id, CancellationToken ct = default);
}
