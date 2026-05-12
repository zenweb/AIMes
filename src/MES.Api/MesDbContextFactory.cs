using MES.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace MES.Api;

/// <summary>
/// EF Core 设计时工厂 — dotnet ef migrations 自动发现此类
/// </summary>
public class MesDbContextFactory : IDesignTimeDbContextFactory<MesDbContext>
{
    public MesDbContext CreateDbContext(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
            ?? "Host=localhost;Database=mes;Username=postgres;Password=postgres";

        var optionsBuilder = new DbContextOptionsBuilder<MesDbContext>();
        optionsBuilder.UseNpgsql(connectionString);
        return new MesDbContext(optionsBuilder.Options);
    }
}