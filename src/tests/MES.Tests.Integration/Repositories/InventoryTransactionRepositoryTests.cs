using FluentAssertions;
using MES.Application.DTOs;
using MES.Application.Services;
using MES.Domain.Entities.Inventory;
using MES.Domain.Entities.Production;
using MES.Domain.Interfaces.Repositories;
using MES.Infrastructure.Data;
using MES.Infrastructure.Persistence;
using MES.Infrastructure.Repositories;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace MES.Tests.Integration.Repositories;

[Collection("IntegrationSerial")]
public class InventoryTransactionRepositoryTests
{
    [Fact]
    public async Task StockOutAsync_ShouldCommitMaterialUpdateAndTransactionThroughUnitOfWork()
    {
        var previousProvider = Environment.GetEnvironmentVariable("AIMES_DATABASE_PROVIDER");
        Environment.SetEnvironmentVariable("AIMES_DATABASE_PROVIDER", DatabaseProvider.SqlServer);

        try
        {
            await using var connection = new SqliteConnection("Data Source=:memory:");
            await connection.OpenAsync();

            var options = new DbContextOptionsBuilder<MesDbContext>()
                .UseSqlite(connection)
                .Options;

            await using (var setupContext = new MesDbContext(options))
            {
                await setupContext.Database.EnsureCreatedAsync();
                setupContext.Materials.Add(Material.Create(
                    "IT-STOCKOUT-UOW",
                    "UoW 出库测试物料",
                    "PCS",
                    safetyStock: 5,
                    storageLocation: "WH-A",
                    materialType: "原材料",
                    availableQuantity: 100));
                await setupContext.SaveChangesAsync();
            }

            await using (var actContext = new MesDbContext(options))
            {
                var service = new InventoryAppService(
                    new MaterialRepository(actContext),
                    new StockTransactionRepository(actContext),
                    new EfUnitOfWork(actContext),
                    new AuditLogAppService(new AuditLogRepository(actContext)));

                var result = await service.StockOutAsync(new StockOutRequest
                {
                    MaterialCode = "IT-STOCKOUT-UOW",
                    Quantity = 30,
                    Operator = "transaction-test"
                });

                result.TransactionType.Should().Be("StockOut");
                result.BalanceBefore.Should().Be(100);
                result.BalanceAfter.Should().Be(70);
            }

            await using var verifyContext = new MesDbContext(options);
            var material = await verifyContext.Materials
                .AsNoTracking()
                .SingleAsync(m => m.MaterialCode == "IT-STOCKOUT-UOW");
            var transaction = await verifyContext.StockTransactions
                .AsNoTracking()
                .SingleAsync(t => t.MaterialCode == "IT-STOCKOUT-UOW");

            material.AvailableQuantity.Should().Be(70, "the UnitOfWork commit must persist the material decrement");
            transaction.TransactionType.ToString().Should().Be("StockOut");
            transaction.BalanceBefore.Should().Be(100);
            transaction.BalanceAfter.Should().Be(70);

            var auditLog = await verifyContext.AuditLogs
                .AsNoTracking()
                .SingleAsync(log => log.ResourceId == transaction.Id && log.Action == "InventoryStockOut");
            auditLog.Resource.Should().Be("Inventory");
        }
        finally
        {
            Environment.SetEnvironmentVariable("AIMES_DATABASE_PROVIDER", previousProvider);
        }
    }

    [Fact]
    public async Task StockOutAsync_WhenTransactionWriteFails_ShouldNotPersistMaterialDecrement()
    {
        var previousProvider = Environment.GetEnvironmentVariable("AIMES_DATABASE_PROVIDER");
        Environment.SetEnvironmentVariable("AIMES_DATABASE_PROVIDER", DatabaseProvider.SqlServer);

        try
        {
            await using var connection = new SqliteConnection("Data Source=:memory:");
            await connection.OpenAsync();

            var options = new DbContextOptionsBuilder<MesDbContext>()
                .UseSqlite(connection)
                .Options;

            await using (var setupContext = new MesDbContext(options))
            {
                await setupContext.Database.EnsureCreatedAsync();
                setupContext.Materials.Add(Material.Create(
                    "IT-STOCKOUT-FAIL",
                    "UoW 失败回滚测试物料",
                    "PCS",
                    safetyStock: 5,
                    storageLocation: "WH-A",
                    materialType: "原材料",
                    availableQuantity: 100));
                await setupContext.SaveChangesAsync();
            }

            await using (var actContext = new MesDbContext(options))
            {
                var service = new InventoryAppService(
                    new MaterialRepository(actContext),
                    new ThrowingStockTransactionRepository(),
                    new EfUnitOfWork(actContext),
                    new AuditLogAppService(new AuditLogRepository(actContext)));

                var act = () => service.StockOutAsync(new StockOutRequest
                {
                    MaterialCode = "IT-STOCKOUT-FAIL",
                    Quantity = 30,
                    Operator = "transaction-test"
                });

                await act.Should().ThrowAsync<InvalidOperationException>()
                    .WithMessage("stock transaction write failed");
            }

            await using var verifyContext = new MesDbContext(options);
            var material = await verifyContext.Materials
                .AsNoTracking()
                .SingleAsync(m => m.MaterialCode == "IT-STOCKOUT-FAIL");
            var transactionCount = await verifyContext.StockTransactions
                .AsNoTracking()
                .CountAsync(t => t.MaterialCode == "IT-STOCKOUT-FAIL");

            material.AvailableQuantity.Should().Be(100, "the material decrement must not commit without its stock transaction");
            transactionCount.Should().Be(0);
        }
        finally
        {
            Environment.SetEnvironmentVariable("AIMES_DATABASE_PROVIDER", previousProvider);
        }
    }

    private sealed class ThrowingStockTransactionRepository : IStockTransactionRepository
    {
        public Task<List<StockTransaction>> GetPagedAsync(
            string? materialCode,
            int page,
            int pageSize,
            CancellationToken ct = default)
        {
            throw new NotSupportedException();
        }

        public Task<int> CountAsync(string? materialCode, CancellationToken ct = default)
        {
            throw new NotSupportedException();
        }

        public Task<int> CountTodayAsync(CancellationToken ct = default)
        {
            throw new NotSupportedException();
        }

        public Task AddAsync(StockTransaction transaction, CancellationToken ct = default)
        {
            throw new InvalidOperationException("stock transaction write failed");
        }
    }
}
