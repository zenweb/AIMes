using FluentAssertions;
using MES.Application.Services;
using MES.Domain.Entities.Purchase;
using MES.Infrastructure.Data;
using MES.Infrastructure.Persistence;
using MES.Infrastructure.Repositories;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace MES.Tests.Integration.Repositories;

[Collection("IntegrationSerial")]
public class PurchaseTransactionRepositoryTests
{
    [Fact]
    public async Task SubmitAsync_ShouldCommitPurchaseStatusThroughUnitOfWork()
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
            string orderId;

            await using (var setupContext = new MesDbContext(options))
            {
                await setupContext.Database.EnsureCreatedAsync();
                var order = new PurchaseOrder(
                    "IT-PO-UOW",
                    "UoW 采购测试供应商",
                    null,
                    DateTime.UtcNow.AddDays(7),
                    null,
                    "transaction-test");
                order.AddItem(new PurchaseOrderLineItem
                {
                    MaterialCode = "MAT-UOW",
                    MaterialName = "UoW 采购物料",
                    Unit = "PCS",
                    Quantity = 10,
                    UnitPrice = 5
                });
                orderId = order.Id;
                setupContext.PurchaseOrders.Add(order);
                await setupContext.SaveChangesAsync();
            }

            await using (var actContext = new MesDbContext(options))
            {
                var service = new PurchaseAppService(
                    new PurchaseOrderRepository(actContext),
                    new EfUnitOfWork(actContext),
                    new AuditLogAppService(new AuditLogRepository(actContext)));

                var result = await service.SubmitAsync(orderId);

                result.Status.Should().Be("Submitted");
            }

            await using var verifyContext = new MesDbContext(options);
            var savedOrder = await verifyContext.PurchaseOrders
                .AsNoTracking()
                .SingleAsync(o => o.Id == orderId);

            savedOrder.Status.Should().Be(PurchaseOrderStatus.Submitted);

            var auditLog = await verifyContext.AuditLogs
                .AsNoTracking()
                .SingleAsync(log => log.ResourceId == orderId && log.Action == "PurchaseSubmit");
            auditLog.Resource.Should().Be("PurchaseOrder");
        }
        finally
        {
            Environment.SetEnvironmentVariable("AIMES_DATABASE_PROVIDER", previousProvider);
        }
    }
}
