using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Quality;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Interfaces.Repositories;
using MES.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MES.Infrastructure.Repositories;

/// <summary>
/// 质量检验仓储实现
/// </summary>
public class QualityInspectionRepository : IQualityInspectionRepository
{
    private readonly MesDbContext _context;

    public QualityInspectionRepository(MesDbContext context)
    {
        _context = context;
    }

    public async Task<List<QualityInspection>> GetAllAsync()
    {
        return await _context.QualityInspections
            .OrderByDescending(i => i.InspectedAt)
            .ToListAsync();
    }

    public async Task<QualityInspection?> GetByIdAsync(string id)
    {
        return await _context.QualityInspections
            .FirstOrDefaultAsync(i => i.Id == id);
    }

    public async Task<QualityInspection> CreateAsync(QualityInspection inspection)
    {
        inspection.Id = string.IsNullOrEmpty(inspection.Id) ? Guid.NewGuid().ToString() : inspection.Id;

        _context.QualityInspections.Add(inspection);
        await _context.SaveChangesAsync();
        return inspection;
    }

    public async Task<List<QualityInspection>> GetByWorkOrderAsync(string workOrderId)
    {
        return await _context.QualityInspections
            .Where(i => i.WorkOrderId == workOrderId)
            .OrderByDescending(i => i.InspectedAt)
            .ToListAsync();
    }

    public async Task<List<QualityInspection>> GetByProductAsync(string productCode)
    {
        return await _context.QualityInspections
            .Where(i => i.ProductCode == productCode)
            .OrderByDescending(i => i.InspectedAt)
            .ToListAsync();
    }

    public async Task<List<QualityInspection>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        return await _context.QualityInspections
            .Where(i => i.InspectedAt >= startDate && i.InspectedAt <= endDate)
            .OrderByDescending(i => i.InspectedAt)
            .ToListAsync();
    }

    public async Task<List<QualityInspection>> GetRecentInspectionsAsync(string processParameter, int count)
    {
        return await _context.QualityInspections
            .Where(i => i.ProcessName == processParameter || i.InspectionPoint == processParameter)
            .OrderByDescending(i => i.InspectedAt)
            .Take(count)
            .ToListAsync();
    }
}
