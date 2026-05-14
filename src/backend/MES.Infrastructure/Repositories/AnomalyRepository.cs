using MES.Domain.Entities.Anomalies;
using MES.Domain.Interfaces.Repositories;
using MES.Domain.ValueObjects;
using MES.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MES.Infrastructure.Repositories;

public class AnomalyRepository : IAnomalyRepository
{
    private readonly MesDbContext _context;

    public AnomalyRepository(MesDbContext context)
    {
        _context = context;
    }

    public async Task<ProductionAnomaly?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        return await _context.ProductionAnomalies.FirstOrDefaultAsync(e => e.Id == id, ct);
    }

    public async Task<List<ProductionAnomaly>> GetOpenByWorkOrderAsync(WorkOrderNumber workOrderNumber, CancellationToken ct = default)
    {
        return await _context.ProductionAnomalies
            .Where(e => e.WorkOrderNumber == workOrderNumber && (e.Status == AnomalyStatus.Open || e.Status == AnomalyStatus.Acknowledged))
            .ToListAsync(ct);
    }

    public async Task<List<ProductionAnomaly>> GetCriticalOpenAsync(CancellationToken ct = default)
    {
        return await _context.ProductionAnomalies
            .Where(e => e.Severity == AnomalySeverity.Critical && (e.Status == AnomalyStatus.Open || e.Status == AnomalyStatus.Acknowledged))
            .ToListAsync(ct);
    }

    public async Task<ProductionAnomaly> AddAsync(ProductionAnomaly anomaly, CancellationToken ct = default)
    {
        _context.ProductionAnomalies.Add(anomaly);
        await _context.SaveChangesAsync(ct);
        return anomaly;
    }

    public async Task<ProductionAnomaly> UpdateAsync(ProductionAnomaly anomaly, CancellationToken ct = default)
    {
        _context.ProductionAnomalies.Update(anomaly);
        await _context.SaveChangesAsync(ct);
        return anomaly;
    }
}
