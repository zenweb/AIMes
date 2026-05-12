namespace MES.Domain.Entities.Scheduling;

public class SchedulingContextSnapshot
{
    public string WorkshopId { get; set; } = string.Empty;
    public DateTime SnapshotTime { get; set; }
    public DataCompletenessScore CompletenessScore { get; set; } = new();
    public List<WorkOrderSummary> WorkOrders { get; set; } = new();
    public List<BomRequirementSummary> BomRequirements { get; set; } = new();
    public List<RoutingSummary> Routings { get; set; } = new();
    public List<EquipmentCapacitySummary> EquipmentCapacities { get; set; } = new();
    public List<MaterialAvailabilitySummary> MaterialAvailabilities { get; set; } = new();
    public List<WipSummary> WipItems { get; set; } = new();
    public List<ExecutionStatusSummary> CurrentExecutions { get; set; } = new();

    /// <summary>第8子快照：设备间/材料间切换成本矩阵</summary>
    public List<ChangeoverEntry> ChangeoverMatrix { get; set; } = new();
}

public record WorkOrderSummary(string OrderNumber, string ProductCode, string ProductName,
    int PlannedQuantity, int CompletedQuantity, string Status, DateTime? PlannedStart, DateTime? PlannedEnd,
    string? RouteCode, int Priority, string WorkshopId);

public record BomRequirementSummary(string ProductCode, string MaterialCode, string MaterialName,
    decimal QuantityPerUnit, string Unit, decimal? LossRate);

public record RoutingSummary(string RouteCode, string RouteName, int StepCount,
    List<string> OperationCodes, double TotalLeadTimeMinutes);

public record EquipmentCapacitySummary(
    string EquipmentId,
    string EquipmentCode,
    string EquipmentName,
    string EquipmentType,
    string Status,
    double Capacity,
    double UtilizationRate)
{
    /// <summary>理论产能（设计产能，件/天）</summary>
    public double TheoreticalCapacity { get; init; }
    /// <summary>真实产能（基于历史执行数据修正，件/天）</summary>
    public double ActualCapacity { get; init; }
    /// <summary>预留产能（缓冲/插单预留，件/天）</summary>
    public double ReservedCapacity { get; init; }
    /// <summary>是否为瓶颈工序</summary>
    public bool IsBottleneck { get; init; }
    /// <summary>瓶颈类型（设备/人员/物料/工艺）</summary>
    public string? ConstraintType { get; init; }
    /// <summary>可用产能=实际产能-预留产能</summary>
    public double AvailableCapacity => ActualCapacity - ReservedCapacity;
}

public record MaterialAvailabilitySummary(string MaterialCode, string MaterialName,
    decimal AvailableQuantity, decimal ReservedQuantity, decimal? SafetyStock)
{
    /// <summary>库存快照更新时间</summary>
    public DateTime? LastUpdatedAt { get; init; }
    /// <summary>数据来源：WMS实时 / ERP延迟 / 人工</summary>
    public string? DataSource { get; init; }
}

public record WipSummary(string WorkOrderNumber, string OperationCode, int CompletedQuantity,
    int InProgressQuantity, int TotalQuantity);

public record ExecutionStatusSummary(string WorkOrderNumber, string OperationCode,
    string EquipmentId, string Status, DateTime? StartedAt, int CompletedQuantity, int PlannedQuantity);

/// <summary>切换成本矩阵条目</summary>
public record ChangeoverEntry(
    string FromMaterialCode,
    string ToMaterialCode,
    double SetupTimeMinutes,
    ChangeoverType ChangeoverType)
{
    public string? FromProductCode { get; init; }
    public string? ToProductCode { get; init; }
    public string? EquipmentType { get; init; }
}

/// <summary>切换类型</summary>
public enum ChangeoverType
{
    /// <summary>同材料连续生产，无需切换</summary>
    None,
    /// <summary>同材料不同颜色/规格，快速切换</summary>
    SameMaterial,
    /// <summary>同类型不同材料，标准切换</summary>
    SimilarMaterial,
    /// <summary>完全不同材料，需深度清机换模</summary>
    DifferentMaterial,
    /// <summary>首产/无历史数据，保守估计</summary>
    Unknown
}

public class DataCompletenessScore
{
    public int OverallScore { get; set; }
    public int WorkOrdersScore { get; set; }
    public int BomScore { get; set; }
    public int RoutingScore { get; set; }
    public int EquipmentScore { get; set; }
    public int MaterialScore { get; set; }
    public int WipScore { get; set; }
    public int ExecutionScore { get; set; }
    /// <summary>切换矩阵数据完整性评分</summary>
    public int ChangeoverScore { get; set; }
    public string Notes { get; set; } = string.Empty;
}
