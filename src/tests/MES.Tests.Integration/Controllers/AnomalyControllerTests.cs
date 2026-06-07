using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using MES.Api.Hubs;
using MES.Api.Services;
using MES.Application.DTOs;
using MES.Domain.Entities.Anomalies;
using MES.Domain.ValueObjects;
using MES.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace MES.Tests.Integration.Controllers;

[Collection("IntegrationSerial")]
public class AnomalyControllerTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly TestWebApplicationFactory _factory;

    public AnomalyControllerTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetAll_ShouldReturnOnlyOpenAnomalies()
    {
        var openTitle = $"IT-OPEN-{Guid.NewGuid()}";
        var resolvedTitle = $"IT-RESOLVED-{Guid.NewGuid()}";

        _factory.SeedData(db =>
        {
            var open = new ProductionAnomaly(
                new WorkOrderNumber("WO-ANOMALY-OPEN"),
                new OperationCode("OP-OPEN"),
                "Equipment",
                AnomalySeverity.High,
                openTitle,
                "Open anomaly for repository migration verification",
                detectedBy: "integration-test");

            var resolved = new ProductionAnomaly(
                new WorkOrderNumber("WO-ANOMALY-RESOLVED"),
                new OperationCode("OP-RESOLVED"),
                "Quality",
                AnomalySeverity.Medium,
                resolvedTitle,
                "Resolved anomaly should not appear in open list",
                detectedBy: "integration-test");
            resolved.Resolve("Known cause", "Handled", "integration-test");

            db.ProductionAnomalies.AddRange(open, resolved);
        });

        var response = await _client.GetAsync("/api/v1/anomaly?page=1&pageSize=100");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<PagedResult<ProductionAnomalyDto>>();
        Assert.NotNull(result);
        result.Items.Should().Contain(a => a.Title == openTitle && a.Status == "Open");
        result.Items.Should().NotContain(a => a.Title == resolvedTitle);
    }
}

[Collection("IntegrationSerial")]
public class AnomalyTransactionTests : IClassFixture<AnomalyTransactionWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly AnomalyTransactionWebApplicationFactory _factory;

    public AnomalyTransactionTests(AnomalyTransactionWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Create_WhenNotificationFails_ShouldRollbackAnomalyAndAudit()
    {
        var title = $"IT-TX-ROLLBACK-{Guid.NewGuid():N}";
        var request = new CreateAnomalyRequest
        {
            WorkOrderNumber = "WO-B4-TX",
            OperationCode = "OP-B4",
            AnomalyType = "Equipment",
            Severity = "High",
            Title = title,
            Description = "B4 transaction rollback verification",
            DetectedBy = "integration-test"
        };

        var response = await _client.PostAsJsonAsync("/api/v1/anomaly", request);

        response.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        db.ProductionAnomalies.Should().NotContain(a => a.Title == title);
        db.AuditLogs.Should().NotContain(a =>
            a.Resource == "Anomaly"
            && a.Action == "CREATE"
            && a.NewValues != null
            && a.NewValues.Contains(title));
    }
}

public sealed class AnomalyTransactionWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly SqliteConnection _connection = new("Data Source=:memory:");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        Environment.SetEnvironmentVariable("AIMES_DATABASE_PROVIDER", DatabaseProvider.SqlServer);
        Environment.SetEnvironmentVariable("Jwt__SigningKey", "integration-test-signing-key-32-bytes-minimum");
        _connection.Open();

        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Database:Provider"] = DatabaseProvider.SqlServer,
                ["ConnectionStrings:DefaultConnection"] = "Server=(local);Database=unused;",
                ["Messaging:Transport"] = "Disabled"
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

            services.AddEntityFrameworkSqlite();
            services.AddDbContext<MesDbContext>(options => options.UseSqlite(_connection));

            var hostedServices = services
                .Where(d => d.ImplementationType?.Name == "MetricsBackgroundService"
                         || d.ImplementationType?.Name == "SchedulerAgentEventHandler")
                .ToList();
            foreach (var descriptor in hostedServices)
            {
                services.Remove(descriptor);
            }

            services.AddHealthChecks();

            services.AddAuthentication(TestAuthHandler.AuthenticationScheme)
                .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(
                    TestAuthHandler.AuthenticationScheme,
                    _ => { });

            services.AddSingleton<IDatabaseStartupValidator, NoOpDatabaseStartupValidator>();
            services.AddScoped<INotificationService, ThrowingNotificationService>();
            services.AddTransient<IStartupFilter, RelationalSchemaStartupFilter>();
        });

        builder.UseEnvironment("Development");
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        _connection.Dispose();
    }
}

public sealed class RelationalSchemaStartupFilter : IStartupFilter
{
    public Action<IApplicationBuilder> Configure(Action<IApplicationBuilder> next)
    {
        return app =>
        {
            using var scope = app.ApplicationServices.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
            db.Database.EnsureCreated();
            next(app);
        };
    }
}

public sealed class NoOpDatabaseStartupValidator : IDatabaseStartupValidator
{
    public Task ValidateAsync(CancellationToken ct) => Task.CompletedTask;
}

public sealed class ThrowingNotificationService : INotificationService
{
    public Task NotifyAnomaly(string workOrderId, string description, string severity)
    {
        throw new Exception("Notification failure for transaction rollback test.");
    }

    public Task NotifyEquipmentStatusChanged(string equipmentId, string equipmentName, string status) => Task.CompletedTask;

    public Task NotifyQualityAlert(string inspectionId, string productName, string severity) => Task.CompletedTask;

    public Task NotifyProductionProgress(string workOrderId, string orderNumber, double progress) => Task.CompletedTask;

    public Task NotifyInventoryChanged(string materialCode, string materialName, string transactionType, decimal quantity) => Task.CompletedTask;

    public Task NotifyPurchaseOrderStatusChanged(string orderId, string orderNumber, string status) => Task.CompletedTask;
}
