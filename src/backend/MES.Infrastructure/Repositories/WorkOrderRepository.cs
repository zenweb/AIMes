using MES.Domain.Entities.Production;
using MES.Domain.Enums;
using MES.Domain.Interfaces.Repositories;
using MES.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MES.Infrastructure.Repositories;

public class WorkOrderRepository : IWorkOrderRepository
{
    private readonly MesDbContext _context;

    public WorkOrderRepository(MesDbContext context)
    {
        _context = context;
    }

    public async Task<List<WorkOrder>> GetAllAsync(WorkOrderStatus? status = null, CancellationToken ct = default)
    {
        return await BuildListQuery(status, null, null, null, null)
            .OrderByDescending(w => w.Priority)
            .ThenBy(w => w.PlannedStartDate)
            .ThenBy(w => w.Id)
            .ToListAsync(ct);
    }

    public async Task<List<WorkOrder>> GetPagedAsync(
        WorkOrderStatus? status,
        string? workshopId,
        string? productCode,
        DateTime? startDate,
        DateTime? endDate,
        int page,
        int pageSize,
        CancellationToken ct = default)
    {
        return await BuildListQuery(status, workshopId, productCode, startDate, endDate)
            .OrderByDescending(w => w.Priority)
            .ThenBy(w => w.PlannedStartDate)
            .ThenBy(w => w.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);
    }

    public async Task<int> CountAsync(
        WorkOrderStatus? status,
        string? workshopId,
        string? productCode,
        DateTime? startDate,
        DateTime? endDate,
        CancellationToken ct = default)
    {
        return await BuildListQuery(status, workshopId, productCode, startDate, endDate)
            .CountAsync(ct);
    }

    public async Task<WorkOrder?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        return await _context.WorkOrders
            .AsNoTracking()
            .FirstOrDefaultAsync(w => w.Id == id, ct);
    }

    public async Task<WorkOrder?> GetByCodeAsync(string code, CancellationToken ct = default)
    {
        return await _context.WorkOrders
            .AsNoTracking()
            .FirstOrDefaultAsync(w => w.OrderNumber == code || w.Id == code, ct);
    }

    public async Task<WorkOrder> CreateAsync(WorkOrder workOrder, CancellationToken ct = default)
    {
        _context.WorkOrders.Add(workOrder);
        await _context.SaveChangesAsync(ct);
        return workOrder;
    }

    public Task<WorkOrder> UpdateAsync(WorkOrder workOrder, CancellationToken ct = default)
    {
        _context.WorkOrders.Update(workOrder);
        return Task.FromResult(workOrder);
    }

    public async Task DeleteAsync(string id, CancellationToken ct = default)
    {
        var workOrder = await GetByIdAsync(id, ct);
        if (workOrder != null)
        {
            _context.WorkOrders.Remove(workOrder);
            await _context.SaveChangesAsync(ct);
        }
    }

    public async Task<List<WorkOrder>> GetByWorkshopAsync(string workshopId, CancellationToken ct = default)
    {
        return await _context.WorkOrders
            .AsNoTracking()
            .Where(w => w.WorkshopId == workshopId)
            .OrderByDescending(w => w.Priority)
            .ThenBy(w => w.PlannedStartDate)
            .ToListAsync(ct);
    }

    public async Task<List<WorkOrder>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken ct = default)
    {
        return await _context.WorkOrders
            .AsNoTracking()
            .Where(w => w.PlannedStartDate >= startDate && w.PlannedEndDate <= endDate)
            .OrderBy(w => w.PlannedStartDate)
            .ToListAsync(ct);
    }

    private IQueryable<WorkOrder> BuildListQuery(
        WorkOrderStatus? status,
        string? workshopId,
        string? productCode,
        DateTime? startDate,
        DateTime? endDate)
    {
        var query = _context.WorkOrders.AsNoTracking();

        if (status.HasValue)
            query = query.Where(w => w.Status == status.Value);

        if (!string.IsNullOrEmpty(workshopId))
            query = query.Where(w => w.WorkshopId == workshopId);

        if (!string.IsNullOrEmpty(productCode))
            query = query.Where(w => w.ProductCode == productCode);

        if (startDate.HasValue)
            query = query.Where(w => w.PlannedStartDate >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(w => w.PlannedEndDate <= endDate.Value);

        return query;
    }
}
