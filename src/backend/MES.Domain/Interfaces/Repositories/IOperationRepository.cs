using MES.Domain.Entities.Production;

namespace MES.Domain.Interfaces.Repositories;

public interface IOperationRepository
{
    Task<OperationExecution?> GetExecutionByIdAsync(string id, CancellationToken ct = default);
    Task<OperationExecution?> GetExecutionByCodeAsync(string operationCode, CancellationToken ct = default);
    Task<OperationExecution?> GetFirstExecutionByWorkOrderIdAsync(string workOrderId, CancellationToken ct = default);
    Task<IReadOnlyList<OperationExecution>> GetExecutionsByWorkOrderIdAsync(string workOrderId, CancellationToken ct = default);
    Task<OperationExecution> AddExecutionAsync(OperationExecution execution, CancellationToken ct = default);
    Task<OperationExecution> UpdateExecutionAsync(OperationExecution execution, CancellationToken ct = default);
    Task<OperationReport> AddReportAsync(OperationReport report, CancellationToken ct = default);
}
