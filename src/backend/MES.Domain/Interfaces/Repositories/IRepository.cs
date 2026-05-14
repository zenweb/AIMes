using MES.Domain.Primitives;

namespace MES.Domain.Interfaces.Repositories;

/// <summary>
/// 泛型仓储基础接口。每个聚合根至少有一个仓储。
/// </summary>
public interface IRepository<T> where T : AggregateRoot
{
    Task<T?> GetByIdAsync(string id, CancellationToken ct = default);
    Task AddAsync(T entity, CancellationToken ct = default);
    Task UpdateAsync(T entity, CancellationToken ct = default);
    Task DeleteAsync(T entity, CancellationToken ct = default);
    Task<bool> ExistsAsync(string id, CancellationToken ct = default);
}
