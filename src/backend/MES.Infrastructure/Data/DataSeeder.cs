using MES.Domain.Entities.Admin;
using MES.Domain.Entities.Employee;
using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Inventory;
using MES.Domain.Entities.Production;
using Microsoft.EntityFrameworkCore;

namespace MES.Infrastructure.Data;

public static class DataSeeder
{
    public static void Seed(ModelBuilder modelBuilder)
    {
        // 种子设备
        modelBuilder.Entity<Equipment>().HasData(
            Equipment.Create("CNC-001", "CNC加工中心1号", "CNC", "ws-001", "精密加工车间", 100),
            Equipment.Create("CNC-002", "CNC加工中心2号", "CNC", "ws-001", "精密加工车间", 100));

        // 种子物料
        modelBuilder.Entity<Material>().HasData(
            Material.Create("AL-6061", "铝合金6061", "KG",
                safetyStock: 100, storageLocation: "A-01-01",
                materialType: "原材料", availableQuantity: 1000,
                id: "mat-001", createdAt: new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc))
        );

        // 种子员工
        var seedDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        modelBuilder.Entity<Employee>().HasData(
            Employee.Create("EMP-001", "张三", "Operator", team: "班组A", shift: "Day", phone: null, id: "emp-001", createdAt: seedDate),
            Employee.Create("EMP-002", "李四", "Engineer", team: "班组A", shift: "Day", id: "emp-002", createdAt: seedDate),
            Employee.Create("EMP-003", "王五", "Lead", team: "班组A", shift: "Day", id: "emp-003", createdAt: seedDate)
        );

        // 种子系统用户（密码均为 admin123，PBKDF2 SHA256 100000 迭代）
        modelBuilder.Entity<SystemUser>().HasData(
            SystemUser.Create("admin", "管理员", "AQEBAQEBAQEBAQEBAQEBAQ==.35cziqw/zb53O4jwCidrn9gy/20A7z7NkbVtQGd8EZo=", "Admin", id: "su-001", createdAt: seedDate),
            SystemUser.Create("operator1", "操作员1", "AQEBAQEBAQEBAQEBAQEBAQ==.35cziqw/zb53O4jwCidrn9gy/20A7z7NkbVtQGd8EZo=", "Operator", id: "su-002", createdAt: seedDate)
        );

        // 种子系统配置
        modelBuilder.Entity<SystemConfig>().HasData(
            new SystemConfig { Id = "sc-001", ConfigKey = "site.name", ConfigValue = "AIMes 制造执行系统", Description = "站点名称", Category = "基本设置", UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc), UpdatedBy = "admin" },
            new SystemConfig { Id = "sc-002", ConfigKey = "shift.morning.start", ConfigValue = "08:00", Description = "早班开始时间", Category = "排班设置", UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc), UpdatedBy = "admin" },
            new SystemConfig { Id = "sc-003", ConfigKey = "shift.morning.end", ConfigValue = "20:00", Description = "早班结束时间", Category = "排班设置", UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc), UpdatedBy = "admin" }
        );

        // 种子通知配置
        modelBuilder.Entity<NotificationConfig>().HasData(
            new NotificationConfig { Id = "nc-001", Category = "equipment", Label = "设备状态", Enabled = true, Description = "设备运行/故障/离线状态变更通知" },
            new NotificationConfig { Id = "nc-002", Category = "quality", Label = "质量预警", Enabled = true, Description = "质量检验不合格/SPC 超限预警" },
            new NotificationConfig { Id = "nc-003", Category = "production", Label = "生产进度", Enabled = true, Description = "工单进度更新通知" },
            new NotificationConfig { Id = "nc-004", Category = "anomaly", Label = "异常告警", Enabled = true, Description = "生产异常/设备异常告警" },
            new NotificationConfig { Id = "nc-005", Category = "inventory", Label = "库存变更", Enabled = true, Description = "物料入库/出库/调拨/调整通知" },
            new NotificationConfig { Id = "nc-006", Category = "purchase", Label = "采购状态", Enabled = true, Description = "采购单提交/确认/收货/取消通知" }
        );
    }
}
