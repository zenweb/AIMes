using MES.Api.Services;
using MES.Domain.Entities.Admin;
using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Production;
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

            if (!db.Equipment.Any())
            {
                db.Equipment.AddRange(
                    Equipment.Create("CNC-001", "CNC Machine 1", "CNC", "ws-001", "Workshop A", 100),
                    Equipment.Create("CNC-002", "CNC Machine 2", "CNC", "ws-001", "Workshop A", 80));
                db.SaveChanges();
            }

            if (!db.Materials.Any())
            {
                var aluminum = Material.Create(
                    "TEST-AL-001",
                    "测试铝合金",
                    "KG",
                    safetyStock: 50,
                    storageLocation: "A-01",
                    materialType: "原材料",
                    availableQuantity: 500,
                    id: "mat-test-1",
                    createdAt: DateTime.UtcNow);

                var steel = Material.Create(
                    "TEST-STEEL-001",
                    "测试钢材",
                    "KG",
                    safetyStock: 80,
                    storageLocation: "B-02",
                    materialType: "原材料",
                    availableQuantity: 100,
                    id: "mat-test-2",
                    createdAt: DateTime.UtcNow);
                steel.Reserve(30);

                db.Materials.AddRange(
                    aluminum,
                    steel);
                db.SaveChanges();
            }

            // 替换 HasData 种子用户，用 PasswordHasher 生成正确的密码哈希
            System.Console.WriteLine($"[TestDataSeedFilter] Users before: {db.SystemUsers.Count()}");
            System.Console.WriteLine($"[TestDataSeedFilter] Equipment before: {db.Equipment.Count()}");
            System.Console.WriteLine($"[TestDataSeedFilter] Materials before: {db.Materials.Count()}");

            var hasher = new PasswordHasher();

            var admin = db.SystemUsers.FirstOrDefault(u => u.Username == "admin");
            if (admin is null)
            {
                db.SystemUsers.Add(SystemUser.Create("admin", "管理员", hasher.Hash("admin123"), "Admin", "su-test-admin", DateTime.UtcNow));
            }

            var op = db.SystemUsers.FirstOrDefault(u => u.Username == "operator1");
            if (op is null)
            {
                db.SystemUsers.Add(SystemUser.Create("operator1", "操作员1", hasher.Hash("operator123"), "Operator", "su-test-operator", DateTime.UtcNow));
            }

            db.SaveChanges();
            System.Console.WriteLine($"[TestDataSeedFilter] Users after upsert: {db.SystemUsers.Count()}");

            if (!db.SystemConfigs.Any())
            {
                db.SystemConfigs.AddRange(
                    new SystemConfig
                    {
                        Id = "sc-test-001",
                        ConfigKey = "site.name",
                        ConfigValue = "AIMes 制造执行系统",
                        Description = "站点名称",
                        Category = "基本设置",
                        UpdatedAt = DateTime.UtcNow,
                        UpdatedBy = "admin"
                    },
                    new SystemConfig
                    {
                        Id = "sc-test-002",
                        ConfigKey = "shift.morning.start",
                        ConfigValue = "08:00",
                        Description = "早班开始时间",
                        Category = "排班设置",
                        UpdatedAt = DateTime.UtcNow,
                        UpdatedBy = "admin"
                    },
                    new SystemConfig
                    {
                        Id = "sc-test-003",
                        ConfigKey = "shift.morning.end",
                        ConfigValue = "20:00",
                        Description = "早班结束时间",
                        Category = "排班设置",
                        UpdatedAt = DateTime.UtcNow,
                        UpdatedBy = "admin"
                    });
                db.SaveChanges();
            }

            next(app);
        };
    }
}
