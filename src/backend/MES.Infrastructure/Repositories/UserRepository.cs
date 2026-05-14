using MES.Domain.Entities.Admin;
using MES.Domain.Interfaces.Repositories;
using MES.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MES.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly MesDbContext _context;

    public UserRepository(MesDbContext context)
    {
        _context = context;
    }

    public async Task<SystemUser?> GetByUsernameAsync(string username, CancellationToken ct = default)
    {
        return await _context.SystemUsers
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Username == username, ct);
    }

    public async Task<List<SystemUser>> GetAllAsync(CancellationToken ct = default)
    {
        return await _context.SystemUsers
            .AsNoTracking()
            .OrderBy(u => u.Username)
            .ToListAsync(ct);
    }

    public async Task<SystemUser> CreateAsync(SystemUser user, CancellationToken ct = default)
    {
        _context.SystemUsers.Add(user);
        await _context.SaveChangesAsync(ct);
        return user;
    }

    public async Task<SystemUser> UpdateAsync(SystemUser user, CancellationToken ct = default)
    {
        _context.SystemUsers.Update(user);
        await _context.SaveChangesAsync(ct);
        return user;
    }
}
