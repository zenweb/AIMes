namespace MES.Domain.Entities.Scheduling;

/// <summary>
/// 排产方案人工采纳反馈 — 记录用户对 AI 排产方案的调整，用于持续改进
/// </summary>
public class ScheduleAdoptionFeedback
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string SchedulePlanId { get; set; } = string.Empty;
    public string WorkshopId { get; set; } = string.Empty;

    /// <summary>优化目标（due_date / utilization / changeover / balanced）</summary>
    public string OptimizationObjective { get; set; } = string.Empty;

    /// <summary>AI 建议的排产方案快照（JSON）</summary>
    public string OriginalAssignmentsJson { get; set; } = string.Empty;

    /// <summary>用户修改后的排产方案快照（JSON）</summary>
    public string ModifiedAssignmentsJson { get; set; } = string.Empty;

    /// <summary>修改原因分类</summary>
    public OverrideReasonCategory ReasonCategory { get; set; } = OverrideReasonCategory.Other;

    /// <summary>用户填写的修改原因</summary>
    public string? ReasonDetail { get; set; }

    /// <summary>被移动的工单 ID 列表（JSON）</summary>
    public string? MovedOrderIdsJson { get; set; }

    /// <summary>操作人用户名</summary>
    public string OperatorUser { get; set; } = string.Empty;

    /// <summary>AI 决策追踪 ID（关联 AiDecisionTraceEntity）</summary>
    public string? AiTraceId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public enum OverrideReasonCategory
{
    /// <summary>交期提前</summary>
    DueDateAdvanced,
    /// <summary>交期推迟</summary>
    DueDatePostponed,
    /// <summary>紧急插单</summary>
    UrgentInsertion,
    /// <summary>物料未齐套</summary>
    MaterialShortage,
    /// <summary>设备故障</summary>
    EquipmentFailure,
    /// <summary>产能不足</summary>
    CapacityInsufficient,
    /// <summary>人员缺勤</summary>
    StaffShortage,
    /// <summary>质量返工</summary>
    Rework,
    /// <summary>其他</summary>
    Other,
}
