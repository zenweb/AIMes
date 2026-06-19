using MES.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging;
using Npgsql;

namespace MES.Tests.Integration;

public sealed class PostgreSqlIntegrationTestScope : IAsyncDisposable
{
    private const string DefaultConnectionString =
        "Host=localhost;Database=aimes_integration_tests;Username=postgres;Password=postgres";

    private readonly DbContextOptions<MesDbContext> _options;
    private readonly string _databaseName;
    private readonly string _connectionString;
    private readonly string? _previousProvider;

    private PostgreSqlIntegrationTestScope(
        DbContextOptions<MesDbContext> options,
        string databaseName,
        string connectionString,
        string? previousProvider)
    {
        _options = options;
        _databaseName = databaseName;
        _connectionString = connectionString;
        _previousProvider = previousProvider;
    }

    public static async Task<PostgreSqlIntegrationTestScope> CreateAsync(
        List<string>? commands = null,
        string? databaseName = null)
    {
        var builder = CreateConnectionStringBuilder();
        var effectiveDatabaseName = databaseName ?? $"aimes_it_{Guid.NewGuid():N}";
        builder.Database = effectiveDatabaseName;
        var connectionString = builder.ConnectionString;

        var previousProvider = Environment.GetEnvironmentVariable("AIMES_DATABASE_PROVIDER");
        Environment.SetEnvironmentVariable("AIMES_DATABASE_PROVIDER", DatabaseProvider.PostgreSql);

        await RecreateDatabaseAsync(builder);

        var optionsBuilder = new DbContextOptionsBuilder<MesDbContext>()
            .UseNpgsql(connectionString)
            .EnableSensitiveDataLogging();

        if (commands is not null)
        {
            optionsBuilder.LogTo(
                command => commands.Add(command),
                new[] { RelationalEventId.CommandExecuted },
                LogLevel.Information);
        }

        var options = optionsBuilder.Options;
        await using (var context = new MesDbContext(options))
        {
            await context.Database.EnsureCreatedAsync();
        }

        return new PostgreSqlIntegrationTestScope(
            options,
            effectiveDatabaseName,
            connectionString,
            previousProvider);
    }

    public MesDbContext CreateContext() => new(_options);

    public static string CreateConnectionString(string databaseName)
    {
        var builder = CreateConnectionStringBuilder();
        builder.Database = databaseName;
        return builder.ConnectionString;
    }

    public static async Task RecreateDatabaseAsync(string databaseName)
    {
        var builder = CreateConnectionStringBuilder();
        builder.Database = databaseName;
        await RecreateDatabaseAsync(builder);
    }

    public async ValueTask DisposeAsync()
    {
        try
        {
            await using var context = CreateContext();
            await context.Database.EnsureDeletedAsync();
        }
        finally
        {
            Environment.SetEnvironmentVariable("AIMES_DATABASE_PROVIDER", _previousProvider);
        }
    }

    private static NpgsqlConnectionStringBuilder CreateConnectionStringBuilder()
    {
        var baseConnectionString = Environment.GetEnvironmentVariable("AIMES_TEST_POSTGRES_CONNECTION");
        if (string.IsNullOrWhiteSpace(baseConnectionString))
        {
            baseConnectionString = DefaultConnectionString;
        }

        return new NpgsqlConnectionStringBuilder(baseConnectionString);
    }

    private static async Task RecreateDatabaseAsync(NpgsqlConnectionStringBuilder builder)
    {
        var databaseName = builder.Database;
        builder.Database = "postgres";

        await using var adminConnection = new NpgsqlConnection(builder.ConnectionString);
        await adminConnection.OpenAsync();

        await using (var terminateCommand = adminConnection.CreateCommand())
        {
            terminateCommand.CommandText = """
                SELECT pg_terminate_backend(pid)
                FROM pg_stat_activity
                WHERE datname = @databaseName AND pid <> pg_backend_pid();
                """;
            terminateCommand.Parameters.AddWithValue("databaseName", databaseName!);
            await terminateCommand.ExecuteNonQueryAsync();
        }

        await using (var dropCommand = adminConnection.CreateCommand())
        {
            dropCommand.CommandText = $"""DROP DATABASE IF EXISTS "{databaseName}";""";
            await dropCommand.ExecuteNonQueryAsync();
        }

        await using (var createCommand = adminConnection.CreateCommand())
        {
            createCommand.CommandText = $"""CREATE DATABASE "{databaseName}";""";
            await createCommand.ExecuteNonQueryAsync();
        }
    }
}
