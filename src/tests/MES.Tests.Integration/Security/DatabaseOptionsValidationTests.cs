using FluentAssertions;
using MES.Api.Extensions;
using MES.Infrastructure.Data;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Xunit;

namespace MES.Tests.Integration.Security;

[Collection("IntegrationSerial")]
public sealed class DatabaseOptionsValidationTests
{
    [Fact]
    public void StartupValidation_WithoutDefaultConnection_ShouldRejectStartup()
    {
        using var provider = BuildServiceProvider(new Dictionary<string, string?>
        {
            ["Database:Provider"] = DatabaseProvider.PostgreSql
        });
        var act = () => provider.GetRequiredService<IStartupValidator>().Validate();

        act.Should().Throw<OptionsValidationException>()
            .WithMessage("*ConnectionStrings:DefaultConnection*");
    }

    [Fact]
    public void StartupValidation_WithUnsupportedProvider_ShouldRejectStartup()
    {
        using var provider = BuildServiceProvider(new Dictionary<string, string?>
        {
            ["Database:Provider"] = "Oracle",
            ["ConnectionStrings:DefaultConnection"] = "Host=localhost;Database=aimes;"
        });
        var act = () => provider.GetRequiredService<IStartupValidator>().Validate();

        act.Should().Throw<OptionsValidationException>()
            .WithMessage("*Database:Provider*");
    }

    [Fact]
    public void StartupValidation_WithSupportedProviderAndConnection_ShouldPass()
    {
        using var provider = BuildServiceProvider(new Dictionary<string, string?>
        {
            ["Database:Provider"] = DatabaseProvider.PostgreSql,
            ["ConnectionStrings:DefaultConnection"] = "Host=localhost;Database=aimes;"
        });

        provider.GetRequiredService<IStartupValidator>().Validate();
    }

    private static ServiceProvider BuildServiceProvider(Dictionary<string, string?> values)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(values)
            .Build();
        var services = new ServiceCollection();

        services.AddDatabaseServices(configuration);

        return services.BuildServiceProvider();
    }
}
