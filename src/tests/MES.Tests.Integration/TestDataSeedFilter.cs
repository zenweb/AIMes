using MES.Api.Services;
using MES.Domain.Entities.Admin;
using MES.Domain.Entities.Equipment;
using MES.Infrastructure.Data;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;

namespace MES.Tests.Integration;

public class TestDataSeedFilter : IStartupFilter
{
    public Action<IApplicationBuilder> Configure(Action<IApplicationBuilder> next)
    {
        return app =>
        {
            using var scope = app.ApplicationServices.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<MesDbContext>();
            db.Database.EnsureCreated();

            if (!db.Equipment.Any())
            {
                db.Equipment.AddRange(
                    Equipment.Create("CNC-001", "CNC Machine 1", "CNC", "ws-001", "Workshop A", 100),
                    Equipment.Create("CNC-002", "CNC Machine 2", "CNC", "ws-001", "Workshop A", 80));
                db.SaveChanges();
            }

            if (!db.Materials.Any())
            {
                db.Materials.AddRange(
                    new MES.Domain.Entities.Production.Material
                    {
                        Id = "mat-test-1",
                        MaterialCode = "TEST-AL-001",
                        MaterialName = "测试铝合金",
                        MaterialType = "原材料",
                        Unit = "KG",
                        AvailableQuantity = 500,
                        ReservedQuantity = 0,
                        SafetyStock = 50,
                        StorageLocation = "A-01",
                        CreatedAt = DateTime.UtcNow
                    },
                    new MES.Domain.Entities.Production.Material
                    {
                        Id = "mat-test-2",
                        MaterialCode = "TEST-STEEL-001",
                        MaterialName = "测试钢材",
                        MaterialType = "原材料",
                        Unit = "KG",
                        AvailableQuantity = 100,
                        ReservedQuantity = 30,
                        SafetyStock = 80,
                        StorageLocation = "B-02",
                        CreatedAt = DateTime.UtcNow
                    }
                );
                db.SaveChanges();
            }

            // 替换 HasData 种子用户，用 PasswordHasher 生成正确的密码哈希
            System.Console.WriteLine($"[TestDataSeedFilter] Users before: {db.SystemUsers.Count()}");
            System.Console.WriteLine($"[TestDataSeedFilter] Equipment before: {db.Equipment.Count()}");
            System.Console.WriteLine($"[TestDataSeedFilter] Materials before: {db.Materials.Count()}");

            var hasher = new PasswordHasher();

            var admin = db.SystemUsers.FirstOrDefault(u => u.Username == "admin");
            if (admin is not null)
            {
                admin.ChangePassword(hasher.Hash("admin123"));
            }
            else
            {
                db.SystemUsers.Add(SystemUser.Create("admin", "管理员", hasher.Hash("admin123"), "Admin", "su-test-admin", DateTime.UtcNow));
            }

            var op = db.SystemUsers.FirstOrDefault(u => u.Username == "operator1");
            if (op is not null)
            {
                op.ChangePassword(hasher.Hash("operator123"));
            }
            else
            {
                db.SystemUsers.Add(SystemUser.Create("operator1", "操作员1", hasher.Hash("operator123"), "Operator", "su-test-operator", DateTime.UtcNow));
            }

            db.SaveChanges();
            System.Console.WriteLine($"[TestDataSeedFilter] Users after upsert: {db.SystemUsers.Count()}");

            next(app);
        };
    }
}
