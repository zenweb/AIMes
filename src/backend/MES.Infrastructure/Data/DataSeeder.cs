using MES.Domain.Entities.Admin;
using MES.Domain.Entities.Employee;
using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Inventory;
using MES.Domain.Entities.Production;
using MES.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace MES.Infrastructure.Data;

public static class DataSeeder
{
    public static void Seed(ModelBuilder modelBuilder)
    {
        // 种子设备
        modelBuilder.Entity<Equipment>().HasData(
            new
            {
                Id = "eq-001",
                EquipmentCode = "CNC-001",
                EquipmentName = "CNC加工中心1号",
                EquipmentType = "CNC",
                WorkshopId = "ws-001",
                WorkshopName = "精密加工车间",
                Status = EquipmentStatus.Available,
                Capacity = 100.0,
                UtilizationRate = 0.0,
                LastMaintenanceDate = (DateTime?)null,
                NextMaintenanceDate = (DateTime?)null,
                CurrentWorkOrderId = string.Empty,
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = (DateTime?)null,
                version = 0u
            },
            new
            {
                Id = "eq-002",
                EquipmentCode = "CNC-002",
                EquipmentName = "CNC加工中心2号",
                EquipmentType = "CNC",
                WorkshopId = "ws-001",
                WorkshopName = "精密加工车间",
                Status = EquipmentStatus.Available,
                Capacity = 100.0,
                UtilizationRate = 0.0,
                LastMaintenanceDate = (DateTime?)null,
                NextMaintenanceDate = (DateTime?)null,
                CurrentWorkOrderId = string.Empty,
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = (DateTime?)null,
                version = 0u
            });

        // 种子物料
        modelBuilder.Entity<Material>().HasData(
            new
            {
                Id = "mat-001",
                MaterialCode = "AL-6061",
                MaterialName = "铝合金6061",
                Unit = "KG",
                MaterialType = "原材料",
                AvailableQuantity = 1000,
                ReservedQuantity = 0,
                SafetyStock = 100,
                StorageLocation = "A-01-01",
                ExpiryDate = (DateTime?)null,
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = (DateTime?)null,
                version = 0u
            }
        );

        // 种子员工
        var seedDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        modelBuilder.Entity<Employee>().HasData(
            Employee.Create("EMP-001", "张三", "Operator", team: "班组A", shift: "Day", phone: null, id: "emp-001", createdAt: seedDate),
            Employee.Create("EMP-002", "李四", "Engineer", team: "班组A", shift: "Day", id: "emp-002", createdAt: seedDate),
            Employee.Create("EMP-003", "王五", "Lead", team: "班组A", shift: "Day", id: "emp-003", createdAt: seedDate)
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
