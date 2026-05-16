using MES.Domain.Entities.Scheduling;
using MES.Domain.Interfaces.Repositories;
using MES.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MES.Infrastructure.Repositories;

public class ScheduleRepository : IScheduleRepository
{
    private readonly MesDbContext _context;

    public ScheduleRepository(MesDbContext context)
    {
        _context = context;
    }

    public async Task<List<SchedulePlan>> GetAllAsync(CancellationToken ct = default)
    {
        return await _context.SchedulePlans
            .AsNoTracking()
            .Include(p => p.Items)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<SchedulePlan?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        return await _context.SchedulePlans
            .Include(p => p.Items)
            .FirstOrDefaultAsync(p => p.Id == id, ct);
    }

    public async Task<SchedulePlan> CreateAsync(SchedulePlan plan, CancellationToken ct = default)
    {
        _context.SchedulePlans.Add(plan);
        await _context.SaveChangesAsync(ct);
        return plan;
    }

    public async Task<SchedulePlan> UpdateAsync(SchedulePlan plan, CancellationToken ct = default)
    {
        _context.SchedulePlans.Update(plan);
        await _context.SaveChangesAsync(ct);
        return plan;
    }

    public async Task DeleteAsync(string id, CancellationToken ct = default)
    {
        var plan = await GetByIdAsync(id, ct);
        if (plan != null)
        {
            _context.SchedulePlans.Remove(plan);
            await _context.SaveChangesAsync(ct);
        }
    }

    public async Task<SchedulePlan?> GetCurrentPlanAsync(CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        return await _context.SchedulePlans
            .Include(p => p.Items)
            .Where(p => p.PlanStartDate <= now && p.PlanEndDate >= now)
            .OrderByDescending(p => p.CreatedAt)
            .FirstOrDefaultAsync(ct);
    }

    public async Task SaveFeedbackAsync(ScheduleAdoptionFeedback feedback, CancellationToken ct = default)
    {
        _context.ScheduleAdoptionFeedbacks.Add(feedback);
        await _context.SaveChangesAsync(ct);
    }
}
