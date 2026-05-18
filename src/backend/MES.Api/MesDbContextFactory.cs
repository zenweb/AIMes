using MES.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace MES.Api;

/// <summary>
/// EF Core 设计时工厂 — dotnet ef migrations 自动发现此类。
/// 仅供 dotnet ef CLI 使用（migration / scaffold），不参与运行时 DI。
/// </summary>
public class MesDbContextFactory : IDesignTimeDbContextFactory<MesDbContext>
{
    public MesDbContext CreateDbContext(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        var provider = DatabaseProvider.Resolve(builder.Configuration["Database:Provider"]);
        Environment.SetEnvironmentVariable("AIMES_DATABASE_PROVIDER", provider);

        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "ConnectionStrings:DefaultConnection is required for EF migrations. " +
                "Set it via environment variable ConnectionStrings__DefaultConnection " +
                "before running `dotnet ef ...`.");
        }

        var optionsBuilder = new DbContextOptionsBuilder<MesDbContext>();
        if (DatabaseProvider.IsSqlServer(provider))
        {
            optionsBuilder.UseSqlServer(connectionString, sqlServerOptions => sqlServerOptions.UseCompatibilityLevel(130));
        }
        else
        {
            optionsBuilder.UseNpgsql(connectionString);
        }

        return new MesDbContext(optionsBuilder.Options);
    }
}
