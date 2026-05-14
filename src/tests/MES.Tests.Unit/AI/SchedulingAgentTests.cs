using FluentAssertions;
using MES.AI.Core.Models;
using MES.AI.Core.Scheduling;
using MES.AI.Pro.Agents;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Interfaces.Repositories;
using MES.Domain.Interfaces.Services;
using Microsoft.SemanticKernel;
using Moq;

namespace MES.Tests.Unit.AI;

public class SchedulingAgentTests
{
    private static readonly DateTime Now = new(2026, 5, 12, 8, 0, 0, DateTimeKind.Utc);

    private readonly Mock<ILlmGateway> _llmMock = new();
    private readonly Mock<ISchedulingContextProvider> _contextMock = new();
    private readonly Mock<ISchedulingRuleEngine> _ruleEngineMock = new();
    private readonly Mock<IConstraintValidator> _validatorMock = new();
    private readonly SchedulingAgent _agent;

    public SchedulingAgentTests()
    {
        var kernel = Kernel.CreateBuilder().Build();
        _agent = new SchedulingAgent(
            kernel, _llmMock.Object, _contextMock.Object,
            _ruleEngineMock.Object, _validatorMock.Object);
    }

    [Fact]
    public async Task OptimizeScheduleAsync_SuccessPath_ReturnsOptimizedResult()
    {
        var request = CreateRequest();
        var context = CreateContext();
        var ruleResult = CreateRuleResult(valid: true);
        var llmResult = new SchedulingResult
        {
            Assignments = ruleResult.Assignments,
            EstimatedCompletion = Now.AddDays(3),
            UtilizationRate = 0.75,
            OnTimeDeliveryRate = 0.9,
            TotalChangeoverMinutes = 60,
            GroupCount = 2,
            OptimizationNotes = "LLM 精调完成"
        };

        _contextMock.Setup(x => x.GetContextAsync(request.WorkshopId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(context);
        _ruleEngineMock.Setup(x => x.GenerateInitialScheduleAsync(request, context, It.IsAny<PriorityRule>(), It.IsAny<CapacitySelectionStrategy>(), It.IsAny<WeightedSchedulingConfig>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(ruleResult);
        _llmMock.Setup(x => x.GenerateJsonAsync<SchedulingResult>(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(llmResult);
        _validatorMock.Setup(x => x.Validate(It.IsAny<List<ScheduleAssignment>>(), request, context))
            .Returns(new ConstraintValidationResult());

        var result = await _agent.OptimizeScheduleAsync(request);

        result.Should().NotBeNull();
        result.Assignments.Should().NotBeEmpty();
        result.UtilizationRate.Should().Be(0.75);
        result.OptimizationNotes.Should().Contain("LLM");
    }

    [Fact]
    public async Task OptimizeScheduleAsync_ValidationFails_ReturnsFallback()
    {
        var request = CreateRequest();
        var context = CreateContext();
        var ruleResult = CreateRuleResult(valid: false);

        _contextMock.Setup(x => x.GetContextAsync(request.WorkshopId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(context);
        _ruleEngineMock.Setup(x => x.GenerateInitialScheduleAsync(request, context, It.IsAny<PriorityRule>(), It.IsAny<CapacitySelectionStrategy>(), It.IsAny<WeightedSchedulingConfig>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(ruleResult);

        var result = await _agent.OptimizeScheduleAsync(request);

        result.Should().NotBeNull();
        result.Assignments.Should().NotBeEmpty();
        result.OptimizationNotes.Should().Contain("未通过约束验证");
    }

    [Fact]
    public async Task OptimizeScheduleAsync_LlmException_FallsBackToRules()
    {
        var request = CreateRequest();
        var context = CreateContext();
        var ruleResult = CreateRuleResult(valid: true);

        _contextMock.Setup(x => x.GetContextAsync(request.WorkshopId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(context);
        _ruleEngineMock.Setup(x => x.GenerateInitialScheduleAsync(request, context, It.IsAny<PriorityRule>(), It.IsAny<CapacitySelectionStrategy>(), It.IsAny<WeightedSchedulingConfig>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(ruleResult);
        _llmMock.Setup(x => x.GenerateJsonAsync<SchedulingResult>(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("LLM unavailable"));
        _validatorMock.Setup(x => x.Validate(It.IsAny<List<ScheduleAssignment>>(), request, context))
            .Returns(new ConstraintValidationResult());

        var result = await _agent.OptimizeScheduleAsync(request);

        result.Should().NotBeNull();
        result.Assignments.Should().NotBeEmpty();
        result.OptimizationNotes.Should().Contain("LLM 调用失败");
    }

    private static ScheduleRequest CreateRequest()
    {
        return new ScheduleRequest
        {
            WorkshopId = "WS-001",
            Orders =
            [
                new() { Id = "O1", OrderNumber = "WO-001", ProductCode = "PROD-A1", Quantity = 100, DueDate = Now.AddDays(7) },
                new() { Id = "O2", OrderNumber = "WO-002", ProductCode = "PROD-B1", Quantity = 200, DueDate = Now.AddDays(14) },
            ],
            Equipment =
            [
                new() { Id = "EQ1", EquipmentCode = "CNC-001", Capacity = 100, Type = "CNC" },
                new() { Id = "EQ2", EquipmentCode = "CNC-002", Capacity = 80, Type = "CNC" },
            ],
            Materials = new Dictionary<string, int> { ["MAT-A"] = 1000 },
            Deadlines = new Dictionary<string, DateTime>
            {
                ["O1"] = Now.AddDays(7),
                ["O2"] = Now.AddDays(14),
            }
        };
    }

    private static SchedulingContextSnapshot CreateContext()
    {
        return new SchedulingContextSnapshot
        {
            WorkshopId = "WS-001",
            SnapshotTime = Now,
            WorkOrders =
            [
                new("WO-001", "PROD-A1", "Product A", 100, 0, "Created", Now, Now.AddDays(7), "R001", 10, "WS-001"),
                new("WO-002", "PROD-B1", "Product B", 200, 0, "Created", Now, Now.AddDays(14), "R002", 5, "WS-001"),
            ],
            EquipmentCapacities =
            [
                new("EQ1", "CNC-001", "CNC Machine 1", "CNC", "Running", 100, 0.75),
                new("EQ2", "CNC-002", "CNC Machine 2", "CNC", "Idle", 80, 0.3),
            ],
            MaterialAvailabilities =
            [
                new("MAT-A", "Material A", 1000, 100, 50),
            ],
        };
    }

    private static RuleEngineResult CreateRuleResult(bool valid)
    {
        var violations = valid ? [] : new List<ConstraintViolation>
        {
            new() { WorkOrderId = "O1", Rule = "Capacity", Level = ConstraintViolationLevel.Error, Message = "超出产能" }
        };

        return new RuleEngineResult
        {
            Assignments =
            [
                new()
                {
                    WorkOrderId = "O1", EquipmentId = "EQ1",
                    StartTime = Now, EndTime = Now.AddHours(8)
                },
                new()
                {
                    WorkOrderId = "O2", EquipmentId = "EQ2",
                    StartTime = Now, EndTime = Now.AddHours(6)
                },
            ],
            EstimatedCompletion = Now.AddDays(3),
            UtilizationRate = 0.75,
            OnTimeDeliveryRate = 1.0,
            TotalChangeoverMinutes = 30,
            GroupCount = 2,
            Validation = new ConstraintValidationResult { Violations = violations }
        };
    }
}
