namespace MES.AI.Scheduling;

using MES.AI.Models;
using MES.Domain.Entities.Scheduling;

/// <summary>优先级规则</summary>
public enum PriorityRule
{
    /// <summary>交期最早优先 Earliest Due Date</summary>
    EDD,
    /// <summary>加工时间最短优先 Shortest Processing Time</summary>
    SPT,
    /// <summary>关键比率优先 Critical Ratio (DueDate-Now)/ProcessingTime</summary>
    CR,
    /// <summary>先到先服务 First Come First Served</summary>
    FCFS
}

/// <summary>设备选择策略</summary>
public enum CapacitySelectionStrategy
{
    /// <summary>最早可用设备</summary>
    EarliestAvailable,
    /// <summary>负载最轻设备</summary>
    LeastLoaded,
    /// <summary>最适设备（瓶颈优先 + 历史匹配）</summary>
    MostSuitable,
    /// <summary>换线成本最低</summary>
    LeastChangeoverCost
}

/// <summary>约束违反级别</summary>
public enum ConstraintViolationLevel { Error, Warning, Info }

/// <summary>单条约束违反记录</summary>
public class ConstraintViolation
{
    public string WorkOrderId { get; init; } = string.Empty;
    public string? EquipmentId { get; init; }
    public string Rule { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
    public ConstraintViolationLevel Level { get; init; }
}

/// <summary>约束验证结果</summary>
public class ConstraintValidationResult
{
    public bool IsValid => Violations.All(v => v.Level != ConstraintViolationLevel.Error);
    public List<ConstraintViolation> Violations { get; init; } = [];
}

/// <summary>规则引擎排产结果</summary>
public class RuleEngineResult
{
    public required List<ScheduleAssignment> Assignments { get; init; }
    public DateTime EstimatedCompletion { get; init; }
    public double UtilizationRate { get; init; }
    public double OnTimeDeliveryRate { get; init; }
    public double TotalChangeoverMinutes { get; init; }
    public int GroupCount { get; init; }
    public string? BottleneckInfo { get; init; }
    public ConstraintValidationResult Validation { get; init; } = new();
}

/// <summary>确定性排产规则引擎接口</summary>
public interface ISchedulingRuleEngine
{
    /// <summary>基于确定性规则生成初始排产方案</summary>
    Task<RuleEngineResult> GenerateInitialScheduleAsync(
        ScheduleRequest request,
        SchedulingContextSnapshot context,
        PriorityRule priorityRule = PriorityRule.EDD,
        CapacitySelectionStrategy capacityStrategy = CapacitySelectionStrategy.LeastLoaded,
        CancellationToken ct = default);
}
