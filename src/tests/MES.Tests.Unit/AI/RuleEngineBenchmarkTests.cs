using FluentAssertions;
using MES.AI.Core.Models;
using MES.AI.Core.Scheduling;
using MES.AI.Core.Scheduling.Evaluation;
using MES.Domain.Entities.Scheduling;
using Microsoft.Extensions.Logging.Abstractions;

namespace MES.Tests.Unit.AI;

public class RuleEngineBenchmarkTests
{
    private const string DatasetId = "DEMO-OTD-30-202605";
    private const int Seed = 20260523;

    [Fact]
    public async Task BaselineRunner_ShouldReturnFourRuleEngineBaselines()
    {
        var engine = CreateEngine();
        var runner = new RuleEngineBaselineRunner(engine);
        var request = CreateRequest(30);
        var context = CreateContext();

        var result = await runner.RunAllAsync(request, context);

        result.Keys.Should().BeEquivalentTo(Enum.GetValues<BaselineStrategy>());
        result.Values.Should().OnlyContain(r => r.Assignments.Count == 30);
    }

    [Fact]
    public void MonteCarlo_WithSameSeed_ShouldReplaySameDataset()
    {
        var simulator = new MonteCarloSimulator();
        var request = CreateRequest(30);

        var first = simulator.Perturb(request, Seed, 3);
        var second = simulator.Perturb(request, Seed, 3);

        first.SelectMany(r => r.Orders).Select(o => (o.Id, o.Quantity, o.DueDate))
            .Should().Equal(second.SelectMany(r => r.Orders).Select(o => (o.Id, o.Quantity, o.DueDate)));
    }

    [Fact]
    public async Task AbComparison_ShouldUseSameRequestForBaselineAndAgent()
    {
        var engine = CreateEngine();
        var request = CreateRequest(30);
        var context = CreateContext();
        var agentResult = await engine.GenerateInitialScheduleAsync(
            request,
            context,
            PriorityRule.WeightedComposite,
            CapacitySelectionStrategy.LeastLoaded);
        var harness = new AbComparisonHarness(new RuleEngineBaselineRunner(engine));

        var comparison = await harness.CompareAsync(DatasetId, Seed, request, context, agentResult);

        comparison.DatasetId.Should().Be(DatasetId);
        comparison.Seed.Should().Be(Seed);
        comparison.Baselines.Should().HaveCount(4);
        comparison.Agent.AssignmentCount.Should().Be(30);
        AbReportGenerator.GenerateMarkdown(comparison).Should().Contain("A/B Comparison Report");
    }

    [Fact]
    public void OtdCalculator_ShouldHandleBoundaryCases()
    {
        OtdCalculator.Calculate([], new Dictionary<string, DateTime>())
            .Should().Be(new OtdMetrics(0, 0, 0, 0));

        var due = new DateTime(2026, 5, 23, 12, 0, 0, DateTimeKind.Utc);
        var assignments = new[]
        {
            new ScheduleAssignment { WorkOrderId = "WO-ON-TIME", EndTime = due },
            new ScheduleAssignment { WorkOrderId = "WO-LATE", EndTime = due.AddHours(6) },
            new ScheduleAssignment { WorkOrderId = "WO-MISSING-DEADLINE", EndTime = due.AddHours(2) },
        };

        var result = OtdCalculator.Calculate(assignments, new Dictionary<string, DateTime>
        {
            ["WO-ON-TIME"] = due,
            ["WO-LATE"] = due,
        });

        result.Rate.Should().Be(33.33);
        result.OnTimeCount.Should().Be(1);
        result.LateCount.Should().Be(2);
        result.AverageDelayHours.Should().Be(2);
    }

    [Fact]
    public void MonteCarlo_ShouldSummarizeConfidenceInterval()
    {
        var simulator = new MonteCarloSimulator();

        var result = simulator.Summarize([83.33, 86.67, 90.00, 93.33, 96.67]);

        result.SampleCount.Should().Be(5);
        result.Mean.Should().BeApproximately(90.0, 0.0001);
        result.StdDev.Should().BeGreaterThan(0);
        result.Confidence95Lower.Should().BeLessThan(result.Mean);
        result.Confidence95Upper.Should().BeGreaterThan(result.Mean);
    }

    [Fact]
    public void SignificanceTest_ShouldDetectClearOtdLift()
    {
        var result = SignificanceTest.TwoProportionZTest(
            baselineOnTime: 15,
            baselineTotal: 30,
            agentOnTime: 27,
            agentTotal: 30);

        result.PValue.Should().BeLessThan(0.05);
        result.SignificantAt95.Should().BeTrue();
        result.Conclusion.Should().Contain("显著");
    }

    [Fact]
    public void SignificanceTest_ShouldExplainInsignificantLift()
    {
        var result = SignificanceTest.TwoProportionZTest(
            baselineOnTime: 25,
            baselineTotal: 30,
            agentOnTime: 26,
            agentTotal: 30);

        result.SignificantAt95.Should().BeFalse();
        result.Conclusion.Should().Contain("未达到");
    }

    private static SchedulingRuleEngine CreateEngine()
    {
        return new SchedulingRuleEngine(new ConstraintValidator(), NullLogger<SchedulingRuleEngine>.Instance);
    }

    private static ScheduleRequest CreateRequest(int count)
    {
        var start = new DateTime(2026, 5, 23, 8, 0, 0, DateTimeKind.Utc);
        var orders = Enumerable.Range(1, count).Select(i => new WorkOrderInfo
        {
            Id = $"WO-{i:000}",
            OrderNumber = $"WO-{i:000}",
            ProductCode = i % 3 == 0 ? "B200" : "A100",
            Quantity = 20 + i,
            DueDate = start.AddDays(1 + i % 7),
            Priority = i % 10,
            RouteCode = "R-CNC-STD"
        }).ToList();

        return new ScheduleRequest
        {
            WorkshopId = "DEMO-OTD-30",
            Orders = orders,
            Deadlines = orders.ToDictionary(o => o.Id, o => o.DueDate),
            OptimizationObjective = "due_date"
        };
    }

    private static SchedulingContextSnapshot CreateContext()
    {
        return new SchedulingContextSnapshot
        {
            WorkshopId = "DEMO-OTD-30",
            SnapshotTime = new DateTime(2026, 5, 23, 8, 0, 0, DateTimeKind.Utc),
            EquipmentCapacities =
            [
                new("EQ-CNC-1", "CNC-1", "CNC 1", "CNC", "Running", 240, 0.60)
                {
                    ActualCapacity = 220,
                    ReservedCapacity = 20,
                    IsBottleneck = true,
                    ConstraintType = "equipment"
                },
                new("EQ-CNC-2", "CNC-2", "CNC 2", "CNC", "Running", 200, 0.50)
                {
                    ActualCapacity = 190,
                    ReservedCapacity = 10,
                    IsBottleneck = true,
                    ConstraintType = "equipment"
                }
            ],
            MaterialAvailabilities =
            [
                new("MAT-A", "Material A", 5000, 0, 500),
                new("MAT-B", "Material B", 5000, 0, 500)
            ],
            ChangeoverMatrix =
            [
                new("A100", "B200", 120, ChangeoverType.DifferentMaterial)
                {
                    FromProductCode = "A100",
                    ToProductCode = "B200",
                    EquipmentType = "CNC"
                },
                new("B200", "A100", 120, ChangeoverType.DifferentMaterial)
                {
                    FromProductCode = "B200",
                    ToProductCode = "A100",
                    EquipmentType = "CNC"
                }
            ]
        };
    }
}
