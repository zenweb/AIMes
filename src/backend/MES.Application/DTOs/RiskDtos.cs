namespace MES.Application.DTOs;

public class RiskDashboardDto
{
    public RiskCountsDto Counts { get; set; } = new();
    public List<OrderRiskDto> OrderRisks { get; set; } = new();
    public List<EquipmentRiskDto> EquipmentRisks { get; set; } = new();
    public List<MaterialRiskDto> MaterialRisks { get; set; } = new();
    public List<BottleneckRiskDto> BottleneckRisks { get; set; } = new();
    public DateTime GeneratedAt { get; set; }
    /// <summary>
    /// 当前 RiskBoard 是否仍以演示数据返回（v0.1 真实风险计算未接通）。
    /// 前端依据此标志显示「演示数据」横幅，避免评估人误把示例数据当真实运营状态。
    /// </summary>
    public bool IsDemoData { get; set; }
}

public class RiskCountsDto
{
    public int Critical { get; set; }
    public int Warning { get; set; }
    public int Healthy { get; set; }
    public int Total { get; set; }
}

public class OrderRiskDto
{
    public string Id { get; set; } = string.Empty;
    public string OrderNumber { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int Progress { get; set; }
    public string DueDate { get; set; } = string.Empty;
    public string GapText { get; set; } = string.Empty;
    public string Level { get; set; } = "healthy";
    public string RiskDetail { get; set; } = string.Empty;
}

public class EquipmentRiskDto
{
    public string Id { get; set; } = string.Empty;
    public string EquipmentName { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public int HealthScore { get; set; }
    public string LastMaintenance { get; set; } = string.Empty;
    public int DaysSinceMaintenance { get; set; }
    public string Level { get; set; } = "healthy";
    public string RiskDetail { get; set; } = string.Empty;
}

public class MaterialRiskDto
{
    public string Code { get; set; } = string.Empty;
    public string MaterialName { get; set; } = string.Empty;
    public string MaterialCode { get; set; } = string.Empty;
    public int Available { get; set; }
    public int Required { get; set; }
    public int StockPercent { get; set; }
    public string AffectedOrders { get; set; } = string.Empty;
    public string Level { get; set; } = "healthy";
    public string RiskDetail { get; set; } = string.Empty;
}

public class BottleneckRiskDto
{
    public string Id { get; set; } = string.Empty;
    public string EquipmentName { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public int Utilization { get; set; }
    public int QueueOrders { get; set; }
    public int QueueHours { get; set; }
    public string Level { get; set; } = "healthy";
    public string RiskDetail { get; set; } = string.Empty;
}
