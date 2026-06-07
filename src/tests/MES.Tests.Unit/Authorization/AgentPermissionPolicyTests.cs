using FluentAssertions;
using MES.Domain.Authorization;

namespace MES.Tests.Unit.Authorization;

/// <summary>
/// V1.5 5 角色 × 5 动作权限矩阵测试。
/// 验证 _docs/_design/20260524-v15-agent-permission-policy.md 角色矩阵真实落地。
/// </summary>
public class AgentPermissionPolicyTests
{
    [Theory]
    [InlineData(Roles.Admin, AgentActionType.AdoptScheduling, true)]
    [InlineData(Roles.Admin, AgentActionType.RejectScheduling, true)]
    [InlineData(Roles.Admin, AgentActionType.ExecuteQualityDisposition, true)]
    [InlineData(Roles.Admin, AgentActionType.ExecutePurchaseAction, true)]
    [InlineData(Roles.Admin, AgentActionType.ExecuteMaintenanceAction, true)]
    public void Admin_ShouldExecuteAllActions(string role, AgentActionType action, bool expected)
    {
        AgentPermissionPolicy.CanExecute(role, action).Should().Be(expected);
    }

    [Theory]
    [InlineData(Roles.Planner, AgentActionType.AdoptScheduling, true)]
    [InlineData(Roles.Planner, AgentActionType.RejectScheduling, true)]
    [InlineData(Roles.Planner, AgentActionType.ExecuteQualityDisposition, false)]
    [InlineData(Roles.Planner, AgentActionType.ExecutePurchaseAction, false)]
    [InlineData(Roles.Planner, AgentActionType.ExecuteMaintenanceAction, false)]
    public void Planner_OnlyOwnsScheduling(string role, AgentActionType action, bool expected)
    {
        AgentPermissionPolicy.CanExecute(role, action).Should().Be(expected);
    }

    [Theory]
    [InlineData(Roles.Quality, AgentActionType.AdoptScheduling, false)]
    [InlineData(Roles.Quality, AgentActionType.RejectScheduling, false)]
    [InlineData(Roles.Quality, AgentActionType.ExecuteQualityDisposition, true)]
    [InlineData(Roles.Quality, AgentActionType.ExecutePurchaseAction, false)]
    [InlineData(Roles.Quality, AgentActionType.ExecuteMaintenanceAction, false)]
    public void Quality_OnlyOwnsQualityDisposition(string role, AgentActionType action, bool expected)
    {
        AgentPermissionPolicy.CanExecute(role, action).Should().Be(expected);
    }

    [Theory]
    [InlineData(Roles.Purchase, AgentActionType.AdoptScheduling, false)]
    [InlineData(Roles.Purchase, AgentActionType.RejectScheduling, false)]
    [InlineData(Roles.Purchase, AgentActionType.ExecuteQualityDisposition, false)]
    [InlineData(Roles.Purchase, AgentActionType.ExecutePurchaseAction, true)]
    [InlineData(Roles.Purchase, AgentActionType.ExecuteMaintenanceAction, false)]
    public void Purchase_OnlyOwnsPurchaseAction(string role, AgentActionType action, bool expected)
    {
        AgentPermissionPolicy.CanExecute(role, action).Should().Be(expected);
    }

    [Theory]
    [InlineData(Roles.Maintenance, AgentActionType.AdoptScheduling, false)]
    [InlineData(Roles.Maintenance, AgentActionType.RejectScheduling, false)]
    [InlineData(Roles.Maintenance, AgentActionType.ExecuteQualityDisposition, false)]
    [InlineData(Roles.Maintenance, AgentActionType.ExecutePurchaseAction, false)]
    [InlineData(Roles.Maintenance, AgentActionType.ExecuteMaintenanceAction, true)]
    public void Maintenance_OnlyOwnsMaintenanceAction(string role, AgentActionType action, bool expected)
    {
        AgentPermissionPolicy.CanExecute(role, action).Should().Be(expected);
    }

    [Theory]
    [InlineData(Roles.Operator, AgentActionType.AdoptScheduling)]
    [InlineData(Roles.Operator, AgentActionType.RejectScheduling)]
    [InlineData(Roles.Operator, AgentActionType.ExecuteQualityDisposition)]
    [InlineData(Roles.Operator, AgentActionType.ExecutePurchaseAction)]
    [InlineData(Roles.Operator, AgentActionType.ExecuteMaintenanceAction)]
    public void Operator_ShouldNeverExecute(string role, AgentActionType action)
    {
        AgentPermissionPolicy.CanExecute(role, action).Should().BeFalse();
    }

    [Theory]
    [InlineData(null, AgentActionType.AdoptScheduling)]
    [InlineData("", AgentActionType.AdoptScheduling)]
    [InlineData("   ", AgentActionType.AdoptScheduling)]
    [InlineData("UnknownRole", AgentActionType.AdoptScheduling)]
    public void EmptyOrUnknownRole_ShouldBeDenied(string? role, AgentActionType action)
    {
        AgentPermissionPolicy.CanExecute(role, action).Should().BeFalse();
    }

    [Fact]
    public void RoleComparison_ShouldBeCaseInsensitive()
    {
        AgentPermissionPolicy.CanExecute("admin", AgentActionType.AdoptScheduling).Should().BeTrue();
        AgentPermissionPolicy.CanExecute("PLANNER", AgentActionType.AdoptScheduling).Should().BeTrue();
        AgentPermissionPolicy.CanExecute("quality", AgentActionType.ExecuteQualityDisposition).Should().BeTrue();
    }

    [Fact]
    public void GetActionName_ShouldMatchAgentActionResult_ActionType()
    {
        AgentPermissionPolicy.GetActionName(AgentActionType.AdoptScheduling).Should().Be("Adopt");
        AgentPermissionPolicy.GetActionName(AgentActionType.RejectScheduling).Should().Be("Reject");
        AgentPermissionPolicy.GetActionName(AgentActionType.ExecuteQualityDisposition).Should().Be("ExecuteQualityDisposition");
        AgentPermissionPolicy.GetActionName(AgentActionType.ExecutePurchaseAction).Should().Be("ExecutePurchaseAction");
        AgentPermissionPolicy.GetActionName(AgentActionType.ExecuteMaintenanceAction).Should().Be("ExecuteMaintenanceAction");
    }

    [Fact]
    public void GetDenialReason_ShouldNotBeEmpty()
    {
        foreach (var action in System.Enum.GetValues<AgentActionType>())
        {
            AgentPermissionPolicy.GetDenialReason(action).Should().NotBeNullOrWhiteSpace();
        }
    }
}
