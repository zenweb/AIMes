using MES.Domain.Entities.Quality;
using MES.Domain.Interfaces.Repositories;
using MES.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MES.Infrastructure.Repositories;

public class QualityInspectionRepository : IQualityInspectionRepository
{
    private readonly MesDbContext _context;

    public QualityInspectionRepository(MesDbContext context)
    {
        _context = context;
    }

    public async Task<List<QualityInspection>> GetAllAsync(CancellationToken ct = default)
    {
        return await _context.QualityInspections
            .AsNoTracking()
            .OrderByDescending(i => i.InspectedAt)
            .ToListAsync(ct);
    }

    public async Task<QualityInspection?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        return await _context.QualityInspections
            .FirstOrDefaultAsync(i => i.Id == id, ct);
    }

    public async Task<QualityInspection> CreateAsync(QualityInspection inspection, CancellationToken ct = default)
    {
        _context.QualityInspections.Add(inspection);
        await _context.SaveChangesAsync(ct);
        return inspection;
    }

    public async Task<List<QualityInspection>> GetByWorkOrderAsync(string workOrderId, CancellationToken ct = default)
    {
        return await _context.QualityInspections
            .AsNoTracking()
            .Where(i => i.WorkOrderId == workOrderId)
            .OrderByDescending(i => i.InspectedAt)
            .ToListAsync(ct);
    }

    public async Task<List<QualityInspection>> GetByProductAsync(string productCode, CancellationToken ct = default)
    {
        return await _context.QualityInspections
            .AsNoTracking()
            .Where(i => i.ProductCode == productCode)
            .OrderByDescending(i => i.InspectedAt)
            .ToListAsync(ct);
    }

    public async Task<List<QualityInspection>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken ct = default)
    {
        return await _context.QualityInspections
            .AsNoTracking()
            .Where(i => i.InspectedAt >= startDate && i.InspectedAt <= endDate)
            .OrderByDescending(i => i.InspectedAt)
            .ToListAsync(ct);
    }

    public async Task<List<QualityInspection>> GetRecentInspectionsAsync(string processParameter, int count, CancellationToken ct = default)
    {
        return await _context.QualityInspections
            .AsNoTracking()
            .Where(i => i.ProcessName == processParameter || i.InspectionPoint == processParameter)
            .OrderByDescending(i => i.InspectedAt)
            .Take(count)
            .ToListAsync(ct);
    }
}
