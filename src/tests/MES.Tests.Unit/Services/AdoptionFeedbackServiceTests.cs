using FluentAssertions;
using MES.AI.Core.Models;
using MES.AI.Core.Scheduling;
using MES.Domain.Entities.Scheduling;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace MES.Tests.Unit.Services;

public class AdoptionFeedbackServiceTests
{
    private readonly AdoptionFeedbackService _sut;

    public AdoptionFeedbackServiceTests()
    {
        _sut = new AdoptionFeedbackService(Mock.Of<ILogger<AdoptionFeedbackService>>());
    }

    [Fact]
    public void RecordOverride_ShouldReturnFeedbackWithCorrectPlanId()
    {
        var result = _sut.RecordOverride(
            "plan-001", "ws-001", "utilization",
            [], [],
            OverrideReasonCategory.Other,
            null, null,
            "test-user");

        result.SchedulePlanId.Should().Be("plan-001");
        result.WorkshopId.Should().Be("ws-001");
        result.OptimizationObjective.Should().Be("utilization");
        result.OperatorUser.Should().Be("test-user");
    }

    [Fact]
    public void RecordOverride_WithReasonCategory_ShouldSetCategory()
    {
        var result = _sut.RecordOverride(
            "plan-001", "ws-001", "delivery",
            [], [],
            OverrideReasonCategory.UrgentInsertion,
            "急单插队", ["wo-001"],
            "operator");

        result.ReasonCategory.Should().Be(OverrideReasonCategory.UrgentInsertion);
        result.ReasonDetail.Should().Be("急单插队");
        result.MovedOrderIdsJson.Should().Contain("wo-001");
    }

    [Fact]
    public void RecordOverride_WithAssignments_ShouldSerializeCorrectly()
    {
        var original = new List<ScheduleAssignment>
        {
            new() { WorkOrderId = "wo-001", EquipmentId = "eq-001", StartTime = DateTime.UtcNow, EndTime = DateTime.UtcNow.AddHours(2) }
        };
        var modified = new List<ScheduleAssignment>
        {
            new() { WorkOrderId = "wo-001", EquipmentId = "eq-002", StartTime = DateTime.UtcNow, EndTime = DateTime.UtcNow.AddHours(3) }
        };

        var result = _sut.RecordOverride(
            "plan-001", "ws-001", "utilization",
            original, modified,
            OverrideReasonCategory.EquipmentFailure,
            "换设备", null,
            "engineer");

        result.OriginalAssignmentsJson.Should().Contain("wo-001");
        result.ModifiedAssignmentsJson.Should().Contain("eq-002");
        result.ReasonCategory.Should().Be(OverrideReasonCategory.EquipmentFailure);
    }

    [Fact]
    public void RecordOverride_WithAiTraceId_ShouldIncludeTrace()
    {
        var result = _sut.RecordOverride(
            "plan-001", "ws-001", "delivery",
            [], [],
            OverrideReasonCategory.Other,
            null, null,
            "user", "trace-abc-123");

        result.AiTraceId.Should().Be("trace-abc-123");
    }

    [Fact]
    public void RecordOverride_WithoutMovedOrders_ShouldHaveNullJson()
    {
        var result = _sut.RecordOverride(
            "plan-001", "ws-001", "utilization",
            [], [],
            OverrideReasonCategory.Other,
            null, null,
            "user");

        result.MovedOrderIdsJson.Should().BeNull();
    }
}
