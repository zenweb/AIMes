using FluentAssertions;
using MES.Domain.Entities.Production;
using Xunit;

namespace MES.Tests.Unit.Domain;

/// <summary>
/// OperationExecution 状态机迁移测试。
/// 编码 WHY：错误的状态转移会让工单数据腐化（如已完成的工序被误重启会导致 CompletedQuantity 累加重复）。
/// 这些规则不是「能做什么」而是「不允许做什么」，必须用单测固化。
/// </summary>
public class OperationExecutionStateMachineTests
{
    private static OperationExecution NewPending() =>
        new("WO-001", "OP-001", "CNC 加工");

    [Fact]
    public void NewExecution_ShouldStartInPending()
    {
        var e = NewPending();
        e.Status.Should().Be(OperationExecutionStatus.Pending);
    }

    [Fact]
    public void Start_FromPending_ShouldTransitionToRunning()
    {
        var e = NewPending();
        e.Start();

        e.Status.Should().Be(OperationExecutionStatus.Running);
        e.StartedAt.Should().NotBeNull();
    }

    [Fact]
    public void Start_FromRunning_ShouldThrow()
    {
        var e = NewPending();
        e.Start();

        var act = () => e.Start();
        act.Should().Throw<InvalidOperationException>()
           .WithMessage("Only pending or paused operations can be started.");
    }

    [Fact]
    public void Start_FromCompleted_ShouldThrow_PreventDoubleCount()
    {
        var e = NewPending();
        e.Start();
        e.Complete(10);

        var act = () => e.Start();
        // WHY: 已完成的 OP 被重启 → 后续 Complete 会 throw 阻止 CompletedQuantity 重复累加
        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void Pause_FromRunning_ShouldTransitionToPaused()
    {
        var e = NewPending();
        e.Start();
        e.Pause("等待物料");

        e.Status.Should().Be(OperationExecutionStatus.Paused);
        e.SuspendReason.Should().Be("等待物料");
    }

    [Fact]
    public void Pause_FromPending_ShouldThrow()
    {
        var e = NewPending();
        var act = () => e.Pause("any");
        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void Start_FromPaused_ShouldClearSuspendReason()
    {
        var e = NewPending();
        e.Start();
        e.Pause("原因 A");
        e.Start();

        e.Status.Should().Be(OperationExecutionStatus.Running);
        e.SuspendReason.Should().BeNull();
    }

    [Fact]
    public void Complete_FromRunning_ShouldRecordQuantity()
    {
        var e = NewPending();
        e.Start();
        e.Complete(50);

        e.Status.Should().Be(OperationExecutionStatus.Completed);
        e.CompletedQuantity.Should().Be(50);
        e.CompletedAt.Should().NotBeNull();
    }

    [Fact]
    public void Complete_FromPending_ShouldThrow()
    {
        var e = NewPending();
        var act = () => e.Complete(10);
        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void ReportException_FromRunning_ShouldFail()
    {
        var e = NewPending();
        e.Start();
        e.ReportException("设备故障");

        e.Status.Should().Be(OperationExecutionStatus.Failed);
        e.ExceptionReason.Should().Be("设备故障");
        e.FailedAt.Should().NotBeNull();
    }

    [Fact]
    public void ReportException_FromPaused_ShouldFail()
    {
        var e = NewPending();
        e.Start();
        e.Pause("等待");
        e.ReportException("超时");

        e.Status.Should().Be(OperationExecutionStatus.Failed);
    }

    [Fact]
    public void ReportException_FromCompleted_ShouldThrow()
    {
        var e = NewPending();
        e.Start();
        e.Complete(10);

        var act = () => e.ReportException("late failure");
        // WHY: 已完成不能反向标记失败 — 否则审计链断裂、报表数据腐化
        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void Start_ShouldEmitDomainEvents()
    {
        var e = NewPending();
        e.Start();

        e.DomainEvents.Should().NotBeEmpty();
        e.DomainEvents.Should().Contain(ev => ev.GetType().Name == "OperationStarted");
    }

    [Fact]
    public void Complete_ShouldEmitOperationReportedEvent()
    {
        var e = NewPending();
        e.Start();
        e.PopDomainEvents(); // clear start events

        e.Complete(100);

        e.DomainEvents.Should().Contain(ev => ev.GetType().Name == "OperationReported");
    }
}
