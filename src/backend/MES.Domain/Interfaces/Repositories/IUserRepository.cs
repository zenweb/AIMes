using MES.Domain.Entities.Admin;

namespace MES.Domain.Interfaces.Repositories;

public interface IUserRepository
{
    Task<SystemUser?> GetByUsernameAsync(string username, CancellationToken ct = default);
    Task<List<SystemUser>> GetAllAsync(CancellationToken ct = default);
    Task<SystemUser> CreateAsync(SystemUser user, CancellationToken ct = default);
    Task<SystemUser> UpdateAsync(SystemUser user, CancellationToken ct = default);
}
