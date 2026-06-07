using FluentAssertions;
using MES.Domain.Entities.Scheduling;
using MES.Infrastructure.Data;
using MES.Infrastructure.Repositories;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging;

namespace MES.Tests.Integration.Repositories;

[Collection("IntegrationSerial")]
public class ScheduleRepositoryTests
{
    [Fact]
    public async Task GetAllAsync_UsesSplitQueryAndStablePagedOrdering()
    {
        var commands = new List<string>();
        var previousProvider = Environment.GetEnvironmentVariable("AIMES_DATABASE_PROVIDER");
        Environment.SetEnvironmentVariable("AIMES_DATABASE_PROVIDER", DatabaseProvider.SqlServer);

        try
        {
            await using var connection = new SqliteConnection("Data Source=:memory:");
            await connection.OpenAsync();

            var options = new DbContextOptionsBuilder<MesDbContext>()
                .UseSqlite(connection)
                .LogTo(
                    command => commands.Add(command),
                    new[] { RelationalEventId.CommandExecuted },
                    LogLevel.Information)
                .EnableSensitiveDataLogging()
                .Options;

            await using (var setupContext = new MesDbContext(options))
            {
                await setupContext.Database.EnsureCreatedAsync();
                setupContext.SchedulePlans.AddRange(CreatePlan("plan-b"), CreatePlan("plan-a"), CreatePlan("plan-c"));
                await setupContext.SaveChangesAsync();
            }

            commands.Clear();

            await using var queryContext = new MesDbContext(options);
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
        finally
        {
            Environment.SetEnvironmentVariable("AIMES_DATABASE_PROVIDER", previousProvider);
        }
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

    private static void SetPrivateProperty<T>(object target, string propertyName, T value)
    {
        var property = target.GetType().GetProperty(propertyName);
        if (property is null)
        {
            throw new InvalidOperationException($"Property '{propertyName}' was not found.");
        }

        property.SetValue(target, value);
    }
}
