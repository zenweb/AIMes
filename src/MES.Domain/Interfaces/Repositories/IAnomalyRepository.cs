using MES.Domain.Entities.Anomalies;
using MES.Domain.ValueObjects;

namespace MES.Domain.Interfaces.Repositories;

public interface IAnomalyRepository
{
    Task<ProductionAnomaly?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<List<ProductionAnomaly>> GetOpenByWorkOrderAsync(WorkOrderNumber workOrderNumber, CancellationToken ct = default);
    Task<List<ProductionAnomaly>> GetCriticalOpenAsync(CancellationToken ct = default);
    Task<ProductionAnomaly> AddAsync(ProductionAnomaly anomaly, CancellationToken ct = default);
    Task<ProductionAnomaly> UpdateAsync(ProductionAnomaly anomaly, CancellationToken ct = default);
}
