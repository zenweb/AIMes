using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Quality;
using MES.Domain.Entities.Scheduling;

namespace MES.Domain.Interfaces.Repositories;

/// <summary>
/// 物料仓储接口
/// </summary>
public interface IMaterialRepository
{
    Task<List<Material>> GetAllAsync();
    Task<Material?> GetByIdAsync(string id);
    Task<Material?> GetByCodeAsync(string materialCode);
    Task<Material> CreateAsync(Material material);
    Task<Material> UpdateAsync(Material material);
    Task DeleteAsync(string id);
    Task<bool> CheckAvailabilityAsync(string materialCode, int quantity);
}