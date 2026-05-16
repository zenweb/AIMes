namespace MES.Domain.Interfaces.Services;

/// <summary>
/// 工作单元接口（lambda 模式）。把多次跨 Repository 的 SaveChanges 包在一个事务里。
/// 实现层用 EF Core 的 <c>IExecutionStrategy.ExecuteAsync</c> 包裹，
/// 让事务能与 retry-on-failure 共存（直接用 BeginTransaction 会与执行策略冲突）。
/// InMemory provider 不支持事务，实现层做 no-op fallback（直接执行 action）。
/// </summary>
public interface IUnitOfWork
{
    /// <summary>
    /// 在单一事务内执行一段返回值的逻辑。
    /// PostgreSQL 等关系数据库会用 IExecutionStrategy 自动重试瞬时故障；
    /// 这意味着 action 必须是幂等的（在 retry 重做时业务结果仍正确）。
    /// </summary>
    Task<T> ExecuteAsync<T>(Func<CancellationToken, Task<T>> action, CancellationToken ct = default);

    /// <summary>
    /// 在单一事务内执行一段无返回值的逻辑。
    /// </summary>
    Task ExecuteAsync(Func<CancellationToken, Task> action, CancellationToken ct = default);
}
