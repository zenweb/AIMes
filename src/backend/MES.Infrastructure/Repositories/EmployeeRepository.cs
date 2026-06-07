using MES.Domain.Entities.Employee;
using MES.Domain.Interfaces.Repositories;
using MES.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MES.Infrastructure.Repositories;

public class EmployeeRepository : IEmployeeRepository
{
    private readonly MesDbContext _context;

    public EmployeeRepository(MesDbContext context)
    {
        _context = context;
    }

    public async Task<List<Employee>> GetAllAsync(CancellationToken ct = default)
    {
        return await _context.Employees.AsNoTracking().OrderBy(e => e.EmployeeNumber).ToListAsync(ct);
    }

    public async Task<List<Employee>> GetPagedAsync(int page, int pageSize, CancellationToken ct = default)
    {
        return await _context.Employees
            .AsNoTracking()
            .OrderBy(e => e.EmployeeNumber)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);
    }

    public async Task<int> CountAsync(CancellationToken ct = default)
    {
        return await _context.Employees.CountAsync(ct);
    }

    public async Task<Employee?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        return await _context.Employees.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id, ct);
    }

    public async Task<List<Employee>> GetByTeamAsync(string team, CancellationToken ct = default)
    {
        return await _context.Employees.AsNoTracking().Where(e => e.Team == team).ToListAsync(ct);
    }

    public async Task AddAsync(Employee employee, CancellationToken ct = default)
    {
        _context.Employees.Add(employee);
        await _context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Employee employee, CancellationToken ct = default)
    {
        _context.Employees.Update(employee);
        await _context.SaveChangesAsync(ct);
    }

    public async Task<bool> ExistsAsync(string id, CancellationToken ct = default)
    {
        return await _context.Employees.AnyAsync(e => e.Id == id, ct);
    }
}
