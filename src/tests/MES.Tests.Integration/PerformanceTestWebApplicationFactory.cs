using MES.Api.Services;
using MES.Domain.Entities.Admin;
using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Production;
using MES.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MES.Tests.Integration;

public sealed class PerformanceTestWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        Environment.SetEnvironmentVariable("AIMES_DATABASE_PROVIDER", DatabaseProvider.InMemory);
        Environment.SetEnvironmentVariable("Jwt__SigningKey", "integration-test-signing-key-32-bytes-minimum");

        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Database:Provider"] = DatabaseProvider.InMemory,
                ["ConnectionStrings:DefaultConnection"] = "Performance_Test_DB",
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
                    || d.ImplementationType?.FullName?.Contains("Npgsql") == true)
                .ToList();
            foreach (var descriptor in toRemove)
            {
                services.Remove(descriptor);
            }

            services.AddEntityFrameworkInMemoryDatabase();
            services.AddDbContext<MesDbContext>(options =>
            {
                options.UseInMemoryDatabase("Performance_Test_DB");
            });

            var hostedServices = services
                .Where(d => d.ImplementationType?.Name == "MetricsBackgroundService")
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
            services.AddTransient<IStartupFilter, PerformanceTestDataSeedFilter>();
        });

        builder.UseEnvironment("Development");
    }

    public void SeedData(Action<MesDbContext> seedAction)
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        seedAction(db);
        db.SaveChanges();
    }
}

public sealed class PerformanceTestDataSeedFilter : IStartupFilter
{
    public Action<IApplicationBuilder> Configure(Action<IApplicationBuilder> next)
    {
        return app =>
        {
            using var scope = app.ApplicationServices.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();

            if (!db.Equipment.Any())
            {
                db.Equipment.AddRange(
                    Equipment.Create("PERF-CNC-001", "Performance CNC 1", "CNC", "ws-001", "Workshop A", 100),
                    Equipment.Create("PERF-CNC-002", "Performance CNC 2", "CNC", "ws-001", "Workshop A", 80));
            }

            if (!db.SystemUsers.Any())
            {
                var hasher = new PasswordHasher();
                db.SystemUsers.Add(SystemUser.Create("admin", "管理员", hasher.Hash("admin123"), "Admin", "perf-admin", DateTime.UtcNow));
            }

            if (!db.SystemConfigs.Any())
            {
                db.SystemConfigs.Add(new SystemConfig
                {
                    Id = "perf-sc-001",
                    ConfigKey = "site.name",
                    ConfigValue = "AIMes Performance Test",
                    Description = "Performance test site name",
                    Category = "Performance",
                    UpdatedAt = DateTime.UtcNow,
                    UpdatedBy = "admin"
                });
            }

            db.SaveChanges();
            next(app);
        };
    }
}
