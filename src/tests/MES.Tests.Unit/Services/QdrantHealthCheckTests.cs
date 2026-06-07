using FluentAssertions;
using MES.Api.Configuration;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

namespace MES.Tests.Unit.Services;

public sealed class QdrantHealthCheckTests
{
    [Fact]
    public async Task CheckHealthAsync_WhenVectorStoreProviderIsNotQdrant_ShouldReturnHealthyWithoutHttpCall()
    {
        var factory = new Mock<IHttpClientFactory>(MockBehavior.Strict);
        var check = new QdrantHealthCheck(
            Options.Create(new QdrantHealthOptions { Provider = "InMemory" }),
            factory.Object);

        var result = await check.CheckHealthAsync(new HealthCheckContext(), CancellationToken.None);

        result.Status.Should().Be(HealthStatus.Healthy);
        factory.VerifyNoOtherCalls();
    }
}
