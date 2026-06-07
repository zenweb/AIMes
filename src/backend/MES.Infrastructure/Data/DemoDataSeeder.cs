using MES.Domain.Entities.Anomalies;
using MES.Domain.Entities.Bom;
using MES.Domain.Entities.Inventory;
using MES.Domain.Entities.Purchase;
using MES.Domain.Entities.Quality;
using MES.Domain.Entities.Routing;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Enums;
using MES.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace MES.Infrastructure.Data;

public static class DemoDataSeeder
{
    public static async Task SeedAsync(MesDbContext db, CancellationToken ct = default)
    {
        await SeedMaterialsAsync(db, ct);
        await db.SaveChangesAsync(ct);
        await SeedWorkOrdersAsync(db, ct);
        await db.SaveChangesAsync(ct);
        await SeedQualityAsync(db, ct);
        await db.SaveChangesAsync(ct);
        await SeedBomAsync(db, ct);
        await db.SaveChangesAsync(ct);
        await SeedRoutingAsync(db, ct);
        await db.SaveChangesAsync(ct);
        await SeedAnomaliesAsync(db, ct);
        await db.SaveChangesAsync(ct);
        await SeedPurchaseOrdersAsync(db, ct);
        await db.SaveChangesAsync(ct);
        await SeedInventoryTransactionsAsync(db, ct);
        await db.SaveChangesAsync(ct);
        await SeedScheduleAsync(db, ct);
        await db.SaveChangesAsync(ct);
    }

    private static async Task SeedMaterialsAsync(MesDbContext db, CancellationToken ct)
    {
        var existing = await db.Materials.Select(m => m.MaterialCode).ToListAsync(ct);
        var materials = new[]
        {
            ("MAT-A01", "轴承钢圈", "个", 120, 20, "A-01-02", "半成品"),
            ("MAT-A02", "滚珠 φ8mm", "颗", 800, 200, "A-01-03", "标准件"),
            ("MAT-A03", "保持架", "个", 160, 30, "A-01-04", "半成品"),
            ("MAT-A04", "密封圈", "个", 320, 80, "A-02-01", "标准件"),
            ("MAT-A05", "润滑脂", "kg", 60, 15, "C-01-01", "辅料"),
            ("MAT-B01", "轴坯 45#钢", "根", 90, 15, "B-01-01", "原材料"),
            ("MAT-B02", "花键套", "个", 70, 20, "B-01-02", "半成品"),
            ("MAT-C01", "阀体铸件", "件", 55, 10, "B-02-01", "毛坯"),
            ("MAT-C02", "阀芯组件", "套", 45, 8, "B-02-02", "半成品"),
            ("MAT-C03", "密封垫", "个", 300, 60, "A-02-02", "标准件"),
        };

        foreach (var (code, name, unit, available, safety, location, type) in materials)
        {
            if (!existing.Contains(code))
            {
                db.Materials.Add(Domain.Entities.Production.Material.Create(
                    code, name, unit, safety, location, type, available));
            }
        }
    }

    private static async Task SeedWorkOrdersAsync(MesDbContext db, CancellationToken ct)
    {
        if (await db.WorkOrders.AnyAsync(ct)) return;

        var today = DateTime.UtcNow.Date;
        db.WorkOrders.AddRange(
            Domain.Entities.Production.WorkOrder.Create("WO-20260518-001", "PROD-A1", "精密轴承组件 A", 120, today.AddHours(8), today.AddHours(16), "ws-001", 1, "R-A100"),
            Domain.Entities.Production.WorkOrder.Create("WO-20260518-002", "PROD-B1", "传动轴总成 B", 80, today.AddHours(9), today.AddDays(1).AddHours(12), "ws-001", 2, "R-B200"),
            Domain.Entities.Production.WorkOrder.Create("WO-20260518-003", "PROD-C1", "液压阀体 C", 60, today.AddHours(10), today.AddDays(1).AddHours(18), "ws-001", 3, "R-C300"),
            Domain.Entities.Production.WorkOrder.Create("WO-20260518-004", "PROD-A1", "精密轴承组件 A", 150, today.AddDays(1).AddHours(8), today.AddDays(2).AddHours(16), "ws-001", 2, "R-A100")
        );
    }

