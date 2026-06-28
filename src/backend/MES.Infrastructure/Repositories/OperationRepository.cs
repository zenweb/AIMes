using MES.Domain.Entities.Production;
using MES.Domain.Interfaces.Repositories;
using MES.Domain.ValueObjects;
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

    public async Task<OperationExecution?> GetFirstExecutionByWorkOrderIdAsync(string workOrderId, CancellationToken ct = default)
    {
        var executions = await GetExecutionsByWorkOrderIdAsync(workOrderId, ct);
        return executions.FirstOrDefault();
    }

    public async Task<IReadOnlyList<OperationExecution>> GetExecutionsByWorkOrderIdAsync(string workOrderId, CancellationToken ct = default)
    {
        var executions = await _context.OperationExecutions
            .AsNoTracking()
            .Where(e => e.WorkOrderId == workOrderId)
            .ToListAsync(ct);

        return executions
            .OrderBy(e => new OperationCode(e.OperationCode).NumericSequence)
            .ThenBy(e => e.OperationCode, StringComparer.OrdinalIgnoreCase)
            .ThenBy(e => e.CreatedAt)
            .ToList();
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
