using System.Net;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using FluentAssertions;
using MES.Api.Services;
using MES.Domain.Entities.Admin;
using MES.Infrastructure.Data;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace MES.Tests.Integration.Controllers;

[Collection("IntegrationSerial")]
public class AuthControllerTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;

    public AuthControllerTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Login_WithValidCredentials_ShouldReturnToken()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/v1/auth/login", new
        {
            Username = "admin",
            Password = "admin123",
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<LoginTestResponse>();
        body!.Token.Should().NotBeNullOrEmpty();
        body.MustChangePassword.Should().BeTrue("seeded demo accounts still use initial credentials and must be forced through password rotation");
    }

    [Fact]
    public async Task Login_WithInvalidPassword_ShouldReturnUnauthorized()
    {
        var client = _factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/v1/auth/login", new { Username = "admin", Password = "wrong" });
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Login_WithEmptyCredentials_ShouldReturnBadRequest()
    {
        var client = _factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/v1/auth/login", new { Username = "", Password = "" });
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task ChangePassword_ShouldClearPasswordChangeRequirement()
    {
        var client = _factory.CreateClient();
        var username = $"pwduser_{Guid.NewGuid():N}";
        var currentPassword = $"current-{Guid.NewGuid():N}";
        var newPassword = $"changed-{Guid.NewGuid():N}";

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
            var hasher = scope.ServiceProvider.GetRequiredService<PasswordHasher>();
            db.SystemUsers.Add(SystemUser.Create(username, "改密测试用户", hasher.Hash(currentPassword), "Operator"));
            await db.SaveChangesAsync();
        }

        var response = await client.PostAsJsonAsync("/api/v1/auth/change-password", new
        {
            Username = username,
            CurrentPassword = currentPassword,
            NewPassword = newPassword,
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var loginResponse = await client.PostAsJsonAsync("/api/v1/auth/login", new
        {
            Username = username,
            Password = newPassword,
        });
        loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await loginResponse.Content.ReadFromJsonAsync<LoginTestResponse>();
        body!.MustChangePassword.Should().BeFalse("the user has rotated away from the initial password");
    }

    [Fact]
    public async Task Login_ShouldPersistOnlyHashedRefreshToken()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/v1/auth/login", new
        {
            Username = "admin",
            Password = "admin123",
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<LoginTestResponse>();
        body!.RefreshToken.Should().NotBeNullOrEmpty();

        var expectedHash = Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(body.RefreshToken)));
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        var storedTokens = db.RefreshTokens.Where(t => t.Username == "admin").Select(t => t.Token).ToList();

        storedTokens.Should().Contain(expectedHash, "the server must compare refresh tokens by SHA-256 hash");
        storedTokens.Should().NotContain(body.RefreshToken, "the bearer refresh token must never be stored in clear text");
    }

    private class LoginTestResponse
    {
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool MustChangePassword { get; set; }
    }
}
