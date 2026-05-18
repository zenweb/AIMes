using MES.Domain.Entities.Routing;
using MES.Domain.Interfaces.Repositories;
using MES.Domain.ValueObjects;
using MES.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MES.Infrastructure.Repositories;

public class RoutingRepository : IRoutingRepository
{
    private readonly MesDbContext _context;

    public RoutingRepository(MesDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProcessRoute>> GetAllAsync(CancellationToken ct = default)
    {
        return await _context.ProcessRoutes
            .AsNoTracking()
            .OrderBy(e => e.RouteCode)
            .ToListAsync(ct);
    }

    public async Task<ProcessRoute?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        return await _context.ProcessRoutes.FirstOrDefaultAsync(e => e.Id == id, ct);
    }

    public async Task<List<ProcessRoute>> GetByProductCodeAsync(ProductCode productCode, CancellationToken ct = default)
    {
        return await _context.ProcessRoutes.AsNoTracking().Where(e => e.ProductCode == productCode).ToListAsync(ct);
    }

    public async Task<ProcessRoute?> GetByRouteCodeAsync(string routeCode, CancellationToken ct = default)
    {
        return await _context.ProcessRoutes.FirstOrDefaultAsync(e => e.RouteCode == routeCode, ct);
    }

    public async Task<ProcessRoute> AddAsync(ProcessRoute route, CancellationToken ct = default)
    {
        _context.ProcessRoutes.Add(route);
        await _context.SaveChangesAsync(ct);
        return route;
    }

    public async Task<ProcessRoute> UpdateAsync(ProcessRoute route, CancellationToken ct = default)
    {
        _context.ProcessRoutes.Update(route);
        await _context.SaveChangesAsync(ct);
        return route;
    }
}
