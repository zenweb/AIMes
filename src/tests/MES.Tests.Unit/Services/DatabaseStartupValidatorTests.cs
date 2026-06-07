using FluentAssertions;
using MES.Api.Services;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using Xunit;

namespace MES.Tests.Unit.Services;

public sealed class DatabaseStartupValidatorTests
{
    [Fact]
    public async Task ValidateAsync_InProductionWithPendingMigrations_ShouldRejectStartupWithoutMigrating()
    {
        var schema = new FakeDatabaseSchemaState(["20260523141327_UpdateAuditLogInitiatedByToEnum"]);
        var validator = new DatabaseStartupValidator(
            schema,
            new FakeHostEnvironment(Environments.Production),
            new FakeDemoDataSeeder());

        var act = async () => await validator.ValidateAsync(CancellationToken.None);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*pending EF migrations*");
        schema.MigrateCalls.Should().Be(0);
    }

    [Fact]
    public async Task ValidateAsync_InProductionWithoutPendingMigrations_ShouldNotMigrate()
    {
        var schema = new FakeDatabaseSchemaState([]);
        var validator = new DatabaseStartupValidator(
            schema,
            new FakeHostEnvironment(Environments.Production),
            new FakeDemoDataSeeder());

        await validator.ValidateAsync(CancellationToken.None);

        schema.MigrateCalls.Should().Be(0);
    }

    [Fact]
    public async Task ValidateAsync_InDevelopment_ShouldApplyMigrationsAndSeedDemoData()
    {
        var schema = new FakeDatabaseSchemaState(["20260523141327_UpdateAuditLogInitiatedByToEnum"]);
        var seeder = new FakeDemoDataSeeder();
        var validator = new DatabaseStartupValidator(
            schema,
            new FakeHostEnvironment(Environments.Development),
            seeder);

        await validator.ValidateAsync(CancellationToken.None);

        schema.MigrateCalls.Should().Be(1);
        seeder.SeedCalls.Should().Be(1);
    }

    [Fact]
    public async Task ValidateAsync_InDevelopmentWithoutMigrationSupport_ShouldSeedDemoDataWithoutSchemaMutation()
    {
        var schema = new FakeDatabaseSchemaState([], supportsMigrations: false);
        var seeder = new FakeDemoDataSeeder();
        var validator = new DatabaseStartupValidator(
            schema,
            new FakeHostEnvironment(Environments.Development),
            seeder);

        await validator.ValidateAsync(CancellationToken.None);

        schema.MigrateCalls.Should().Be(0);
        seeder.SeedCalls.Should().Be(1);
    }

    private sealed class FakeDatabaseSchemaState(
        IReadOnlyCollection<string> pendingMigrations,
        bool supportsMigrations = true) : IDatabaseSchemaState
    {
        public int MigrateCalls { get; private set; }
        public bool SupportsMigrations { get; } = supportsMigrations;

        public Task<IReadOnlyCollection<string>> GetPendingMigrationsAsync(CancellationToken ct)
        {
            return Task.FromResult(pendingMigrations);
        }

        public Task MigrateAsync(CancellationToken ct)
        {
            MigrateCalls++;
            return Task.CompletedTask;
        }

    }

    private sealed class FakeDemoDataSeeder : IDemoDataSeeder
    {
        public int SeedCalls { get; private set; }

        public Task SeedAsync(CancellationToken ct)
        {
            SeedCalls++;
            return Task.CompletedTask;
        }
    }

    private sealed class FakeHostEnvironment(string environmentName) : IHostEnvironment
    {
        public string EnvironmentName { get; set; } = environmentName;
        public string ApplicationName { get; set; } = "MES.Tests";
        public string ContentRootPath { get; set; } = AppContext.BaseDirectory;
        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
    }
}
