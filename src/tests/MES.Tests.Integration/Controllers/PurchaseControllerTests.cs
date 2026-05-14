using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Xunit;

namespace MES.Tests.Integration.Controllers;

public class PurchaseControllerTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public PurchaseControllerTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetAll_ShouldReturnOk()
    {
        var response = await _client.GetAsync("/api/v1/purchase");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Create_ShouldReturnCreated()
    {
        var request = new
        {
            OrderNumber = "IT-PO-001",
            SupplierName = "集成测试供应商",
            CreatedBy = "admin",
            Items = new[]
            {
                new { MaterialCode = "M1", MaterialName = "物料1", Unit = "PCS", Quantity = 10, UnitPrice = 50.0 }
            }
        };

        var response = await _client.PostAsJsonAsync("/api/v1/purchase", request);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    [Fact]
    public async Task CreateAndGetById_ShouldReturnOrder()
    {
        var createReq = new
        {
            OrderNumber = "IT-PO-002",
            SupplierName = "S1",
            CreatedBy = "admin",
            Items = new[]
            {
                new { MaterialCode = "M1", MaterialName = "M1", Unit = "PCS", Quantity = 5, UnitPrice = 100.0 }
            }
        };
        var createResp = await _client.PostAsJsonAsync("/api/v1/purchase", createReq);
        var created = await createResp.Content.ReadFromJsonAsync<PurchaseDetailResponse>();

        var response = await _client.GetAsync($"/api/v1/purchase/{created!.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<PurchaseDetailResponse>();
        result!.OrderNumber.Should().Be("IT-PO-002");
        result.Status.Should().Be("Draft");
    }

    [Fact]
    public async Task GetById_WhenNotExists_ShouldReturnNotFound()
    {
        var response = await _client.GetAsync("/api/v1/purchase/non-existent");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task SubmitAndConfirm_ShouldTransitionStatus()
    {
        var createResp = await _client.PostAsJsonAsync("/api/v1/purchase", new
        {
            OrderNumber = "IT-PO-FLOW",
            SupplierName = "S1",
            CreatedBy = "admin",
            Items = new[]
            {
                new { MaterialCode = "M1", MaterialName = "M1", Unit = "PCS", Quantity = 10, UnitPrice = 10.0 }
            }
        });
        var created = await createResp.Content.ReadFromJsonAsync<PurchaseDetailResponse>();

        var submitResp = await _client.PostAsync($"/api/v1/purchase/{created!.Id}/submit", null);
        submitResp.StatusCode.Should().Be(HttpStatusCode.OK);
        var submitted = await submitResp.Content.ReadFromJsonAsync<PurchaseDetailResponse>();
        submitted!.Status.Should().Be("Submitted");

        var confirmResp = await _client.PostAsync($"/api/v1/purchase/{created.Id}/confirm", null);
        confirmResp.StatusCode.Should().Be(HttpStatusCode.OK);
        var confirmed = await confirmResp.Content.ReadFromJsonAsync<PurchaseDetailResponse>();
        confirmed!.Status.Should().Be("Confirmed");
    }

    [Fact]
    public async Task Receive_ShouldUpdateQuantity()
    {
        var createResp = await _client.PostAsJsonAsync("/api/v1/purchase", new
        {
            OrderNumber = "IT-PO-RECV",
            SupplierName = "S1",
            CreatedBy = "admin",
            Items = new[]
            {
                new { MaterialCode = "M1", MaterialName = "M1", Unit = "PCS", Quantity = 10, UnitPrice = 10.0 }
            }
        });
        var created = await createResp.Content.ReadFromJsonAsync<PurchaseDetailResponse>();
        await _client.PostAsync($"/api/v1/purchase/{created!.Id}/submit", null);
        await _client.PostAsync($"/api/v1/purchase/{created.Id}/confirm", null);

        var receiveResp = await _client.PostAsJsonAsync($"/api/v1/purchase/{created.Id}/receive",
            new { MaterialCode = "M1", Quantity = 7 });
        receiveResp.StatusCode.Should().Be(HttpStatusCode.OK);
        var received = await receiveResp.Content.ReadFromJsonAsync<PurchaseDetailResponse>();
        received!.Items[0].ReceivedQuantity.Should().Be(7);
    }

    [Fact]
    public async Task Cancel_ShouldSetCancelled()
    {
        var createResp = await _client.PostAsJsonAsync("/api/v1/purchase", new
        {
            OrderNumber = "IT-PO-CANCEL",
            SupplierName = "S1",
            CreatedBy = "admin",
            Items = new[]
            {
                new { MaterialCode = "M1", MaterialName = "M1", Unit = "PCS", Quantity = 1, UnitPrice = 1.0 }
            }
        });
        var created = await createResp.Content.ReadFromJsonAsync<PurchaseDetailResponse>();

        var cancelResp = await _client.PostAsync($"/api/v1/purchase/{created!.Id}/cancel", null);
        cancelResp.StatusCode.Should().Be(HttpStatusCode.OK);

        var getResp = await _client.GetAsync($"/api/v1/purchase/{created.Id}");
        var result = await getResp.Content.ReadFromJsonAsync<PurchaseDetailResponse>();
        result!.Status.Should().Be("Cancelled");
    }

    private class PurchaseDetailResponse
    {
        public string Id { get; set; } = string.Empty;
        public string OrderNumber { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public List<PurchaseLineItemResponse> Items { get; set; } = new();
    }

    private class PurchaseLineItemResponse
    {
        public double ReceivedQuantity { get; set; }
    }
}
