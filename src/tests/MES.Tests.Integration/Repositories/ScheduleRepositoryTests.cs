using FluentAssertions;
using MES.Domain.Entities.Scheduling;
using MES.Infrastructure.Data;
using MES.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace MES.Tests.Integration.Repositories;

[Collection("IntegrationSerial")]
public class ScheduleRepositoryTests
{
    [Fact]
    public async Task GetAllAsync_UsesSplitQueryAndStablePagedOrdering()
    {
        var commands = new List<string>();
        await using var scope = await PostgreSqlIntegrationTestScope.CreateAsync(commands);

        await using (var setupContext = scope.CreateContext())
        {
            setupContext.SchedulePlans.AddRange(CreatePlan("plan-b"), CreatePlan("plan-a"), CreatePlan("plan-c"));
            await setupContext.SaveChangesAsync();
        }

        commands.Clear();

        await using var queryContext = scope.CreateContext();
        var repository = new ScheduleRepository(queryContext);

        var firstPage = await repository.GetAllAsync(page: 1, pageSize: 2);
        var secondPage = await repository.GetAllAsync(page: 2, pageSize: 2);

        firstPage.Select(p => p.Id).Should().Equal("plan-a", "plan-b");
        secondPage.Select(p => p.Id).Should().Equal("plan-c");
        firstPage.Concat(secondPage).Select(p => p.Id).Should().OnlyHaveUniqueItems();
        firstPage.Should().OnlyContain(p => p.Items.Count == 2);

        var scheduleSelects = commands
            .Where(command => command.Contains("schedule_plans") || command.Contains("schedule_items"))
            .ToList();

        scheduleSelects.Count.Should().BeGreaterThanOrEqualTo(
            4,
            "Include(p => p.Items) must stay split so each page avoids one large joined result set");
        scheduleSelects.Should().Contain(
            command => command.Contains("ORDER BY", StringComparison.OrdinalIgnoreCase)
                && command.Contains("created_at", StringComparison.OrdinalIgnoreCase)
                && command.Contains("id", StringComparison.OrdinalIgnoreCase)
                && command.Contains("LIMIT", StringComparison.OrdinalIgnoreCase),
            "paging must be deterministic across equal CreatedAt values");
    }

    [Fact]
    public async Task GetByIdForUpdateAsync_WhenReschedulingItemOnPostgreSql_ShouldPersistWindow()
    {
        await using var scope = await TryCreatePostgreSqlScopeAsync();
        if (scope is null)
        {
            return;
        }

        var originalStart = new DateTime(2026, 6, 12, 8, 0, 0, DateTimeKind.Utc);
        var originalEnd = originalStart.AddHours(4);
        var newStart = originalStart.AddHours(9);
        var newEnd = newStart.AddHours(4);

        await using (var setupContext = scope.CreateContext())
        {
            setupContext.SchedulePlans.Add(CreatePlanWithItem(
                "pg-reschedule-plan",
                "pg-reschedule-item",
                originalStart,
                originalEnd));
            await setupContext.SaveChangesAsync();
        }

        await using (var updateContext = scope.CreateContext())
        {
            var repository = new ScheduleRepository(updateContext);
            var plan = await repository.GetByIdForUpdateAsync("pg-reschedule-plan");

            plan.Should().NotBeNull("drag-save must update a tracked aggregate when PostgreSQL xmin is active");
            var item = plan!.Items.Single(i => i.Id == "pg-reschedule-item");
            item.Reschedule(newStart, newEnd);

            await repository.UpdateAsync(plan);
        }

        await using var verifyContext = scope.CreateContext();
        var persisted = await verifyContext.ScheduleItems
            .AsNoTracking()
            .SingleAsync(i => i.Id == "pg-reschedule-item");

        persisted.PlannedStartTime.Should().Be(newStart);
        persisted.PlannedEndTime.Should().Be(newEnd);
    }

