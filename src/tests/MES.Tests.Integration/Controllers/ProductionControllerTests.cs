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
    public async Task StartOperation_WithInvalidId_ShouldReturnError()
    {
        var request = new { OperatorId = "test-operator", StationId = "ST-001" };
        var response = await _client.PostAsJsonAsync("/api/v1/production/operations/invalid-id/start", request);

        response.StatusCode.Should().BeOneOf(HttpStatusCode.BadRequest, HttpStatusCode.NotFound);
        var problem = await response.Content.ReadFromJsonAsync<ProblemDetailsResponse>();
        if (problem != null)
        {
            problem.Type.Should().NotBeNullOrEmpty();
        }
    }

    [Fact]
    public async Task CompleteOperation_WithInvalidId_ShouldReturnError()
    {
        var request = new { OutputQuantity = 10 };
        var response = await _client.PostAsJsonAsync("/api/v1/production/operations/invalid-id/complete", request);

        response.StatusCode.Should().BeOneOf(HttpStatusCode.BadRequest, HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task ReportException_WithInvalidId_ShouldReturnError()
    {
        var request = new { Reason = "测试异常" };
        var response = await _client.PostAsJsonAsync(
            "/api/v1/production/operations/invalid-id/exception", request);

        response.StatusCode.Should().BeOneOf(HttpStatusCode.BadRequest, HttpStatusCode.NotFound);
        var problem = await response.Content.ReadFromJsonAsync<ProblemDetailsResponse>();
        if (problem != null)
        {
            problem.Type.Should().NotBeNullOrEmpty();
        }
    }

    private class ProblemDetailsResponse
    {
        public string Type { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public int Status { get; set; }
        public string Detail { get; set; } = string.Empty;
        public string? Instance { get; set; }
    }
}
