using FluentAssertions;
using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Scheduling;
using MES.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MES.Tests.Integration.Repositories;

[Collection("IntegrationSerial")]
public class ConcurrencyTokenTests
{
    [Fact]
    public async Task WorkOrder_Update_WithStaleVersion_ShouldThrowConcurrencyException()
    {
        await using var scope = await CreateScopeAsync();
        await using (var setupContext = scope.CreateContext())
        {
            setupContext.WorkOrders.Add(WorkOrder.Create(
                "WO-CONC-001",
                "PROD-001",
                "Concurrency Product",
                10,
                new DateTime(2026, 6, 1, 8, 0, 0, DateTimeKind.Utc),
                new DateTime(2026, 6, 2, 8, 0, 0, DateTimeKind.Utc),
                "WS-001"));
            await setupContext.SaveChangesAsync();
        }

        await using var staleContext = scope.CreateContext();
        var workOrder = await staleContext.WorkOrders.SingleAsync(w => w.OrderNumber == "WO-CONC-001");
        workOrder.Schedule(
            new DateTime(2026, 6, 1, 9, 0, 0, DateTimeKind.Utc),
            new DateTime(2026, 6, 2, 9, 0, 0, DateTimeKind.Utc),
            5);

        await scope.BumpVersionAsync("work_orders", workOrder.Id);

        var act = () => staleContext.SaveChangesAsync();

        await act.Should().ThrowAsync<DbUpdateConcurrencyException>();
    }

    [Fact]
    public async Task Equipment_Update_WithStaleVersion_ShouldThrowConcurrencyException()
    {
        await using var scope = await CreateScopeAsync();
        await using (var setupContext = scope.CreateContext())
        {
            setupContext.Equipment.Add(Equipment.Create("EQ-CONC-001", "Concurrency Equipment", "CNC", "WS-001", "Workshop A", 100));
            await setupContext.SaveChangesAsync();
        }

        await using var staleContext = scope.CreateContext();
        var equipment = await staleContext.Equipment.SingleAsync(e => e.EquipmentCode == "EQ-CONC-001");
        equipment.ScheduleMaintenance(new DateTime(2026, 6, 10, 8, 0, 0, DateTimeKind.Utc));

        await scope.BumpVersionAsync("equipment", equipment.Id);

        var act = () => staleContext.SaveChangesAsync();

        await act.Should().ThrowAsync<DbUpdateConcurrencyException>();
    }

    [Fact]
    public async Task Material_Update_WithStaleVersion_ShouldThrowConcurrencyException()
    {
        await using var scope = await CreateScopeAsync();
        await using (var setupContext = scope.CreateContext())
        {
            setupContext.Materials.Add(Material.Create("MAT-CONC-001", "Concurrency Material", "PCS", availableQuantity: 100));
            await setupContext.SaveChangesAsync();
        }

        await using var staleContext = scope.CreateContext();
        var material = await staleContext.Materials.SingleAsync(m => m.MaterialCode == "MAT-CONC-001");
        material.SetSafetyStock(20);

        await scope.BumpVersionAsync("materials", material.Id);

        var act = () => staleContext.SaveChangesAsync();

        await act.Should().ThrowAsync<DbUpdateConcurrencyException>();
    }

    [Fact]
    public async Task SchedulePlan_Update_WithStaleVersion_ShouldThrowConcurrencyException()
    {
        await using var scope = await CreateScopeAsync();
        await using (var setupContext = scope.CreateContext())
        {
            setupContext.SchedulePlans.Add(SchedulePlan.Create(
                "Concurrency Plan",
                new DateTime(2026, 6, 1, 8, 0, 0, DateTimeKind.Utc),
                new DateTime(2026, 6, 1, 18, 0, 0, DateTimeKind.Utc)));
            await setupContext.SaveChangesAsync();
        }

        await using var staleContext = scope.CreateContext();
        var plan = await staleContext.SchedulePlans.SingleAsync(p => p.PlanName == "Concurrency Plan");
        plan.UpdateMetrics(82.5, 91.2, "stale update");

        await scope.BumpVersionAsync("schedule_plans", plan.Id);

        var act = () => staleContext.SaveChangesAsync();

        await act.Should().ThrowAsync<DbUpdateConcurrencyException>();
    }

    private static async Task<ConcurrencyTestScope> CreateScopeAsync()
    {
        var scope = await PostgreSqlIntegrationTestScope.CreateAsync();
        return new ConcurrencyTestScope(scope);
    }

    private sealed class ConcurrencyTestScope : IAsyncDisposable
    {
        private readonly PostgreSqlIntegrationTestScope _scope;

        public ConcurrencyTestScope(PostgreSqlIntegrationTestScope scope)
        {
            _scope = scope;
        }

        public MesDbContext CreateContext() => _scope.CreateContext();

        public async Task BumpVersionAsync(string tableName, string id)
        {
            var sql = tableName switch
            {
                "work_orders" => "UPDATE work_orders SET updated_at = now() WHERE id = {0}",
                "equipment" => "UPDATE equipment SET updated_at = now() WHERE id = {0}",
                "materials" => "UPDATE materials SET updated_at = now() WHERE id = {0}",
                "schedule_plans" => "UPDATE schedule_plans SET updated_at = now() WHERE id = {0}",
                _ => throw new ArgumentOutOfRangeException(nameof(tableName), tableName, "Unsupported concurrency test table.")
            };

            await using var context = CreateContext();
            await context.Database.ExecuteSqlRawAsync(sql, id);
        }

        public async ValueTask DisposeAsync()
        {
            await _scope.DisposeAsync();
        }
    }
}
