namespace MES.Infrastructure.Data;

public static class DatabaseProvider
{
    public const string PostgreSql = "PostgreSQL";
    public const string SqlServer = "SqlServer";
    public const string InMemory = "InMemory";

    public static string Resolve(string? provider)
    {
        if (string.IsNullOrWhiteSpace(provider))
        {
            return PostgreSql;
        }

        return provider.Trim().ToLowerInvariant() switch
        {
            "postgres" or "postgresql" or "npgsql" => PostgreSql,
            "sqlserver" or "sql-server" or "mssql" or "ms-sql" => SqlServer,
            "inmemory" or "in-memory" => InMemory,
            _ => throw new InvalidOperationException(
                $"Unsupported database provider '{provider}'. Supported values: {PostgreSql}, {SqlServer}, {InMemory}.")
        };
    }

    public static bool IsSqlServer(string? provider) =>
        string.Equals(Resolve(provider), SqlServer, StringComparison.Ordinal);

    public static bool IsPostgreSql(string? provider) =>
        string.Equals(Resolve(provider), PostgreSql, StringComparison.Ordinal);

    public static bool IsInMemory(string? provider) =>
        string.Equals(Resolve(provider), InMemory, StringComparison.Ordinal);
}
