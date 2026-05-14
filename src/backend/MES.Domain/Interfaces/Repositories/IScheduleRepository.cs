using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Quality;
using MES.Domain.Entities.Scheduling;

namespace MES.Domain.Interfaces.Repositories;

/// <summary>
/// 排产计划仓储接口
/// </summary>
public interface IScheduleRepository
{
    Task<List<SchedulePlan>> GetAllAsync(CancellationToken ct = default);
    Task<SchedulePlan?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<SchedulePlan> CreateAsync(SchedulePlan plan, CancellationToken ct = default);
    Task<SchedulePlan> UpdateAsync(SchedulePlan plan, CancellationToken ct = default);
    Task DeleteAsync(string id, CancellationToken ct = default);
    Task<SchedulePlan?> GetCurrentPlanAsync(CancellationToken ct = default);
    Task SaveFeedbackAsync(ScheduleAdoptionFeedback feedback, CancellationToken ct = default);
}
