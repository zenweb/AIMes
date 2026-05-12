using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Quality;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Enums;
using MES.Domain.Interfaces.Repositories;
using MES.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MES.Infrastructure.Repositories;

/// <summary>
/// 工单仓储实现
/// </summary>
public class WorkOrderRepository : IWorkOrderRepository
{
    private readonly MesDbContext _context;

    public WorkOrderRepository(MesDbContext context)
    {
        _context = context;
    }

    public async Task<List<WorkOrder>> GetAllAsync(WorkOrderStatus? status = null)
    {
        var query = _context.WorkOrders.AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(w => w.Status == status.Value);
        }

        return await query
            .OrderByDescending(w => w.Priority)
            .ThenBy(w => w.PlannedStartDate)
            .ToListAsync();
    }

    public async Task<WorkOrder?> GetByIdAsync(string id)
    {
        return await _context.WorkOrders
            .FirstOrDefaultAsync(w => w.Id == id);
    }

    public async Task<WorkOrder> CreateAsync(WorkOrder workOrder)
    {
        workOrder.CreatedAt = DateTime.UtcNow;
        workOrder.Id = string.IsNullOrEmpty(workOrder.Id) ? Guid.NewGuid().ToString() : workOrder.Id;

        _context.WorkOrders.Add(workOrder);
        await _context.SaveChangesAsync();
        return workOrder;
    }

    public async Task<WorkOrder> UpdateAsync(WorkOrder workOrder)
    {
        workOrder.UpdatedAt = DateTime.UtcNow;
        _context.WorkOrders.Update(workOrder);
        await _context.SaveChangesAsync();
        return workOrder;
    }

    public async Task DeleteAsync(string id)
    {
        var workOrder = await GetByIdAsync(id);
        if (workOrder != null)
        {
            _context.WorkOrders.Remove(workOrder);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<List<WorkOrder>> GetByWorkshopAsync(string workshopId)
    {
        return await _context.WorkOrders
            .Where(w => w.WorkshopId == workshopId)
            .OrderByDescending(w => w.Priority)
            .ThenBy(w => w.PlannedStartDate)
            .ToListAsync();
    }

    public async Task<List<WorkOrder>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        return await _context.WorkOrders
            .Where(w => w.PlannedStartDate >= startDate && w.PlannedEndDate <= endDate)
            .OrderBy(w => w.PlannedStartDate)
            .ToListAsync();
    }
}
