using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using MES.Api.Hubs;
using MES.Api.Services;
using MES.Application.DTOs;
using MES.Domain.Interfaces.Services;
using MES.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Xunit;

namespace MES.Tests.Integration.Controllers;

[Collection("IntegrationSerial")]
public sealed class CoreModulePersistenceRecoveryTests
{
    [Fact]
    public async Task CoreModules_ShouldSurviveApplicationRestartAndRemainQueryable()
    {
        var databaseName = $"aimes_recovery_{Guid.NewGuid():N}";
        await PostgreSqlIntegrationTestScope.RecreateDatabaseAsync(databaseName);
        var suffix = Guid.NewGuid().ToString("N")[..8];
        string anomalyId;
        string bomId;
        string employeeId;
        string purchaseId;

        await using (var firstHost = new PersistentPostgreSqlWebApplicationFactory(databaseName))
        {
            var client = firstHost.CreateClient();
            var anomaly = await CreateAnomalyAsync(client, suffix);
            anomalyId = anomaly.Id;

            var bom = await CreateBomAsync(client, suffix);
            bomId = bom.Id;

            var employee = await CreateEmployeeAsync(client, suffix);
            employeeId = employee.Id;

            await SeedMaterialAsync(firstHost, suffix);
            await StockInAsync(client, suffix);

            var purchase = await CreatePurchaseAsync(client, suffix);
            purchaseId = purchase.Id;
        }

        await using var secondHost = new PersistentPostgreSqlWebApplicationFactory(databaseName);
        var recovered = secondHost.CreateClient();

        (await recovered.GetAsync($"/api/v1/anomaly/{anomalyId}")).StatusCode.Should().Be(HttpStatusCode.OK);
        (await recovered.GetAsync($"/api/v1/bom/{bomId}")).StatusCode.Should().Be(HttpStatusCode.OK);
        (await recovered.GetAsync($"/api/v1/employee/{employeeId}")).StatusCode.Should().Be(HttpStatusCode.OK);
        (await recovered.GetAsync($"/api/v1/inventory/IT-REC-{suffix}")).StatusCode.Should().Be(HttpStatusCode.OK);
        (await recovered.GetAsync($"/api/v1/purchase/{purchaseId}")).StatusCode.Should().Be(HttpStatusCode.OK);
    }

    private static async Task<ProductionAnomalyDto> CreateAnomalyAsync(HttpClient client, string suffix)
    {
        var response = await client.PostAsJsonAsync("/api/v1/anomaly", new CreateAnomalyRequest
        {
            WorkOrderNumber = $"WO-REC-{suffix}",
            OperationCode = "OP-REC",
            AnomalyType = "Equipment",
            Severity = "High",
            Title = $"Recovery anomaly {suffix}",
            Description = "Core module persistence recovery evidence.",
            DetectedBy = "integration-test"
        });

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        return (await response.Content.ReadFromJsonAsync<ProductionAnomalyDto>())!;
    }

    private static async Task<BomSummaryDto> CreateBomAsync(HttpClient client, string suffix)
    {
        var response = await client.PostAsJsonAsync("/api/v1/bom", new CreateBomRequest
        {
            BomCode = $"BOM-REC-{suffix}",
            BomName = $"Recovery BOM {suffix}",
            ProductCode = $"PROD-REC-{suffix}",
            ProductName = "Recovery product",
            BomType = "Manufacturing",
            Items =
            [
                new CreateBomItemRequest
                {
                    MaterialCode = $"MAT-BOM-{suffix}",
                    MaterialName = "Recovery BOM material",
                    Quantity = 1,
                    Unit = "PCS",
                    Sequence = 1
                }
            ]
        });

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        return (await response.Content.ReadFromJsonAsync<BomSummaryDto>())!;
    }

    private static async Task<EmployeeDto> CreateEmployeeAsync(HttpClient client, string suffix)
    {
        var response = await client.PostAsJsonAsync("/api/v1/employee", new CreateEmployeeRequest
        {
            EmployeeNumber = $"EMP-REC-{suffix}",
            Name = $"Recovery employee {suffix}",
            Role = "Operator",
            Team = "Recovery",
            Shift = "Day"
        });

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        return (await response.Content.ReadFromJsonAsync<EmployeeDto>())!;
    }

    private static async Task SeedMaterialAsync(PersistentPostgreSqlWebApplicationFactory host, string suffix)
    {
        await using var scope = host.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        db.Materials.Add(MES.Domain.Entities.Production.Material.Create(
            $"IT-REC-{suffix}",
            "Recovery material",
            "PCS",
            safetyStock: 1,
            storageLocation: "REC",
            materialType: "Raw",
            availableQuantity: 10));
        await db.SaveChangesAsync();
    }

