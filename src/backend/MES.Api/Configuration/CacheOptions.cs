namespace MES.Api.Configuration;

public sealed class CacheOptions
{
    public string RedisConnection { get; set; } = string.Empty;

    public string RedisInstanceName { get; set; } = "aimes:";

    public bool HasRedisConnection => !string.IsNullOrWhiteSpace(RedisConnection);

    public static void BindFromConfiguration(CacheOptions options, IConfiguration configuration)
    {
        options.RedisConnection = configuration.GetConnectionString("Redis") ?? string.Empty;
    }
}
