using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using MES.Domain.Entities.Admin;
using MES.Infrastructure.Data;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace MES.Tests.Integration.Controllers;

[Collection("IntegrationSerial")]
public class AdminControllerTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly TestWebApplicationFactory _factory;

    public AdminControllerTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetUsers_ShouldReturnOk()
    {
        var response = await _client.GetAsync("/api/v1/admin/users");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetUsers_WhenPasswordChangeRequired_ShouldReturnForbidden()
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, "/api/v1/admin/users");
        request.Headers.Add("X-Test-Must-Change-Password", "true");

        var response = await _client.SendAsync(request);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task CreateUser_ShouldReturnCreated()
    {
        var request = new { Username = "ittest", Password = "test123", DisplayName = "集成测试用户", Role = "Operator" };

        var response = await _client.PostAsJsonAsync("/api/v1/admin/users", request);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var result = await response.Content.ReadFromJsonAsync<AdminUserResponse>();
        result!.Username.Should().Be("ittest");
        result.Role.Should().Be("Operator");
        result.MustChangePassword.Should().BeTrue("accounts created by admins use an initial password that must be rotated");
    }

    [Fact]
    public async Task CreateUser_ShouldRedactPasswordInAuditLog()
    {
        var username = $"audit_user_{Guid.NewGuid():N}";
        var password = $"plain-password-{Guid.NewGuid():N}";
        var request = new { Username = username, Password = password, DisplayName = "审计脱敏用户", Role = "Operator" };

        var response = await _client.PostAsJsonAsync("/api/v1/admin/users", request);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        var audit = db.AuditLogs
            .Where(log => log.Resource == "admin" && log.Action == "POST" && log.NewValues != null)
            .AsEnumerable()
            .Single(log => log.NewValues!.Contains(username, StringComparison.Ordinal));

        audit.NewValues.Should().Contain("***REDACTED***", "audit records should preserve context while masking credential fields");
        audit.NewValues.Should().NotContain(password, "admin-created initial passwords must never be persisted in audit payloads");
    }

    [Fact]
    public async Task UpdateUser_ShouldModifyUser()
    {
        // 直接种子用户（跳过 HTTP POST，避免 InMemory 跨请求可见性问题）
        string userId;
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
            var user = SystemUser.Create("itupduser", "Original", "pwd", "Operator");
            db.SystemUsers.Add(user);
            db.SaveChanges();
            userId = user.Id;
        }

        var response = await _client.PutAsJsonAsync($"/api/v1/admin/users/{userId}",
            new { DisplayName = "修改后", Role = "Operator" });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<AdminUserResponse>();
        result!.DisplayName.Should().Be("修改后");
    }

    [Fact]
    public async Task GetConfigs_ShouldReturnOk()
    {
        var response = await _client.GetAsync("/api/v1/admin/configs");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var configs = await response.Content.ReadFromJsonAsync<List<AdminConfigResponse>>();
        configs.Should().NotBeNull();
        configs!.Count.Should().BeGreaterThanOrEqualTo(3);
    }

    [Fact]
    public async Task UpdateConfig_ShouldChangeValue()
    {
        var configs = await _client.GetFromJsonAsync<List<AdminConfigResponse>>("/api/v1/admin/configs");
        var siteName = configs!.First(c => c.ConfigKey == "site.name");

        var response = await _client.PutAsJsonAsync($"/api/v1/admin/configs/{siteName.Id}",
            new { ConfigValue = "集成测试工厂", UpdatedBy = "test" });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<AdminConfigResponse>();
        result!.ConfigValue.Should().Be("集成测试工厂");
    }

    private class AdminUserResponse
    {
        public string Id { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public bool MustChangePassword { get; set; }
    }

    private class AdminConfigResponse
    {
        public string Id { get; set; } = string.Empty;
        public string ConfigKey { get; set; } = string.Empty;
        public string ConfigValue { get; set; } = string.Empty;
        public string? Category { get; set; }
    }
}
