using System.Security.Claims;
using System.Text.Encodings.Web;
using MES.Domain.Interfaces.Services;
using MES.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace MES.Tests.Integration;

public class TestWebApplicationFactory : WebApplicationFactory<Program>
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
                ["ConnectionStrings:DefaultConnection"] = "MES_Test_DB"
            });
        });

        builder.ConfigureServices(services =>
        {
            // 彻底移除 EF Core + Npgsql 服务，避免 Provider 冲突
            var toRemove = services
                .Where(d => d.ServiceType.Namespace?.StartsWith("Microsoft.EntityFrameworkCore") == true
                         || d.ImplementationType?.Namespace?.StartsWith("Microsoft.EntityFrameworkCore") == true
                         || d.ServiceType.FullName?.Contains("Npgsql") == true
                         || d.ImplementationType?.FullName?.Contains("Npgsql") == true)
                .ToList();
            foreach (var d in toRemove) services.Remove(d);

            // 显式注册 InMemory 服务，确保正确的 singleton 共享
            services.AddEntityFrameworkInMemoryDatabase();

            services.AddDbContext<MesDbContext>(options =>
            {
                options.UseInMemoryDatabase("MES_Test_DB");
            });

            // 移除后台服务
            var hostedServices = services
                .Where(d => d.ImplementationType?.Name == "MetricsBackgroundService")
                .ToList();
            foreach (var d in hostedServices) services.Remove(d);

            // MapHealthChecks 需要
            services.AddHealthChecks();

            var optimizationServices = services
                .Where(d => d.ServiceType == typeof(IScheduleOptimizationService))
                .ToList();
            foreach (var d in optimizationServices) services.Remove(d);
            services.AddSingleton<IScheduleOptimizationService, TestScheduleOptimizationService>();

            // 测试认证绕过
            services.AddAuthentication(TestAuthHandler.AuthenticationScheme)
                .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(
                    TestAuthHandler.AuthenticationScheme,
                    _ => { });
        });

        // 种子数据
        builder.ConfigureServices(services =>
        {
            services.AddTransient<IStartupFilter, TestDataSeedFilter>();
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

public sealed class TestScheduleOptimizationService : IScheduleOptimizationService
{
    public Task<ScheduleOptimizationResult> OptimizeAsync(ScheduleOptimizationRequest request, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();

        var now = DateTime.UtcNow;
        var equipment = request.Equipment.Count > 0
            ? request.Equipment
            : new List<ScheduleEquipmentInfo>
            {
                new("integration-equipment", "TEST-EQ", 100, "Integration")
            };
        var assignments = request.Orders
            .Select((order, index) =>
            {
                var start = now.AddHours(index * 2);
                return new ScheduleAssignmentData(
                    order.Id,
                    equipment[index % equipment.Count].Id,
                    start,
                    start.AddHours(1),
                    [],
                    request.OptimizationObjective ?? "integration",
                    0,
                    index == 0);
            })
            .ToList();
        var estimatedCompletion = assignments.Count > 0
            ? assignments.Max(item => item.EndTime)
            : now;

        return Task.FromResult(new ScheduleOptimizationResult(
            assignments,
            estimatedCompletion,
            0.85,
            0.9,
            0,
            assignments.Count > 0 ? 1 : 0,
            "Integration deterministic bottleneck",
            "Integration deterministic optimizer; external LLM is not used in integration tests.",
            [],
            []));
    }
}

public class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public const string AuthenticationScheme = "Test";
    public const string AnonymousHeader = "X-Test-Anonymous";

    public TestAuthHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder) : base(options, logger, encoder)
    {
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (Request.Headers.TryGetValue(AnonymousHeader, out var anonymousValues)
            && string.Equals(anonymousValues.ToString(), "true", StringComparison.OrdinalIgnoreCase))
        {
            return Task.FromResult(AuthenticateResult.NoResult());
        }

        var roles = Request.Headers.TryGetValue("X-Test-Role", out var roleValues)
            ? roleValues
                .SelectMany(value => value?.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries) ?? [])
                .ToArray()
            : ["Admin"];
        var userId = Request.Headers.TryGetValue("X-Test-User", out var userValues)
            ? userValues.ToString()
            : "test-user";
        var mustChangePassword = Request.Headers.TryGetValue("X-Test-Must-Change-Password", out var mustChangePasswordValues)
            ? mustChangePasswordValues.ToString()
            : "false";

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim(ClaimTypes.Name, "Integration Test User"),
            new Claim("must_change_password", mustChangePassword)
        };
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var identity = new ClaimsIdentity(claims, AuthenticationScheme);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, AuthenticationScheme);

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
