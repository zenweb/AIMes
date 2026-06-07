namespace MES.Domain.Authorization;

/// <summary>
/// V1.5 Agent 写动作类型分类。
/// 与 `_docs/_design/20260524-v15-agent-permission-policy.md` 动作分级对齐。
/// </summary>
public enum AgentActionType
{
    /// <summary>采纳排产 Agent 推荐方案</summary>
    AdoptScheduling,
    /// <summary>拒绝排产 Agent 推荐方案</summary>
    RejectScheduling,
    /// <summary>执行质量处置（隔离批次、放行、返工等）</summary>
    ExecuteQualityDisposition,
    /// <summary>执行采购动作（加急、替代供应商、收货确认等）</summary>
    ExecutePurchaseAction,
    /// <summary>执行维护动作（标记停机、维护窗口、维修工单等）</summary>
    ExecuteMaintenanceAction,
}

/// <summary>
/// V1.5 Agent 权限矩阵。集中实现"AI 能建议，但不能越权执行"原则。
/// 角色矩阵：
/// <list type="bullet">
/// <item>Admin: 全允许</item>
/// <item>Planner: AdoptScheduling, RejectScheduling</item>
/// <item>Quality: ExecuteQualityDisposition</item>
/// <item>Purchase: ExecutePurchaseAction</item>
/// <item>Maintenance: ExecuteMaintenanceAction</item>
/// <item>Operator: 全拒绝（仅可查看）</item>
/// </list>
/// </summary>
public static class AgentPermissionPolicy
{
    /// <summary>
    /// 判定角色是否可执行指定 Agent 动作。
    /// </summary>
    public static bool CanExecute(string? role, AgentActionType action)
    {
        if (string.IsNullOrWhiteSpace(role))
            return false;

        if (string.Equals(role, Roles.Admin, System.StringComparison.OrdinalIgnoreCase))
            return true;

        return action switch
        {
            AgentActionType.AdoptScheduling or AgentActionType.RejectScheduling
                => string.Equals(role, Roles.Planner, System.StringComparison.OrdinalIgnoreCase),
            AgentActionType.ExecuteQualityDisposition
                => string.Equals(role, Roles.Quality, System.StringComparison.OrdinalIgnoreCase),
            AgentActionType.ExecutePurchaseAction
                => string.Equals(role, Roles.Purchase, System.StringComparison.OrdinalIgnoreCase),
            AgentActionType.ExecuteMaintenanceAction
                => string.Equals(role, Roles.Maintenance, System.StringComparison.OrdinalIgnoreCase),
            _ => false,
        };
    }

    /// <summary>返回拒绝原因文案，用于审计日志的 Reason 字段。</summary>
    public static string GetDenialReason(AgentActionType action) => action switch
    {
        AgentActionType.AdoptScheduling
            => "Only Admin or Planner can adopt Scheduling Agent decisions.",
        AgentActionType.RejectScheduling
            => "Only Admin or Planner can reject Scheduling Agent decisions.",
        AgentActionType.ExecuteQualityDisposition
            => "Only Admin or Quality can execute quality disposition actions.",
        AgentActionType.ExecutePurchaseAction
            => "Only Admin or Purchase can execute purchase actions.",
        AgentActionType.ExecuteMaintenanceAction
            => "Only Admin or Maintenance can execute maintenance actions.",
        _ => "Action not permitted for this role.",
    };

    /// <summary>动作的 audit/action 短名（用于 AgentActionResult.ActionType）。</summary>
    public static string GetActionName(AgentActionType action) => action switch
    {
        AgentActionType.AdoptScheduling => "Adopt",
        AgentActionType.RejectScheduling => "Reject",
        AgentActionType.ExecuteQualityDisposition => "ExecuteQualityDisposition",
        AgentActionType.ExecutePurchaseAction => "ExecutePurchaseAction",
        AgentActionType.ExecuteMaintenanceAction => "ExecuteMaintenanceAction",
        _ => "Unknown",
    };
}
