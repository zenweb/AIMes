using System.Net;
using FluentAssertions;
using MES.Domain.Entities.Production;
using Xunit;

namespace MES.Tests.Integration.Controllers;

[Collection("IntegrationSerial")]
public class ScanControllerTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly TestWebApplicationFactory _factory;

    public ScanControllerTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Scan_UnknownCode_ShouldReturnNotFound()
    {
        var response = await _client.GetAsync("/api/v1/scan/NONEXISTENT-CODE-12345");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Scan_KnownEquipmentCode_ShouldReturnEquipmentType()
    {
        var response = await _client.GetAsync("/api/v1/scan/CNC-001");
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await response.Content.ReadAsStringAsync();
        body.Should().Contain("Equipment");
        body.Should().Contain("CNC-001");
    }

    [Fact]
    public async Task Scan_KnownMaterialCode_ShouldReturnMaterialType()
    {
        _factory.SeedData(db =>
        {
            if (!db.Materials.Any(m => m.MaterialCode == "SCAN-TEST-MAT"))
            {
                db.Materials.Add(Material.Create(
                    "SCAN-TEST-MAT",
                    "扫描测试物料",
                    "PCS",
                    safetyStock: 10,
                    storageLocation: "A-01",
                    materialType: "原材料",
                    availableQuantity: 100));
            }
        });

        var response = await _client.GetAsync("/api/v1/scan/SCAN-TEST-MAT");
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await response.Content.ReadAsStringAsync();
        body.Should().Contain("Material");
        body.Should().Contain("SCAN-TEST-MAT");
    }
}
