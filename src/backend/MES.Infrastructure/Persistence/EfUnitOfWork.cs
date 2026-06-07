using MES.Domain.Interfaces.Services;
using MES.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MES.Infrastructure.Persistence;

/// <summary>
/// IUnitOfWork EF Core 实现（lambda 模式 + IExecutionStrategy）。
/// - 关系型 provider（PostgreSQL/SqlServer）走 ExecutionStrategy，自动重试瞬时故障 + 用户事务。
/// - InMemory provider 不支持事务，仅跳过事务外壳，仍由 UoW 统一 SaveChanges。
/// </summary>
public sealed class EfUnitOfWork : IUnitOfWork
{
    private readonly MesDbContext _context;

    public EfUnitOfWork(MesDbContext context)
    {
        _context = context;
    }

    public async Task<T> ExecuteAsync<T>(Func<CancellationToken, Task<T>> action, CancellationToken ct = default)
    {
        if (!_context.Database.IsRelational())
        {
            var result = await action(ct);
            await _context.SaveChangesAsync(ct);
            return result;
        }

        var strategy = _context.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            await using var transaction = await _context.Database.BeginTransactionAsync(ct);
            var result = await action(ct);
            await _context.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);
            return result;
        });
    }

    public async Task ExecuteAsync(Func<CancellationToken, Task> action, CancellationToken ct = default)
    {
        // 复用泛型版本，避免重复包裹 strategy/transaction 逻辑
        await ExecuteAsync<object?>(async innerCt =>
        {
            await action(innerCt);
            return null;
        }, ct);
    }
}
