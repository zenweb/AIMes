using MES.Domain.Interfaces.Services;
using MES.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace MES.Infrastructure.Persistence;

/// <summary>
/// IUnitOfWork EF Core 实现。
/// 实际 provider 不支持事务时（InMemory/relational-on-pg-test）退化为 no-op，
/// 仍保留 SaveChanges 的语义但不提供原子保证。
/// </summary>
public sealed class EfUnitOfWork : IUnitOfWork
{
    private readonly MesDbContext _context;

    public EfUnitOfWork(MesDbContext context)
    {
        _context = context;
    }

    public async Task<IUnitOfWorkScope> BeginAsync(CancellationToken ct = default)
    {
        // InMemory provider 不支持事务，返回 no-op scope
        if (!_context.Database.IsRelational())
        {
            return new NoOpScope();
        }

        var transaction = await _context.Database.BeginTransactionAsync(ct);
        return new EfScope(transaction);
    }

    private sealed class EfScope : IUnitOfWorkScope
    {
        private readonly IDbContextTransaction _transaction;
        private bool _committed;

        public EfScope(IDbContextTransaction transaction)
        {
            _transaction = transaction;
        }

        public async Task CommitAsync(CancellationToken ct = default)
        {
            if (_committed) return;
            await _transaction.CommitAsync(ct);
            _committed = true;
        }

        public async ValueTask DisposeAsync()
        {
            if (!_committed)
            {
                await _transaction.RollbackAsync();
            }
            await _transaction.DisposeAsync();
        }
    }

    private sealed class NoOpScope : IUnitOfWorkScope
    {
        public Task CommitAsync(CancellationToken ct = default) => Task.CompletedTask;
        public ValueTask DisposeAsync() => ValueTask.CompletedTask;
    }
}
