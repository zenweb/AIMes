using FluentAssertions;
using MES.AI.Pro.Configuration;
using MES.AI.Pro.Services;
using Microsoft.Extensions.Options;
using Moq;

namespace MES.Tests.Unit.AI;

public class LlmGatewayServiceTests
{
    [Fact]
    public void Constructor_WhenCloudProviderSecretsAreMissing_ShouldNotBuildKernel()
    {
        var config = Options.Create(new LlmConfig
        {
            Provider = "AzureOpenAI",
            AzureOpenAI = new AzureOpenAIConfig
            {
                DeploymentName = "aimes-chat",
                Endpoint = "https://example.openai.azure.com/",
                ApiKey = string.Empty,
            },
        });
        var httpClientFactory = new Mock<IHttpClientFactory>(MockBehavior.Strict);
        using var gate = new LlmConcurrencyGate(1);

        var act = () => new LlmGatewayService(config, httpClientFactory.Object, gate);

        act.Should().NotThrow("read-only API paths must not fail just because LLM secrets are absent");
    }
}
