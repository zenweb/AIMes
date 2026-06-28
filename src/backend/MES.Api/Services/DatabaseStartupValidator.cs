using MES.Api.Configuration;
using MES.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace MES.Api.Services;

public interface IDatabaseStartupValidator
{
    Task ValidateAsync(CancellationToken ct);
}

public interface IDatabaseSchemaState
{
    bool SupportsMigrations { get; }

    Task<IReadOnlyCollection<string>> GetPendingMigrationsAsync(CancellationToken ct);

    Task MigrateAsync(CancellationToken ct);
}

public interface IDemoDataSeeder
{
    Task SeedAsync(CancellationToken ct);
}

public sealed class DatabaseStartupValidator(
    IDatabaseSchemaState schemaState,
    IHostEnvironment environment,
    IOptions<AimesHostOptions> hostOptions,
    IDemoDataSeeder demoDataSeeder) : IDatabaseStartupValidator
{
    public async Task ValidateAsync(CancellationToken ct)
    {
        if (environment.IsProduction())
        {
            var pendingMigrations = await schemaState.GetPendingMigrationsAsync(ct);
            if (pendingMigrations.Count > 0)
            {
                throw new InvalidOperationException(
                    "Database has pending EF migrations. Run 'dotnet ef database update' before starting Production. " +
                    $"Pending migrations: {string.Join(", ", pendingMigrations)}");
            }

            if (hostOptions.Value.SeedDemoDataOnStartup)
            {
                await demoDataSeeder.SeedAsync(ct);
            }

            return;
        }

        if (schemaState.SupportsMigrations)
        {
            await schemaState.MigrateAsync(ct);
        }

        if (environment.IsDevelopment())
        {
            await demoDataSeeder.SeedAsync(ct);
        }
    }
}

public sealed class EfDatabaseSchemaState(MesDbContext dbContext) : IDatabaseSchemaState
{
    public bool SupportsMigrations => dbContext.Database.IsRelational();

    public async Task<IReadOnlyCollection<string>> GetPendingMigrationsAsync(CancellationToken ct)
    {
        var pendingMigrations = await dbContext.Database.GetPendingMigrationsAsync(ct);
        return pendingMigrations.ToArray();
    }

    public Task MigrateAsync(CancellationToken ct) => dbContext.Database.MigrateAsync(ct);
}

public sealed class EfDemoDataSeeder(MesDbContext dbContext, PasswordHasher passwordHasher) : IDemoDataSeeder
{
    public async Task SeedAsync(CancellationToken ct)
    {
        if (!await dbContext.SystemUsers.AnyAsync(u => u.Username == "admin", ct))
        {
            dbContext.SystemUsers.Add(Domain.Entities.Admin.SystemUser.Create(
                "admin",
                "管理员",
                passwordHasher.Hash("admin123"),
                "Admin",
                "su-demo-admin",
                DateTime.UtcNow));
        }

        if (!await dbContext.SystemUsers.AnyAsync(u => u.Username == "operator1", ct))
        {
            dbContext.SystemUsers.Add(Domain.Entities.Admin.SystemUser.Create(
                "operator1",
                "操作员1",
                passwordHasher.Hash("operator123"),
                "Operator",
                "su-demo-operator",
                DateTime.UtcNow));
        }

        await dbContext.SaveChangesAsync(ct);
        await DemoDataSeeder.SeedAsync(dbContext, ct);
    }
}
