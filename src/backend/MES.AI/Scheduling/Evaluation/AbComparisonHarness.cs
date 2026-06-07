namespace MES.AI.Core.Scheduling.Evaluation;

using MES.AI.Core.Models;
using MES.AI.Core.Scheduling;
using MES.Domain.Entities.Scheduling;

public sealed class AbComparisonHarness
{
    private readonly RuleEngineBaselineRunner _baselineRunner;

    public AbComparisonHarness(RuleEngineBaselineRunner baselineRunner)
    {
        _baselineRunner = baselineRunner;
    }

    public async Task<AbComparisonResult> CompareAsync(
        string datasetId,
        int seed,
        ScheduleRequest request,
        SchedulingContextSnapshot context,
        RuleEngineResult agentResult,
        CancellationToken ct = default)
    {
        var baselines = await _baselineRunner.RunAllAsync(request, context, ct);
        var baselineItems = baselines.Select(item => MapBaseline(item.Key, item.Value, request.Deadlines)).ToList();
        var agentOtd = OtdCalculator.Calculate(agentResult.Assignments, request.Deadlines);
        var bestBaseline = baselineItems.OrderByDescending(i => i.OtdRate).FirstOrDefault();

        return new AbComparisonResult(
            datasetId,
            seed,
            baselineItems,
            new AbScenarioResult(
                "Agent",
                agentOtd.Rate,
                agentResult.UtilizationRate,
                agentResult.TotalChangeoverMinutes,
                agentResult.Assignments.Count,
                agentOtd.AverageDelayHours),
            bestBaseline is null ? 0 : Math.Round(agentOtd.Rate - bestBaseline.OtdRate, 2));
    }

    private static AbScenarioResult MapBaseline(BaselineStrategy strategy, RuleEngineResult result, IReadOnlyDictionary<string, DateTime> deadlines)
    {
        var otd = OtdCalculator.Calculate(result.Assignments, deadlines);
        return new AbScenarioResult(
            strategy.ToString(),
            otd.Rate,
            result.UtilizationRate,
            result.TotalChangeoverMinutes,
            result.Assignments.Count,
            otd.AverageDelayHours);
    }
}

public sealed record AbComparisonResult(
    string DatasetId,
    int Seed,
    IReadOnlyList<AbScenarioResult> Baselines,
    AbScenarioResult Agent,
    double AgentOtdLiftPoints);

public sealed record AbScenarioResult(
    string Name,
    double OtdRate,
    double UtilizationRate,
    double ChangeoverMinutes,
    int AssignmentCount,
    double AverageDelayHours);
