using MES.Domain.Entities.Admin;

namespace MES.Domain.Interfaces.Repositories;

public interface IRefreshTokenRepository
{
    Task<RefreshToken?> GetByTokenAsync(string token, CancellationToken ct = default);
    Task CreateAsync(RefreshToken refreshToken, CancellationToken ct = default);
    Task DeleteAsync(string id, CancellationToken ct = default);
    Task DeleteByUsernameAsync(string username, CancellationToken ct = default);
    Task CleanupExpiredAsync(CancellationToken ct = default);
}
