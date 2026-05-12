using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Xunit;

namespace MES.Tests.Integration.Controllers;

public class AdminControllerTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public AdminControllerTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetUsers_ShouldReturnOk()
    {
        var response = await _client.GetAsync("/api/v1/admin/users");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task CreateUser_ShouldReturnCreated()
    {
        var request = new { Username = "ittest", DisplayName = "集成测试用户", Role = "Operator" };

        var response = await _client.PostAsJsonAsync("/api/v1/admin/users", request);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var result = await response.Content.ReadFromJsonAsync<AdminUserResponse>();
        result!.Username.Should().Be("ittest");
        result.Role.Should().Be("Operator");
    }

    [Fact]
    public async Task UpdateUser_ShouldModifyUser()
    {
        // create dedicated user for update test
        var createResp = await _client.PostAsJsonAsync("/api/v1/admin/users", new
        {
            Username = "itupduser",
            DisplayName = "Original",
            Role = "Operator"
        });
        var created = await createResp.Content.ReadFromJsonAsync<AdminUserResponse>();

        var response = await _client.PutAsJsonAsync($"/api/v1/admin/users/{created!.Id}",
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
        configs!.Count.Should().BeGreaterThanOrEqualTo(6);
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
    }

    private class AdminConfigResponse
    {
        public string Id { get; set; } = string.Empty;
        public string ConfigKey { get; set; } = string.Empty;
        public string ConfigValue { get; set; } = string.Empty;
        public string? Category { get; set; }
    }
}
