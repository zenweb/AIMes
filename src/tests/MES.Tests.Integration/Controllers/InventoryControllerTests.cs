using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using MES.Domain.Entities.Production;
using MES.Infrastructure.Data;
using Microsoft.Extensions.DependencyInjection;
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
    public async Task GetDashboard_ShouldReturnValidDashboard()
    {
        var response = await _client.GetAsync("/api/v1/inventory/dashboard");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<InventoryDashboardResponse>();
        result.Should().NotBeNull();
    }

    [Fact]
    public async Task GetAll_ShouldReturnOk()
    {
        var response = await _client.GetAsync("/api/v1/inventory");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<List<InventoryItemResponse>>();
        result.Should().NotBeNull();
    }

    [Fact]
    public async Task GetByCode_WhenExists_ShouldReturnItem()
    {
        // Seed a material specifically for this test to avoid cross-class DB interference
        _factory.SeedData(db =>
        {
            if (!db.Materials.Any(m => m.MaterialCode == "IT-BYZ-CODE"))
            {
                db.Materials.Add(new Material
                {
                    MaterialCode = "IT-BYZ-CODE",
                    MaterialName = "专用测试物料",
                    MaterialType = "原材料",
                    Unit = "KG",
                    AvailableQuantity = 100,
                    ReservedQuantity = 0,
                    SafetyStock = 10,
                    StorageLocation = "A-01",
                    CreatedAt = DateTime.UtcNow
                });
            }
        });

        var response = await _client.GetAsync("/api/v1/inventory/IT-BYZ-CODE");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<InventoryItemResponse>();
        result!.MaterialCode.Should().Be("IT-BYZ-CODE");
        result.MaterialName.Should().Be("专用测试物料");
        result.AvailableQuantity.Should().Be(100);
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
    public async Task StockIn_WithValidMaterial_ShouldReturnTransaction()
    {
        // Seed a material for this test
        _factory.SeedData(db =>
        {
            if (!db.Materials.Any(m => m.MaterialCode == "IT-STOCKIN"))
            {
                db.Materials.Add(new Material
                {
                    MaterialCode = "IT-STOCKIN",
                    MaterialName = "入库测试物料",
                    MaterialType = "原材料",
                    Unit = "PCS",
                    AvailableQuantity = 50,
                    ReservedQuantity = 0,
                    SafetyStock = 5,
                    StorageLocation = "A-02",
                    CreatedAt = DateTime.UtcNow
                });
            }
        });

        var request = new { MaterialCode = "IT-STOCKIN", Quantity = 30, Warehouse = "WH-01" };
        var response = await _client.PostAsJsonAsync("/api/v1/inventory/stock-in", request);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<StockTransactionResponse>();
        result.Should().NotBeNull();
        result!.MaterialCode.Should().Be("IT-STOCKIN");
        result.TransactionType.Should().Be("StockIn");
    }

    [Fact]
    public async Task GetTransactions_ShouldReturnOk()
    {
        var response = await _client.GetAsync("/api/v1/inventory/transactions");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<List<StockTransactionResponse>>();
        result.Should().NotBeNull();
    }

    private class InventoryDashboardResponse
    {
        public int TotalMaterials { get; set; }
        public int LowStockCount { get; set; }
        public int OutOfStockCount { get; set; }
        public int TodayTransactions { get; set; }
    }

    private class InventoryItemResponse
    {
        public string Id { get; set; } = string.Empty;
        public string MaterialCode { get; set; } = string.Empty;
        public string MaterialName { get; set; } = string.Empty;
        public string MaterialType { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public int AvailableQuantity { get; set; }
        public int ReservedQuantity { get; set; }
        public int SafetyStock { get; set; }
        public string StorageLocation { get; set; } = string.Empty;
    }

    private class StockTransactionResponse
    {
        public string Id { get; set; } = string.Empty;
        public string MaterialCode { get; set; } = string.Empty;
        public string MaterialName { get; set; } = string.Empty;
        public string TransactionType { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public string? Warehouse { get; set; }
    }
}
