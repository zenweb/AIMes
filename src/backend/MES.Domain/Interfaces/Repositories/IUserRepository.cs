using MES.Domain.Entities.Admin;

namespace MES.Domain.Interfaces.Repositories;

public interface IUserRepository
{
    Task<SystemUser?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<SystemUser?> GetByUsernameAsync(string username, CancellationToken ct = default);
    Task<List<SystemUser>> GetAllAsync(CancellationToken ct = default);
    Task<List<SystemUser>> GetPagedAsync(int page, int pageSize, CancellationToken ct = default);
    Task<int> CountAsync(CancellationToken ct = default);
    Task<SystemUser> CreateAsync(SystemUser user, CancellationToken ct = default);
    Task<SystemUser> UpdateAsync(SystemUser user, CancellationToken ct = default);
}
