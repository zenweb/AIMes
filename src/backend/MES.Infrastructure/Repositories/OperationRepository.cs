using MES.Domain.Entities.Production;
using MES.Domain.Interfaces.Repositories;
using MES.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MES.Infrastructure.Repositories;

public class OperationRepository : IOperationRepository
{
    private readonly MesDbContext _context;

    public OperationRepository(MesDbContext context)
    {
        _context = context;
    }

    public async Task<OperationExecution?> GetExecutionByIdAsync(string id, CancellationToken ct = default)
    {
        return await _context.OperationExecutions.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id, ct);
    }

    public async Task<OperationExecution?> GetExecutionByCodeAsync(string operationCode, CancellationToken ct = default)
    {
        return await _context.OperationExecutions
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.OperationCode == operationCode || e.Id == operationCode, ct);
    }

    public Task<OperationExecution> AddExecutionAsync(OperationExecution execution, CancellationToken ct = default)
    {
        _context.OperationExecutions.Add(execution);
        return Task.FromResult(execution);
    }

    public Task<OperationExecution> UpdateExecutionAsync(OperationExecution execution, CancellationToken ct = default)
    {
        _context.OperationExecutions.Update(execution);
        return Task.FromResult(execution);
    }

    public Task<OperationReport> AddReportAsync(OperationReport report, CancellationToken ct = default)
    {
        _context.OperationReports.Add(report);
        return Task.FromResult(report);
    }
}
