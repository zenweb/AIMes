namespace MES.Infrastructure.Data;

public static class DatabaseProvider
{
    public const string PostgreSql = "PostgreSQL";
    public const string SqlServer = "SqlServer";

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
            _ => throw new InvalidOperationException(
                $"Unsupported database provider '{provider}'. Supported values: {PostgreSql}, {SqlServer}.")
        };
    }

    public static bool IsSqlServer(string? provider) =>
        string.Equals(Resolve(provider), SqlServer, StringComparison.Ordinal);

    public static bool IsPostgreSql(string? provider) =>
        string.Equals(Resolve(provider), PostgreSql, StringComparison.Ordinal);
}
