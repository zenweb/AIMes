using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Xunit;

namespace MES.Tests.Integration.Controllers;

public class ProductionControllerTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public ProductionControllerTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Scan_WithInvalidCode_ShouldReturnBadRequest()
    {
        var request = new { Code = "", OperatorId = "test" };
        var response = await _client.PostAsJsonAsync("/api/v1/production/scan", request);
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task StartOperation_WithInvalidId_ShouldReturnBadRequest()
    {
        var request = new { OperatorId = "test-operator", StationId = "ST-001" };
        var response = await _client.PostAsJsonAsync("/api/v1/production/operations/invalid-id/start", request);
        response.StatusCode.Should().BeOneOf(HttpStatusCode.BadRequest, HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task ReportException_WithInvalidId_ShouldReturnNotFound()
    {
        var request = new { Reason = "测试异常" };
        var response = await _client.PostAsJsonAsync(
            "/api/v1/production/operations/invalid-id/exception", request);
        response.StatusCode.Should().BeOneOf(HttpStatusCode.BadRequest, HttpStatusCode.NotFound);
    }
}
