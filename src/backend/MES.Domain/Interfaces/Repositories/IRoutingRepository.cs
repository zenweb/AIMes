using MES.Domain.Entities.Routing;
using MES.Domain.ValueObjects;

namespace MES.Domain.Interfaces.Repositories;

public interface IRoutingRepository
{
    Task<List<ProcessRoute>> GetAllAsync(CancellationToken ct = default);
    Task<List<ProcessRoute>> GetPagedAsync(int page, int pageSize, CancellationToken ct = default);
    Task<int> CountAsync(CancellationToken ct = default);
    Task<ProcessRoute?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<List<ProcessRoute>> GetByProductCodeAsync(ProductCode productCode, CancellationToken ct = default);
    Task<ProcessRoute?> GetByRouteCodeAsync(string routeCode, CancellationToken ct = default);
    Task<ProcessRoute> AddAsync(ProcessRoute route, CancellationToken ct = default);
    Task<ProcessRoute> UpdateAsync(ProcessRoute route, CancellationToken ct = default);
}
