namespace MES.Domain.Interfaces.Services;

/// <summary>
/// 工作单元接口。把多次跨 Repository 的 SaveChanges 包在一个事务里。
/// InMemory provider 不支持事务，实现层应做 no-op fallback。
/// </summary>
public interface IUnitOfWork
{
    /// <summary>
    /// 开启事务，返回一个 IDisposable handle。
    /// dispose 时自动 commit；若已 abort 则 rollback。
    /// </summary>
    Task<IUnitOfWorkScope> BeginAsync(CancellationToken ct = default);
}

public interface IUnitOfWorkScope : IAsyncDisposable
{
    /// <summary>
    /// 显式提交。dispose 时若已提交则不重复执行。
    /// </summary>
    Task CommitAsync(CancellationToken ct = default);
}
