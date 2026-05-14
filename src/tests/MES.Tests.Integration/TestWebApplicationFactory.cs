using System.Security.Claims;
using System.Text.Encodings.Web;
using MES.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace MES.Tests.Integration;

public class TestWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
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

public class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public const string AuthenticationScheme = "Test";

    public TestAuthHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder) : base(options, logger, encoder)
    {
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "test-user"),
            new Claim(ClaimTypes.Name, "Integration Test User"),
            new Claim(ClaimTypes.Role, "Admin")
        };
        var identity = new ClaimsIdentity(claims, AuthenticationScheme);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, AuthenticationScheme);

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
