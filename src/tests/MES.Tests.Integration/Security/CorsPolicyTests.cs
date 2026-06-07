using FluentAssertions;
using MES.Api.Extensions;
using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Xunit;

namespace MES.Tests.Integration.Security;

[Collection("IntegrationSerial")]
public sealed class CorsPolicyTests
{
    [Fact]
    public async Task ProductionPolicy_WithConfiguredOrigin_ShouldEchoOriginWithoutWildcard()
    {
        using var provider = BuildServiceProvider(new Dictionary<string, string?>
        {
            ["AllowedOrigins:0"] = "https://mes.example.com"
        });
        var corsPolicyProvider = provider.GetRequiredService<ICorsPolicyProvider>();

        provider.GetRequiredService<IStartupValidator>().Validate();
        var policy = await corsPolicyProvider.GetPolicyAsync(new DefaultHttpContext(), "Production");

        policy.Should().NotBeNull();
        policy!.AllowAnyOrigin.Should().BeFalse("Production CORS must never emit Access-Control-Allow-Origin: *");
        policy.Origins.Should().ContainSingle().Which.Should().Be("https://mes.example.com");
    }

    [Fact]
    public void ProductionPolicy_WithoutAllowedOrigins_ShouldRejectStartup()
    {
        using var provider = BuildServiceProvider(new Dictionary<string, string?>());
        var act = () => provider.GetRequiredService<IStartupValidator>().Validate();

        act.Should().Throw<OptionsValidationException>()
            .WithMessage("*AllowedOrigins*");
    }

    private static ServiceProvider BuildServiceProvider(Dictionary<string, string?> values)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(values)
            .Build();
        var services = new ServiceCollection();

        services.AddCorsServices(configuration);

        return services.BuildServiceProvider();
    }
}
