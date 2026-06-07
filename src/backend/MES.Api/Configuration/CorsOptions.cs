using System.ComponentModel.DataAnnotations;

namespace MES.Api.Configuration;

public sealed class CorsOptions
{
    public const string OptionsName = "Production";

    [Required]
    public string[] AllowedOrigins { get; init; } = [];

    public static bool HasAllowedOrigins(CorsOptions options)
    {
        return options.AllowedOrigins.Any(origin => !string.IsNullOrWhiteSpace(origin));
    }

    public string[] GetNormalizedAllowedOrigins()
    {
        return AllowedOrigins
            .Where(origin => !string.IsNullOrWhiteSpace(origin))
            .Select(origin => origin.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();
    }
}