    private static async Task SeedQualityAsync(MesDbContext db, CancellationToken ct)
    {
        if (await db.QualityInspections.AnyAsync(ct)) return;

        db.QualityInspections.AddRange(
            QualityInspection.Create("WO-20260518-001", "PROD-A1", "CNC精加工", "尺寸检验", 50, 49, 1, "EMP-002", InspectionResult.Pass),
            QualityInspection.Create("WO-20260518-002", "PROD-B1", "热处理", "硬度检测", 40, 37, 3, "EMP-002", InspectionResult.Rework),
            QualityInspection.Create("WO-20260518-003", "PROD-C1", "压力测试", "密封性检验", 30, 28, 2, "EMP-003", InspectionResult.Fail),
            QualityInspection.Create("WO-20260518-004", "PROD-A1", "最终检验", "外观检验", 60, 60, 0, "EMP-002", InspectionResult.Pass)
        );
    }

    private static async Task SeedBomAsync(MesDbContext db, CancellationToken ct)
    {
        if (await db.BillsOfMaterial.AnyAsync(ct)) return;

        var a = new BillOfMaterial("BOM-A100", "精密轴承组件 A 物料清单", new ProductCode("PROD-A1"), "精密轴承组件 A", BomType.Manufacturing, "V1.0");
        a.AddItem(new BomItem(new MaterialCode("MAT-A01"), "轴承钢圈", 2, "个", 1, 0.02m, 5, "装配前"));
        a.AddItem(new BomItem(new MaterialCode("MAT-A02"), "滚珠 φ8mm", 12, "颗", 2, 0.05m, 3, "装配"));
        a.AddItem(new BomItem(new MaterialCode("MAT-A03"), "保持架", 1, "个", 3, null, 2, "装配"));
        a.AddItem(new BomItem(new MaterialCode("MAT-A04"), "密封圈", 2, "个", 4, 0.01m, 7, "装配后"));
        a.AddItem(new BomItem(new MaterialCode("MAT-A05"), "润滑脂", 0.5m, "kg", 5, 0.03m, 10, "包装前"));
        a.Release(DateTime.UtcNow.Date.AddDays(-30), "admin");

        var b = new BillOfMaterial("BOM-B200", "传动轴总成 B 物料清单", new ProductCode("PROD-B1"), "传动轴总成 B", BomType.Manufacturing, "V2.1");
        var shaft = new BomItem(new MaterialCode("MAT-B01"), "轴坯 45#钢", 1, "根", 1, 0.03m, 7, "车削前");
        shaft.AddChild(new BomItem(new MaterialCode("AL-6061"), "铝合金6061", 1.2m, "KG", 1, 0.05m, 3, "下料"));
        b.AddItem(shaft);
        b.AddItem(new BomItem(new MaterialCode("MAT-B02"), "花键套", 1, "个", 2, null, 5, "装配"));
        b.Release(DateTime.UtcNow.Date.AddDays(-15), "admin");

        var c = new BillOfMaterial("BOM-C300", "液压阀体 C 物料清单", new ProductCode("PROD-C1"), "液压阀体 C", BomType.Manufacturing, "V1.2");
        c.AddItem(new BomItem(new MaterialCode("MAT-C01"), "阀体铸件", 1, "件", 1, 0.04m, 10, "加工前"));
        c.AddItem(new BomItem(new MaterialCode("MAT-C02"), "阀芯组件", 1, "套", 2, 0.02m, 7, "装配"));
        c.AddItem(new BomItem(new MaterialCode("MAT-C03"), "密封垫", 4, "个", 3, 0.01m, 3, "装配"));

        db.BillsOfMaterial.AddRange(a, b, c);
    }