    private static async Task StockInAsync(HttpClient client, string suffix)
    {
        var response = await client.PostAsJsonAsync("/api/v1/inventory/stock-in", new StockInRequest
        {
            MaterialCode = $"IT-REC-{suffix}",
            Quantity = 5,
            Warehouse = "REC-WH"
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    private static async Task<PurchaseOrderDetailDto> CreatePurchaseAsync(HttpClient client, string suffix)
    {
        var response = await client.PostAsJsonAsync("/api/v1/purchase", new CreatePurchaseOrderRequest
        {
            OrderNumber = $"PO-REC-{suffix}",
            SupplierName = "Recovery supplier",
            CreatedBy = "integration-test",
            Items =
            [
                new CreatePurchaseLineRequest
                {
                    MaterialCode = $"MAT-PO-{suffix}",
                    MaterialName = "Recovery purchase material",
                    Unit = "PCS",
                    Quantity = 1,
                    UnitPrice = 10
                }
            ]
        });

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        return (await response.Content.ReadFromJsonAsync<PurchaseOrderDetailDto>())!;
    }
}

public sealed class PersistentPostgreSqlWebApplicationFactory(string databaseName) : WebApplicationFactory<Program>
{
    private string ConnectionString => PostgreSqlIntegrationTestScope.CreateConnectionString(databaseName);

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        Environment.SetEnvironmentVariable("AIMES_DATABASE_PROVIDER", DatabaseProvider.PostgreSql);
        Environment.SetEnvironmentVariable("Jwt__SigningKey", "integration-test-signing-key-32-bytes-minimum");

        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Database:Provider"] = DatabaseProvider.PostgreSql,
                ["ConnectionStrings:DefaultConnection"] = ConnectionString,
                ["ConnectionStrings:Redis"] = string.Empty,
                ["ConnectionStrings:RabbitMQ"] = string.Empty,
                ["Messaging:Transport"] = "Disabled",
                ["AI:VectorStore:Provider"] = "InMemory"
            });
        });

        builder.ConfigureServices(services =>
        {
            var toRemove = services
                .Where(d => d.ServiceType.Namespace?.StartsWith("Microsoft.EntityFrameworkCore") == true
                         || d.ImplementationType?.Namespace?.StartsWith("Microsoft.EntityFrameworkCore") == true
                         || d.ServiceType.FullName?.Contains("Npgsql") == true
                         || d.ImplementationType?.FullName?.Contains("Npgsql") == true
                         || d.ServiceType.FullName?.Contains("SqlServer") == true
                         || d.ImplementationType?.FullName?.Contains("SqlServer") == true)
                .ToList();
            foreach (var descriptor in toRemove)
            {
                services.Remove(descriptor);
            }

            services.AddEntityFrameworkNpgsql();
            services.AddDbContext<MesDbContext>(options => options.UseNpgsql(ConnectionString));

            var hostedServices = services
                .Where(d => d.ImplementationType?.Name is "MetricsBackgroundService" or "SchedulerAgentEventHandler")
                .ToList();
            foreach (var descriptor in hostedServices)
            {
                services.Remove(descriptor);
            }

            var cacheServices = services
                .Where(d => d.ServiceType == typeof(IDistributedCache))
                .ToList();
            foreach (var descriptor in cacheServices)
            {
                services.Remove(descriptor);
            }

            services.AddDistributedMemoryCache();
            services.AddHealthChecks();
            services.Configure<HealthCheckServiceOptions>(options => options.Registrations.Clear());
            services.AddSingleton<IDatabaseStartupValidator, NoOpDatabaseStartupValidator>();
            services.AddSingleton<IScheduleOptimizationService, TestScheduleOptimizationService>();
            services.AddScoped<INotificationService, NoOpNotificationService>();
            services.AddAuthentication(TestAuthHandler.AuthenticationScheme)
                .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(
                    TestAuthHandler.AuthenticationScheme,
                    _ => { });
            services.AddTransient<IStartupFilter, RelationalSchemaStartupFilter>();
        });

        builder.UseEnvironment("Development");
    }
}

public sealed class NoOpNotificationService : INotificationService
{
    public Task NotifyAnomaly(string workOrderId, string description, string severity) => Task.CompletedTask;

    public Task NotifyEquipmentStatusChanged(string equipmentId, string equipmentName, string status) => Task.CompletedTask;

    public Task NotifyQualityAlert(string inspectionId, string productName, string severity) => Task.CompletedTask;

    public Task NotifyProductionProgress(string workOrderId, string orderNumber, double progress) => Task.CompletedTask;

    public Task NotifyInventoryChanged(string materialCode, string materialName, string transactionType, decimal quantity) => Task.CompletedTask;

    public Task NotifyPurchaseOrderStatusChanged(string orderId, string orderNumber, string status) => Task.CompletedTask;
}
