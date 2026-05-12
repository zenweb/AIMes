using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Xunit;

namespace MES.Tests.Integration.Controllers;

public class AuthControllerTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public AuthControllerTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Login_WithValidCredentials_ShouldReturnToken()
    {
        var request = new { Username = "admin", Password = "admin123" };
        var response = await _client.PostAsJsonAsync("/api/v1/auth/login", request);

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await response.Content.ReadFromJsonAsync<LoginTestResponse>();
        body.Should().NotBeNull();
        body!.Token.Should().NotBeNullOrEmpty();
        body.Username.Should().Be("admin");
        body.Role.Should().Be("Admin");
    }

    [Fact]
    public async Task Login_WithInvalidPassword_ShouldReturnUnauthorized()
    {
        var request = new { Username = "admin", Password = "wrong" };
        var response = await _client.PostAsJsonAsync("/api/v1/auth/login", request);
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Login_WithEmptyCredentials_ShouldReturnBadRequest()
    {
        var response = await _client.PostAsJsonAsync("/api/v1/auth/login", new { Username = "", Password = "" });
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_AsOperator_ShouldReturnOperatorRole()
    {
        var request = new { Username = "operator", Password = "123456" };
        var response = await _client.PostAsJsonAsync("/api/v1/auth/login", request);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await response.Content.ReadFromJsonAsync<LoginTestResponse>();
        body!.Role.Should().Be("Operator");
        body.DisplayName.Should().Be("张三");
    }

    private class LoginTestResponse
    {
        public string Token { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}
