using MES.Application.DTOs;

namespace MES.Application.Services;

public interface IRiskAppService
{
    Task<RiskDashboardDto> GetRiskDashboardAsync(CancellationToken ct = default);
}

public class RiskAppService : IRiskAppService
{
    public Task<RiskDashboardDto> GetRiskDashboardAsync(CancellationToken ct = default)
    {
        var now = DateTime.Now;
        var dashboard = new RiskDashboardDto
        {
            GeneratedAt = now,
            OrderRisks =
            [
                new() { Id = "1", OrderNumber = "WO-2026-0042", ProductName = "精密转接座", Progress = 35, DueDate = now.AddDays(2).ToString("yyyy-MM-dd"), GapText = "滞后2天", Level = "critical", RiskDetail = "CNC-001 故障导致停工8小时，预计延期2天" },
                new() { Id = "2", OrderNumber = "WO-2026-0045", ProductName = "壳体组件A型", Progress = 60, DueDate = now.AddDays(3).ToString("yyyy-MM-dd"), GapText = "滞后1天", Level = "warning", RiskDetail = "前道工序未完成，物料未齐套" },
                new() { Id = "3", OrderNumber = "WO-2026-0048", ProductName = "传动轴总成", Progress = 80, DueDate = now.AddDays(4).ToString("yyyy-MM-dd"), GapText = "进度正常", Level = "healthy", RiskDetail = "按计划推进中" },
                new() { Id = "4", OrderNumber = "WO-2026-0039", ProductName = "液压阀体", Progress = 10, DueDate = now.AddDays(1).ToString("yyyy-MM-dd"), GapText = "滞后3天", Level = "critical", RiskDetail = "来料检验不合格，需重新采购" },
                new() { Id = "5", OrderNumber = "WO-2026-0050", ProductName = "法兰盘DN100", Progress = 50, DueDate = now.AddDays(5).ToString("yyyy-MM-dd"), GapText = "进度正常", Level = "healthy", RiskDetail = "按计划推进中" },
                new() { Id = "6", OrderNumber = "WO-2026-0041", ProductName = "轴承座总成", Progress = 45, DueDate = now.AddDays(2).ToString("yyyy-MM-dd"), GapText = "滞后1天", Level = "warning", RiskDetail = "CNC-003 排队积压，排程等待中" },
            ],
            EquipmentRisks =
            [
                new() { Id = "EQ-001", EquipmentName = "CNC-001 加工中心", Type = "CNC", HealthScore = 32, LastMaintenance = now.AddDays(-32).ToString("yyyy-MM-dd"), DaysSinceMaintenance = 32, Level = "critical", RiskDetail = "主轴振动异常（+47%），建议本周检修" },
                new() { Id = "EQ-005", EquipmentName = "注塑机-2号", Type = "注塑", HealthScore = 55, LastMaintenance = now.AddDays(-48).ToString("yyyy-MM-dd"), DaysSinceMaintenance = 48, Level = "warning", RiskDetail = "液压油温度偏高，已超保养周期18天" },
                new() { Id = "EQ-008", EquipmentName = "热处理炉", Type = "热处理", HealthScore = 78, LastMaintenance = now.AddDays(-14).ToString("yyyy-MM-dd"), DaysSinceMaintenance = 14, Level = "healthy", RiskDetail = "运行正常，下次保养剩余16天" },
                new() { Id = "EQ-003", EquipmentName = "CNC-003 加工中心", Type = "CNC", HealthScore = 45, LastMaintenance = now.AddDays(-37).ToString("yyyy-MM-dd"), DaysSinceMaintenance = 37, Level = "warning", RiskDetail = "冷却液位偏低，刀库换刀异响" },
            ],
            MaterialRisks =
            [
                new() { Code = "AL-6061", MaterialName = "铝合金6061", MaterialCode = "AL-6061", Available = 45, Required = 200, StockPercent = 22, AffectedOrders = "影响3个工单", Level = "critical", RiskDetail = "供应商交期延误5天，建议紧急调拨" },
                new() { Code = "OIL-HM46", MaterialName = "抗磨液压油", MaterialCode = "OIL-HM46", Available = 35, Required = 50, StockPercent = 70, AffectedOrders = "设备维护用", Level = "warning", RiskDetail = "库存低于安全库存线，建议本周补货" },
                new() { Code = "BRG-6205", MaterialName = "6205轴承", MaterialCode = "BRG-6205", Available = 85, Required = 100, StockPercent = 85, AffectedOrders = "装配线备用", Level = "healthy", RiskDetail = "库存充足，可维持正常生产" },
            ],
            BottleneckRisks =
            [
                new() { Id = "BN-01", EquipmentName = "热处理炉", Type = "热处理", Utilization = 95, QueueOrders = 4, QueueHours = 16, Level = "critical", RiskDetail = "唯一热处理设备，超负荷运行，建议评估外协" },
                new() { Id = "BN-02", EquipmentName = "CNC-001 加工中心", Type = "CNC", Utilization = 88, QueueOrders = 3, QueueHours = 8, Level = "warning", RiskDetail = "关键工序设备，即将满负荷运转" },
                new() { Id = "BN-03", EquipmentName = "装配线-1号", Type = "装配", Utilization = 72, QueueOrders = 2, QueueHours = 4, Level = "healthy", RiskDetail = "产能充足，可承接更多订单" },
            ],
        };

        ComputeCounts(dashboard);
        return Task.FromResult(dashboard);
    }

    private static void ComputeCounts(RiskDashboardDto dashboard)
    {
        var all = new List<string>();
        all.AddRange(dashboard.OrderRisks.Select(r => r.Level));
        all.AddRange(dashboard.EquipmentRisks.Select(r => r.Level));
        all.AddRange(dashboard.MaterialRisks.Select(r => r.Level));
        all.AddRange(dashboard.BottleneckRisks.Select(r => r.Level));

        dashboard.Counts.Critical = all.Count(l => l == "critical");
        dashboard.Counts.Warning = all.Count(l => l == "warning");
        dashboard.Counts.Healthy = all.Count(l => l == "healthy");
        dashboard.Counts.Total = all.Count;
    }
}
