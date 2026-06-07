using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using MES.Application.DTOs;
using Xunit;

namespace MES.Tests.Integration.Controllers;

[Collection("IntegrationSerial")]
public class RoutingControllerTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly TestWebApplicationFactory _factory;

    public RoutingControllerTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CreateRoute_ShouldReturnCreated()
    {
        var request = new CreateRouteRequest
        {
            RouteCode = "ROUTE-TEST-001",
            RouteName = "测试工艺路线",
            ProductCode = "PROD-ROUTE-001",
            ProductName = "测试路由产品",
            Steps =
            [
                new CreateRoutingStepRequest
                {
                    OperationCode = "OP-001",
                    OperationName = "CNC加工",
                    WorkstationType = "CNC",
                    StandardSetupMinutes = 30,
                    StandardRunMinutesPerUnit = 5,
                    Sequence = 1,
                },
                new CreateRoutingStepRequest
                {
                    OperationCode = "OP-002",
                    OperationName = "质检",
                    WorkstationType = "QC",
                    StandardSetupMinutes = 5,
                    StandardRunMinutesPerUnit = 2,
                    Sequence = 2,
                },
            ]
        };

        var response = await _client.PostAsJsonAsync("/api/v1/routing", request);

        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var body = await response.Content.ReadFromJsonAsync<ProcessRouteDto>();
        body.Should().NotBeNull();
        body!.RouteCode.Should().Be("ROUTE-TEST-001");
    }

    [Fact]
    public async Task GetRouteByCode_ShouldReturnRoute()
    {
        // Arrange: create a route first
        var createReq = new CreateRouteRequest
        {
            RouteCode = "ROUTE-BYCODE-TEST",
            RouteName = "编码查询测试",
            ProductCode = "PROD-BYCODE",
            ProductName = "编码查询产品",
            Steps =
            [
                new CreateRoutingStepRequest
                {
                    OperationCode = "OP-BYCODE",
                    OperationName = "测试工序",
                    WorkstationType = "TEST",
                    StandardSetupMinutes = 10,
                    StandardRunMinutesPerUnit = 1,
                    Sequence = 1,
                }
            ]
        };
        var createResp = await _client.PostAsJsonAsync("/api/v1/routing", createReq);
        createResp.StatusCode.Should().Be(HttpStatusCode.Created);

        var response = await _client.GetAsync("/api/v1/routing/by-code/ROUTE-BYCODE-TEST");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<RouteDetailDto>();
        body.Should().NotBeNull();
        body!.RouteCode.Should().Be("ROUTE-BYCODE-TEST");
        body.RouteName.Should().Be("编码查询测试");
        body.Steps.Should().NotBeEmpty();
    }

    [Fact]
    public async Task GetRoute_NonexistentId_ShouldReturnNotFound()
    {
        var response = await _client.GetAsync("/api/v1/routing/nonexistent-id-999");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetRouteByCode_Nonexistent_ShouldReturnNotFound()
    {
        var response = await _client.GetAsync("/api/v1/routing/by-code/NONEXISTENT-ROUTE");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
