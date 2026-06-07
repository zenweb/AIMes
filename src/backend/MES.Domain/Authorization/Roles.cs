namespace MES.Domain.Authorization;

/// <summary>
/// V1.5 标准角色枚举字符串常量，避免角色名散落在各处。
/// 与 `_docs/_design/20260524-v15-agent-permission-policy.md` 角色矩阵对齐。
/// </summary>
public static class Roles
{
    /// <summary>系统管理员，全权限</summary>
    public const string Admin = "Admin";

    /// <summary>调度员/计划员，负责排产 Agent 决策的采纳/拒绝</summary>
    public const string Planner = "Planner";

    /// <summary>质量工程师，负责质量处置类 Agent 决策执行</summary>
    public const string Quality = "Quality";

    /// <summary>采购员，负责采购类 Agent 决策执行</summary>
    public const string Purchase = "Purchase";

    /// <summary>设备工程师，负责维护类 Agent 决策执行</summary>
    public const string Maintenance = "Maintenance";

    /// <summary>运营操作员，只能查看 Agent 建议，不能写入</summary>
    public const string Operator = "Operator";
}