    [Fact]
    public async Task GetByIdAsync_WhenDetachedPostgreSqlAggregateIsUsedForWrite_ShouldExposeXminConcurrencyRisk()
    {
        await using var scope = await TryCreatePostgreSqlScopeAsync();
        if (scope is null)
        {
            return;
        }

        var originalStart = new DateTime(2026, 6, 12, 8, 0, 0, DateTimeKind.Utc);
        var originalEnd = originalStart.AddHours(4);

        await using (var setupContext = scope.CreateContext())
        {
            setupContext.SchedulePlans.Add(CreatePlanWithItem(
                "pg-detached-plan",
                "pg-detached-item",
                originalStart,
                originalEnd));
            await setupContext.SaveChangesAsync();
        }

        await using var updateContext = scope.CreateContext();
        var repository = new ScheduleRepository(updateContext);
        var detachedPlan = await repository.GetByIdAsync("pg-detached-plan");

        detachedPlan.Should().NotBeNull();
        detachedPlan!.Items.Single(i => i.Id == "pg-detached-item")
            .Reschedule(originalStart.AddHours(9), originalEnd.AddHours(9));

        var act = () => repository.UpdateAsync(detachedPlan);

        await act.Should().ThrowAsync<DbUpdateConcurrencyException>(
            "PostgreSQL xmin cannot be trusted when the write path starts from the read-only no-tracking aggregate");
    }

    private static SchedulePlan CreatePlan(string id)
    {
        var now = new DateTime(2026, 5, 30, 8, 0, 0, DateTimeKind.Utc);
        var plan = SchedulePlan.Create($"Plan {id}", now, now.AddHours(8));
        SetPrivateProperty(plan, nameof(SchedulePlan.Id), id);
        SetPrivateProperty(plan, nameof(SchedulePlan.CreatedAt), now);
        plan.AddItems(new[]
        {
            ScheduleItem.Create($"{id}-wo-1", "eq-001", now, now.AddHours(2), 1),
            ScheduleItem.Create($"{id}-wo-2", "eq-002", now.AddHours(2), now.AddHours(4), 2),
        });

        return plan;
    }

    private static SchedulePlan CreatePlanWithItem(
        string planId,
        string itemId,
        DateTime start,
        DateTime end)
    {
        var plan = SchedulePlan.Create($"Plan {planId}", start.Date, start.Date.AddDays(1));
        SetPrivateProperty(plan, nameof(SchedulePlan.Id), planId);
        SetPrivateProperty(plan, nameof(SchedulePlan.CreatedAt), start.Date);

        var item = ScheduleItem.Create($"{itemId}-wo", "eq-001", start, end, 1);
        SetPrivateProperty(item, nameof(ScheduleItem.Id), itemId);
        plan.AddItem(item);

        return plan;
    }

    private static async Task<PostgreSqlScheduleRepositoryTestScope?> TryCreatePostgreSqlScopeAsync()
    {
        var enabled = Environment.GetEnvironmentVariable("AIMES_RUN_POSTGRES_TESTS");
        if (!string.Equals(enabled, "true", StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        try
        {
            return new PostgreSqlScheduleRepositoryTestScope(await PostgreSqlIntegrationTestScope.CreateAsync());
        }
        catch (Npgsql.NpgsqlException)
        {
            return null;
        }
    }

    private static void SetPrivateProperty<T>(object target, string propertyName, T value)
    {
        var property = target.GetType().GetProperty(propertyName);
        if (property is null)
        {
            throw new InvalidOperationException($"Property '{propertyName}' was not found.");
        }

        property.SetValue(target, value);
    }

    private sealed class PostgreSqlScheduleRepositoryTestScope : IAsyncDisposable
    {
        private readonly PostgreSqlIntegrationTestScope _scope;

        public PostgreSqlScheduleRepositoryTestScope(PostgreSqlIntegrationTestScope scope)
        {
            _scope = scope;
        }

        public MesDbContext CreateContext() => _scope.CreateContext();

        public async ValueTask DisposeAsync()
        {
            await _scope.DisposeAsync();
        }
    }
}
