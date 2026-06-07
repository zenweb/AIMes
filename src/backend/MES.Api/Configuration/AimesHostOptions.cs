namespace MES.Api.Configuration;

public sealed class AimesHostOptions
{
    public const string SectionName = "Aimes";

    public bool TrustForwardedHeaders { get; set; }

    public bool EnableSwagger { get; set; }

    public bool DisableHttpsRedirect { get; set; }

    public static void BindFromConfiguration(AimesHostOptions options, IConfiguration configuration)
    {
        configuration.GetSection(SectionName).Bind(options);
    }
}
