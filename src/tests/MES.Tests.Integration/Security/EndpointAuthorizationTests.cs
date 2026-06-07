using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Xunit;
using Xunit.Abstractions;

namespace MES.Tests.Integration.Security;

[Collection("IntegrationSerial")]
public sealed class EndpointAuthorizationTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;
    private readonly ITestOutputHelper _output;

    public EndpointAuthorizationTests(TestWebApplicationFactory factory, ITestOutputHelper output)
    {
        _factory = factory;
        _output = output;
    }

    [Theory]
    [InlineData("/api/v1/equipment")]
    [InlineData("/api/v1/dashboard")]
    public async Task ApiV1EndpointsExceptAuth_ShouldRejectAnonymousRequests(string path)
    {
        using var client = _factory.CreateClient();
        using var request = new HttpRequestMessage(HttpMethod.Get, path);
        request.Headers.Add(TestAuthHandler.AnonymousHeader, "true");

        using var response = await client.SendAsync(request);

        await AssertStatusCodeAsync(response, HttpStatusCode.Unauthorized, "Sprint 3 H6 requires API route groups to reject unauthenticated callers by default");
    }

    [Fact]
    public async Task AuthLogin_ShouldRemainAnonymous()
    {
        using var client = _factory.CreateClient();
        using var request = new HttpRequestMessage(HttpMethod.Post, "/api/v1/auth/login")
        {
            Content = JsonContent.Create(new
            {
                Username = "admin",
                Password = "admin123"
            })
        };
        request.Headers.Add(TestAuthHandler.AnonymousHeader, "true");

        using var response = await client.SendAsync(request);

        await AssertStatusCodeAsync(response, HttpStatusCode.OK, "login is the explicit anonymous entry point");
    }

    [Fact]
    public async Task Health_ShouldRemainAnonymous()
    {
        using var client = _factory.CreateClient();
        using var request = new HttpRequestMessage(HttpMethod.Get, "/health");
        request.Headers.Add(TestAuthHandler.AnonymousHeader, "true");

        using var response = await client.SendAsync(request);

        await AssertStatusCodeAsync(response, HttpStatusCode.OK, "health checks are intentionally public for platform probes");
    }

    [Fact]
    public async Task TestAuthHandler_ShouldAuthorizeWhenAnyParameterizedRoleMatches()
    {
        using var client = _factory.CreateClient();
        using var request = new HttpRequestMessage(HttpMethod.Get, "/api/v1/admin/users");
        request.Headers.Add("X-Test-Role", ["Operator", "Admin"]);

        using var response = await client.SendAsync(request);

        await AssertStatusCodeAsync(response, HttpStatusCode.OK, "Sprint 6 6.2 requires TestAuthHandler to support parameterized multi-role test identities");
    }

    private async Task AssertStatusCodeAsync(HttpResponseMessage response, HttpStatusCode expected, string because)
    {
        if (response.StatusCode != expected)
        {
            _output.WriteLine(await response.Content.ReadAsStringAsync());
        }

        response.StatusCode.Should().Be(expected, because);
    }
}
