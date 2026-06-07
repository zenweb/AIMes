using FluentAssertions;
using MES.Api.Extensions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Xunit;

namespace MES.Tests.Integration.Security;

[Collection("IntegrationSerial")]
public sealed class MessagingOptionsValidationTests
{
    [Fact]
    public void StartupValidation_WithDisabledTransport_ShouldAllowMissingRabbitMqConnection()
    {
        using var provider = BuildServiceProvider(new Dictionary<string, string?>
        {
            ["Messaging:Transport"] = "Disabled"
        });

        provider.GetRequiredService<IStartupValidator>().Validate();
    }

    [Fact]
    public void StartupValidation_WithUnsupportedTransport_ShouldRejectStartup()
    {
        using var provider = BuildServiceProvider(new Dictionary<string, string?>
        {
            ["Messaging:Transport"] = "Kafka",
            ["ConnectionStrings:RabbitMQ"] = "rabbitmq://localhost"
        });
        var act = () => provider.GetRequiredService<IStartupValidator>().Validate();

        act.Should().Throw<OptionsValidationException>()
            .WithMessage("*Messaging:Transport*");
    }

    [Fact]
    public void StartupValidation_WithRabbitMqTransportWithoutConnection_ShouldRejectStartup()
    {
        using var provider = BuildServiceProvider(new Dictionary<string, string?>
        {
            ["Messaging:Transport"] = "RabbitMQ"
        });
        var act = () => provider.GetRequiredService<IStartupValidator>().Validate();

        act.Should().Throw<OptionsValidationException>()
            .WithMessage("*ConnectionStrings:RabbitMQ*");
    }

    private static ServiceProvider BuildServiceProvider(Dictionary<string, string?> values)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(values)
            .Build();
        var services = new ServiceCollection();

        services.AddMessagingServices(configuration);

        return services.BuildServiceProvider();
    }
}
