using FluentAssertions;
using MES.Api.Configuration;
using MES.Api.Extensions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Xunit;

namespace MES.Tests.Integration.Security;

[Collection("IntegrationSerial")]
public sealed class CacheOptionsValidationTests
{
    [Fact]
    public void StartupValidation_WithoutRedisConnection_ShouldAllowMemoryCacheFallback()
    {
        using var provider = BuildServiceProvider(new Dictionary<string, string?>());

        provider.GetRequiredService<IStartupValidator>().Validate();
        provider.GetRequiredService<IOptions<CacheOptions>>()
            .Value.HasRedisConnection.Should().BeFalse();
    }

    [Fact]
    public void StartupValidation_WithRedisConnection_ShouldBindRedisOptions()
    {
        using var provider = BuildServiceProvider(new Dictionary<string, string?>
        {
            ["ConnectionStrings:Redis"] = "localhost:6379"
        });

        provider.GetRequiredService<IStartupValidator>().Validate();
        var options = provider.GetRequiredService<IOptions<CacheOptions>>().Value;
        options.HasRedisConnection.Should().BeTrue();
        options.RedisConnection.Should().Be("localhost:6379");
        options.RedisInstanceName.Should().Be("aimes:");
    }

    private static ServiceProvider BuildServiceProvider(Dictionary<string, string?> values)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(values)
            .Build();
        var services = new ServiceCollection();

        services.AddCacheServices(configuration);

        return services.BuildServiceProvider();
    }
}
