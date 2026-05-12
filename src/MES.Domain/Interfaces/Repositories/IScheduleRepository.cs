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
    Task<List<SchedulePlan>> GetAllAsync();
    Task<SchedulePlan?> GetByIdAsync(string id);
    Task<SchedulePlan> CreateAsync(SchedulePlan plan);
    Task<SchedulePlan> UpdateAsync(SchedulePlan plan);
    Task DeleteAsync(string id);
    Task<SchedulePlan?> GetCurrentPlanAsync();
}