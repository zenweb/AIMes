using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using MES.Infrastructure.Data;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace MES.Tests.Integration.Controllers;

[Collection("IntegrationSerial")]
public class EmployeeControllerTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly TestWebApplicationFactory _factory;

    public EmployeeControllerTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetAll_ShouldReturnOk()
    {
        var response = await _client.GetAsync("/api/v1/employee");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetById_WhenExists_ShouldReturnOk()
    {
        var createResp = await _client.PostAsJsonAsync("/api/v1/employee", new
        {
            EmployeeNumber = "IT-EMP-GET",
            Name = "GetTest",
            Role = "Operator"
        });
        var created = await createResp.Content.ReadFromJsonAsync<EmployeeResponse>();

        var response = await _client.GetAsync($"/api/v1/employee/{created!.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetById_WhenNotExists_ShouldReturnNotFound()
    {
        var response = await _client.GetAsync("/api/v1/employee/non-existent");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Create_ShouldReturnCreated()
    {
        var request = new
        {
            EmployeeNumber = "IT-EMP-001",
            Name = "集成测试员工",
            Phone = "13900001111",
            Role = "Engineer",
            Team = "技术组",
            Shift = "Day"
        };

        var response = await _client.PostAsJsonAsync("/api/v1/employee", request);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var result = await response.Content.ReadFromJsonAsync<EmployeeResponse>();
        result!.Name.Should().Be("集成测试员工");
        result.Role.Should().Be("Engineer");
    }

    [Fact]
    public async Task Create_ShouldPersistAuditLogFromEndpointFilter()
    {
        var employeeNumber = $"IT-EMP-AUD-{Guid.NewGuid():N}";
        var request = new
        {
            EmployeeNumber = employeeNumber,
            Name = "审计落库测试员工",
            Phone = "13900002222",
            Role = "Engineer",
            Team = "技术组",
            Shift = "Day"
        };
        _client.DefaultRequestHeaders.Remove("X-Test-User");
        _client.DefaultRequestHeaders.Add("X-Test-User", "audit-filter-user");

        var response = await _client.PostAsJsonAsync("/api/v1/employee", request);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        db.AuditLogs.Should().Contain(log =>
            log.UserId == "audit-filter-user"
            && log.Action == "POST"
            && log.Resource == "employee"
            && log.NewValues != null
            && log.NewValues.Contains(employeeNumber));
    }

    [Fact]
    public async Task Update_ShouldModifyEmployee()
    {
        // create dedicated employee for update test
        var createResp = await _client.PostAsJsonAsync("/api/v1/employee", new
        {
            EmployeeNumber = "IT-EMP-UPD",
            Name = "Original",
            Role = "Operator"
        });
        var created = await createResp.Content.ReadFromJsonAsync<EmployeeResponse>();

        var request = new { Name = "更新名字", Role = "Lead" };
        var response = await _client.PutAsJsonAsync($"/api/v1/employee/{created!.Id}", request);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<EmployeeResponse>();
        result!.Name.Should().Be("更新名字");
        result.Role.Should().Be("Lead");
    }

    [Fact]
    public async Task Deactivate_ShouldSetInactive()
    {
        // create dedicated employee for deactivate test
        var createResp = await _client.PostAsJsonAsync("/api/v1/employee", new
        {
            EmployeeNumber = "IT-EMP-DEACT",
            Name = "ToDeactivate",
            Role = "Operator"
        });
        var created = await createResp.Content.ReadFromJsonAsync<EmployeeResponse>();

        await _client.PostAsync($"/api/v1/employee/{created!.Id}/deactivate", null);

        var getResp = await _client.GetAsync($"/api/v1/employee/{created.Id}");
        var result = await getResp.Content.ReadFromJsonAsync<EmployeeResponse>();
        result!.IsActive.Should().BeFalse();
    }

    [Fact]
    public async Task GetByTeam_ShouldReturnFiltered()
    {
        await _client.PostAsJsonAsync("/api/v1/employee", new
        {
            EmployeeNumber = "IT-EMP-TEAM",
            Name = "TeamTest",
            Role = "Operator",
            Team = "质检组"
        });

        var response = await _client.GetAsync("/api/v1/employee/team/质检组");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<List<EmployeeResponse>>();
        result.Should().NotBeEmpty();
        result.Should().AllSatisfy(e => e.Team.Should().Be("质检组"));
    }

    private class EmployeeResponse
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? Team { get; set; }
        public bool IsActive { get; set; }
    }
}