    private static async Task SeedRoutingAsync(MesDbContext db, CancellationToken ct)
    {
        if (await db.ProcessRoutes.AnyAsync(ct)) return;

        var routeA = new ProcessRoute("R-A100", "精密轴承组件工艺路线", new ProductCode("PROD-A1"), "精密轴承组件 A", "V1.0");
        routeA.AddStep(new RoutingStep(1, new OperationCode("OP-010"), "来料检验", "质检台"));
        routeA.AddStep(new RoutingStep(2, new OperationCode("OP-020"), "车削加工", "CNC车床"));
        routeA.AddStep(new RoutingStep(3, new OperationCode("OP-030"), "装配", "装配台"));
        routeA.AddStep(new RoutingStep(4, new OperationCode("OP-040"), "最终检验", "质检台"));

        var routeB = new ProcessRoute("R-B200", "传动轴总成工艺路线", new ProductCode("PROD-B1"), "传动轴总成 B", "V2.1");
        routeB.AddStep(new RoutingStep(1, new OperationCode("OP-050"), "下料", "锯床"));
        routeB.AddStep(new RoutingStep(2, new OperationCode("OP-060"), "粗车", "CNC车床"));
        routeB.AddStep(new RoutingStep(3, new OperationCode("OP-070"), "精车", "CNC车床"));
        routeB.AddStep(new RoutingStep(4, new OperationCode("OP-080"), "铣键槽", "加工中心"));
        routeB.AddStep(new RoutingStep(5, new OperationCode("OP-090"), "热处理", "热处理炉"));
        routeB.AddStep(new RoutingStep(6, new OperationCode("OP-100"), "终检打包", "包装台"));

        var routeC = new ProcessRoute("R-C300", "液压阀体 C 工艺路线", new ProductCode("PROD-C1"), "液压阀体 C", "V1.0");
        routeC.AddStep(new RoutingStep(1, new OperationCode("OP-110"), "铸造毛坯检验", "质检台"));
        routeC.AddStep(new RoutingStep(2, new OperationCode("OP-120"), "铣面", "加工中心"));
        routeC.AddStep(new RoutingStep(3, new OperationCode("OP-130"), "钻孔攻丝", "加工中心"));
        routeC.AddStep(new RoutingStep(4, new OperationCode("OP-140"), "去毛刺清洗", "清洗台"));
        routeC.AddStep(new RoutingStep(5, new OperationCode("OP-150"), "压力测试", "测试台"));

        db.ProcessRoutes.AddRange(routeA, routeB, routeC);
    }

    private static async Task SeedAnomaliesAsync(MesDbContext db, CancellationToken ct)
    {
        if (await db.ProductionAnomalies.AnyAsync(ct)) return;

        var cnc = await db.Equipment.OrderBy(e => e.EquipmentCode).Select(e => e.Id).FirstOrDefaultAsync(ct);
        var a1 = new ProductionAnomaly(
            new WorkOrderNumber("WO-20260518-001"),
            new OperationCode("OP-020"),
            "equipment",
            AnomalySeverity.Critical,
            "CNC 主轴温升异常",
            "主轴温度持续超过 75°C，需要停机检查冷却液循环和主轴轴承状态。",
            cnc,
            "operator1");
        a1.AddResponse(new AnomalyResponse(
            AnomalyResponseType.AiSuggestion,
            "设备异常处置建议",
            "立即停机，检查冷却液流量、过滤器堵塞和主轴轴承温度。",
            "AI Agent"));

        var a2 = new ProductionAnomaly(
            new WorkOrderNumber("WO-20260518-002"),
            new OperationCode("OP-090"),
            "quality",
            AnomalySeverity.High,
            "热处理硬度波动",
            "抽检硬度低于下限，建议隔离同炉批次并复核热处理曲线。",
            null,
            "EMP-002");

        var a3 = new ProductionAnomaly(
            new WorkOrderNumber("WO-20260518-003"),
            new OperationCode("OP-150"),
            "process",
            AnomalySeverity.Medium,
            "压力测试泄漏率偏高",
            "液压阀体压力保持阶段泄漏率超过工艺警戒线。",
            null,
            "EMP-003");
        a3.Resolve("密封垫批次尺寸偏差", "隔离异常批次，切换合格批次后复测通过。", "EMP-002");

        db.ProductionAnomalies.AddRange(a1, a2, a3);
    }

