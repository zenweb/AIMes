using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using MES.Application.DTOs;
using MES.Domain.Entities.Bom;
using MES.Domain.ValueObjects;
using Xunit;

namespace MES.Tests.Integration.Controllers;

[Collection("IntegrationSerial")]
public class BomControllerTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly TestWebApplicationFactory _factory;

    public BomControllerTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CreateBom_ShouldReturnCreated()
    {
        var request = new CreateBomRequest
        {
            BomCode = "BOM-TEST-001",
            BomName = "测试BOM",
            ProductCode = "PROD-TEST-001",
            ProductName = "测试产品",
            BomType = "Manufacturing",
            Items =
            [
                new CreateBomItemRequest
                {
                    MaterialCode = "TEST-AL-001",
                    MaterialName = "测试铝合金",
                    Quantity = 2,
                    Unit = "PCS",
                    Sequence = 1,
                }
            ]
        };

        var response = await _client.PostAsJsonAsync("/api/v1/bom", request);

        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var body = await response.Content.ReadFromJsonAsync<BomSummaryDto>();
        body.Should().NotBeNull();
        body!.BomCode.Should().Be("BOM-TEST-001");
        body.ProductCode.Should().Be("PROD-TEST-001");
    }

    [Fact]
    public async Task ExplodeBom_ShouldReturnMaterialList()
    {
        // Arrange: create a BOM and capture its ID
        var createReq = new CreateBomRequest
        {
            BomCode = "BOM-EXPLODE-TEST",
            BomName = "爆炸测试BOM",
            ProductCode = "PROD-EXPLODE",
            ProductName = "爆炸测试产品",
            BomType = "Manufacturing",
            Items =
            [
                new CreateBomItemRequest
                {
                    MaterialCode = "TEST-AL-001",
                    MaterialName = "测试铝合金",
                    Quantity = 2,
                    Unit = "KG",
                    Sequence = 1,
                }
            ]
        };

        var createResp = await _client.PostAsJsonAsync("/api/v1/bom", createReq);
        createResp.StatusCode.Should().Be(HttpStatusCode.Created);
        var created = await createResp.Content.ReadFromJsonAsync<BomSummaryDto>();
        created.Should().NotBeNull();

        var response = await _client.GetAsync($"/api/v1/bom/{created!.Id}/explode?quantity=5");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<BomExplosionResultDto>();
        result.Should().NotBeNull();
        result!.BomId.Should().Be(created.Id);
        result.Items.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task KittingCheck_ShouldReturnAvailabilityStatus()
    {
        var createReq = new CreateBomRequest
        {
            BomCode = "BOM-KITTING-TEST",
            BomName = "齐套测试BOM",
            ProductCode = "PROD-KITTING",
            ProductName = "齐套测试产品",
            BomType = "Manufacturing",
            Items =
            [
                new CreateBomItemRequest
                {
                    MaterialCode = "TEST-AL-001",
                    MaterialName = "测试铝合金",
                    Quantity = 10,
                    Unit = "KG",
                    Sequence = 1,
                }
            ]
        };

        var createResp = await _client.PostAsJsonAsync("/api/v1/bom", createReq);
        createResp.StatusCode.Should().Be(HttpStatusCode.Created);
        var created = await createResp.Content.ReadFromJsonAsync<BomSummaryDto>();
        created.Should().NotBeNull();

        var response = await _client.GetAsync($"/api/v1/bom/{created!.Id}/kitting?quantity=1");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<KittingCheckResultDto>();
        result.Should().NotBeNull();
        result!.BomName.Should().Be("齐套测试BOM");
        result.Items.Should().NotBeNullOrEmpty();
        var alItem = result.Items.FirstOrDefault(i => i.MaterialCode == "TEST-AL-001");
        alItem.Should().NotBeNull();
        alItem!.RequiredQuantity.Should().Be(10);
    }

    [Fact]
    public async Task GetBom_NonexistentId_ShouldReturnNotFound()
    {
        var response = await _client.GetAsync("/api/v1/bom/nonexistent-id-999");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
