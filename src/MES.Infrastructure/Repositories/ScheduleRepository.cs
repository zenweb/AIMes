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
/// 排产计划仓储实现
/// </summary>
public class ScheduleRepository : IScheduleRepository
{
    private readonly MesDbContext _context;

    public ScheduleRepository(MesDbContext context)
    {
        _context = context;
    }

    public async Task<List<SchedulePlan>> GetAllAsync()
    {
        return await _context.SchedulePlans
            .Include(p => p.Items)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<SchedulePlan?> GetByIdAsync(string id)
    {
        return await _context.SchedulePlans
            .Include(p => p.Items)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<SchedulePlan> CreateAsync(SchedulePlan plan)
    {
        plan.CreatedAt = DateTime.UtcNow;
        plan.Id = string.IsNullOrEmpty(plan.Id) ? Guid.NewGuid().ToString() : plan.Id;

        _context.SchedulePlans.Add(plan);
        await _context.SaveChangesAsync();
        return plan;
    }

    public async Task<SchedulePlan> UpdateAsync(SchedulePlan plan)
    {
        plan.UpdatedAt = DateTime.UtcNow;
        _context.SchedulePlans.Update(plan);
        await _context.SaveChangesAsync();
        return plan;
    }

    public async Task DeleteAsync(string id)
    {
        var plan = await GetByIdAsync(id);
        if (plan != null)
        {
            _context.SchedulePlans.Remove(plan);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<SchedulePlan?> GetCurrentPlanAsync()
    {
        var now = DateTime.UtcNow;
        return await _context.SchedulePlans
            .Include(p => p.Items)
            .Where(p => p.PlanStartDate <= now && p.PlanEndDate >= now)
            .OrderByDescending(p => p.CreatedAt)
            .FirstOrDefaultAsync();
    }
}