    private static async Task SeedInventoryTransactionsAsync(MesDbContext db, CancellationToken ct)
    {
        if (await db.StockTransactions.AnyAsync(ct)) return;

        var materials = await db.Materials
            .Where(m => new[] { "MAT-A01", "MAT-A02", "MAT-B01", "MAT-C01" }.Contains(m.MaterialCode))
            .ToListAsync(ct);

        foreach (var material in materials)
        {
            db.StockTransactions.Add(new StockTransaction
            {
                MaterialCode = material.MaterialCode,
                MaterialName = material.MaterialName,
                TransactionType = TransactionType.StockIn,
                Quantity = material.AvailableQuantity,
                BalanceBefore = 0,
                BalanceAfter = material.AvailableQuantity,
                ReferenceType = "DemoSeed",
                ReferenceNumber = $"INIT-{material.MaterialCode}",
                Warehouse = "主仓库",
                Location = material.StorageLocation,
                Operator = "admin",
                Remark = "演示期初入库",
                CreatedAt = DateTime.UtcNow.Date.AddHours(8)
            });
        }

        db.StockTransactions.Add(new StockTransaction
        {
            MaterialCode = "MAT-A02",
            MaterialName = "滚珠 φ8mm",
            TransactionType = TransactionType.StockOut,
            Quantity = 120,
            BalanceBefore = 920,
            BalanceAfter = 800,
            ReferenceType = "WorkOrder",
            ReferenceNumber = "WO-20260518-001",
            Operator = "operator1",
            Remark = "演示生产领料",
            CreatedAt = DateTime.UtcNow.Date.AddHours(10)
        });
    }

    private static async Task SeedPurchaseOrdersAsync(MesDbContext db, CancellationToken ct)
    {
        if (await db.PurchaseOrders.AnyAsync(ct)) return;

        var po1 = new PurchaseOrder("PO-20260518-001", "苏州精密材料有限公司", "王经理 13800000001", DateTime.UtcNow.Date.AddDays(3), "演示采购：轴承组件原料补货", "admin");
        po1.AddItem(new PurchaseOrderLineItem
        {
            MaterialCode = "MAT-A01",
            MaterialName = "轴承钢圈",
            Unit = "个",
            Quantity = 500,
            UnitPrice = 18.5m,
            ExpectedDate = DateTime.UtcNow.Date.AddDays(3),
            Remark = "A 线补料"
        });
        po1.AddItem(new PurchaseOrderLineItem
        {
            MaterialCode = "MAT-A04",
            MaterialName = "密封圈",
            Unit = "个",
            Quantity = 1000,
            UnitPrice = 1.2m,
            ExpectedDate = DateTime.UtcNow.Date.AddDays(3)
        });
        po1.Submit();
        po1.Confirm();

        var po2 = new PurchaseOrder("PO-20260518-002", "无锡热处理耗材厂", "李经理 13800000002", DateTime.UtcNow.Date.AddDays(5), "演示采购：传动轴辅料", "admin");
        po2.AddItem(new PurchaseOrderLineItem
        {
            MaterialCode = "MAT-B01",
            MaterialName = "轴坯 45#钢",
            Unit = "根",
            Quantity = 200,
            UnitPrice = 42m,
            ExpectedDate = DateTime.UtcNow.Date.AddDays(5)
        });
        po2.Submit();

        db.PurchaseOrders.AddRange(po1, po2);
    }

    private static async Task SeedScheduleAsync(MesDbContext db, CancellationToken ct)
    {
        if (await db.SchedulePlans.AnyAsync(ct)) return;

        var orders = await db.WorkOrders.OrderBy(w => w.OrderNumber).Take(3).ToListAsync(ct);
        var equipment = await db.Equipment.OrderBy(e => e.EquipmentCode).Take(2).ToListAsync(ct);
        if (orders.Count == 0 || equipment.Count == 0) return;

        var start = DateTime.UtcNow.Date.AddHours(8);
        var plan = SchedulePlan.Create("演示排产计划", start, start.AddHours(10));
        for (var i = 0; i < orders.Count; i++)
        {
            plan.AddItem(ScheduleItem.Create(
                orders[i].Id,
                equipment[i % equipment.Count].Id,
                start.AddHours(i * 2),
                start.AddHours(i * 2 + 1.5),
                i + 1,
                i == 0 ? "首件准备 15min" : "换型 10min"));
        }
        plan.UpdateMetrics(82.5, 96.0, "演示数据：EDD + 最小负载策略");
        db.SchedulePlans.Add(plan);
    }
}
