using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using MES.Domain.Entities.Production;
using MES.Domain.Interfaces.Repositories;
using Xunit;

namespace MES.Tests.Integration.Controllers;

public class InventoryControllerTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly TestWebApplicationFactory _factory;

    public InventoryControllerTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetDashboard_ShouldReturnOk()
    {
        var response = await _client.GetAsync("/api/v1/inventory/dashboard");
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetAll_ShouldReturnOk()
    {
        var response = await _client.GetAsync("/api/v1/inventory");
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetByCode_WhenNotExists_ShouldReturnNotFound()
    {
        var response = await _client.GetAsync("/api/v1/inventory/NONEXISTENT");
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task StockIn_WithInvalidMaterial_ShouldReturnBadRequest()
    {
        var request = new { MaterialCode = "NONEXIST", Quantity = 10 };
        var response = await _client.PostAsJsonAsync("/api/v1/inventory/stock-in", request);
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetTransactions_ShouldReturnOk()
    {
        var response = await _client.GetAsync("/api/v1/inventory/transactions");
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
