using MES.Domain.Entities.Admin;

namespace MES.Domain.Interfaces.Repositories;

public interface ISystemConfigRepository
{
    Task<List<SystemConfig>> GetAllAsync(CancellationToken ct = default);
    Task<SystemConfig?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<SystemConfig> UpdateAsync(SystemConfig config, CancellationToken ct = default);
}
