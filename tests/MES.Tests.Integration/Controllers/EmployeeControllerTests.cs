using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Xunit;

namespace MES.Tests.Integration.Controllers;

public class EmployeeControllerTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public EmployeeControllerTests(TestWebApplicationFactory factory)
    {
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
        var response = await _client.GetAsync("/api/v1/employee/emp1");

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
        var response = await _client.GetAsync("/api/v1/employee/team/质检组");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<List<EmployeeResponse>>();
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
