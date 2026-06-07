using System.ComponentModel.DataAnnotations;
using MES.Infrastructure.Data;

namespace MES.Api.Configuration;

public sealed class DatabaseOptions
{
    public const string SectionName = "Database";

    [Required]
    public string Provider { get; set; } = DatabaseProvider.PostgreSql;

    [Required]
    public string DefaultConnection { get; set; } = string.Empty;

    public static void BindFromConfiguration(DatabaseOptions options, IConfiguration configuration)
    {
        configuration.GetSection(SectionName).Bind(options);
        options.DefaultConnection = configuration.GetConnectionString("DefaultConnection") ?? string.Empty;
    }

    public static bool HasSupportedProvider(DatabaseOptions options)
    {
        try
        {
            _ = options.GetResolvedProvider();
            return true;
        }
        catch (InvalidOperationException)
        {
            return false;
        }
    }

    public static bool HasDefaultConnection(DatabaseOptions options)
    {
        return !string.IsNullOrWhiteSpace(options.DefaultConnection);
    }

    public string GetResolvedProvider()
    {
        return DatabaseProvider.Resolve(Provider);
    }
}
