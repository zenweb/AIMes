using MES.Domain.Entities.Admin;
using MES.Domain.Interfaces.Repositories;
using MES.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MES.Infrastructure.Repositories;

public class RefreshTokenRepository : IRefreshTokenRepository
{
    private readonly MesDbContext _context;

    public RefreshTokenRepository(MesDbContext context)
    {
        _context = context;
    }

    public async Task<RefreshToken?> GetByTokenAsync(string token, CancellationToken ct = default)
    {
        return await _context.RefreshTokens
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Token == token, ct);
    }

    public async Task CreateAsync(RefreshToken refreshToken, CancellationToken ct = default)
    {
        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(string id, CancellationToken ct = default)
    {
        var rows = await _context.RefreshTokens
            .Where(r => r.Id == id)
            .ExecuteDeleteAsync(ct);
    }

    public async Task DeleteByUsernameAsync(string username, CancellationToken ct = default)
    {
        await _context.RefreshTokens
            .Where(r => r.Username == username)
            .ExecuteDeleteAsync(ct);
    }

    public async Task CleanupExpiredAsync(CancellationToken ct = default)
    {
        await _context.RefreshTokens
            .Where(r => r.ExpiresAt <= DateTime.UtcNow)
            .ExecuteDeleteAsync(ct);
    }
}
