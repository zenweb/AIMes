using System.ComponentModel.DataAnnotations;
using System.Text;

namespace MES.Api.Configuration;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    [Required]
    public string Issuer { get; init; } = "AIMes";

    [Required]
    public string Audience { get; init; } = "AIMes-Client";

    [Required]
    public string SigningKey { get; init; } = string.Empty;

    public static bool HasValidSigningKey(JwtOptions options)
    {
        return Encoding.UTF8.GetByteCount(options.SigningKey) >= 32;
    }
}
