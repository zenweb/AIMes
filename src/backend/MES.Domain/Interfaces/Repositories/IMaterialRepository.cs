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
    Task<List<Material>> GetAllAsync(CancellationToken ct = default);
    Task<Material?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<Material?> GetByCodeAsync(string materialCode, CancellationToken ct = default);
    Task<Material?> GetByCodeForUpdateAsync(string materialCode, CancellationToken ct = default);
    Task<Material> CreateAsync(Material material, CancellationToken ct = default);
    Task<Material> UpdateAsync(Material material, CancellationToken ct = default);
    Task DeleteAsync(string id, CancellationToken ct = default);
    Task<bool> CheckAvailabilityAsync(string materialCode, int quantity, CancellationToken ct = default);
}
