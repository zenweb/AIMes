using FluentAssertions;
using MES.Api.Configuration;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Xunit;

namespace MES.Tests.Integration.Security;

[Collection("IntegrationSerial")]
public sealed class QdrantHealthOptionsValidationTests
{
    [Fact]
    public void StartupValidation_WithInvalidQdrantPort_ShouldRejectStartup()
    {
        using var provider = BuildServiceProvider(new Dictionary<string, string?>
        {
            ["AI:VectorStore:Provider"] = "Qdrant",
            ["AI:VectorStore:Qdrant:Host"] = "localhost",
            ["AI:VectorStore:Qdrant:Port"] = "70000"
        });
        var act = () => provider.GetRequiredService<IStartupValidator>().Validate();

        act.Should().Throw<OptionsValidationException>()
            .WithMessage("*Qdrant*Port*");
    }

    private static ServiceProvider BuildServiceProvider(Dictionary<string, string?> values)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(values)
            .Build();
        var services = new ServiceCollection();

        services.AddOptions<QdrantHealthOptions>()
            .Bind(configuration.GetSection(QdrantHealthOptions.SectionName))
            .ValidateDataAnnotations()
            .Validate(QdrantHealthOptions.HasValidEndpoint, "Qdrant Host and Port must be valid when Qdrant provider is enabled.")
            .ValidateOnStart();

        return services.BuildServiceProvider();
    }
}
