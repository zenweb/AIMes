namespace MES.AI.Core.Scheduling.Evaluation;

using MES.AI.Core.Models;
using MES.AI.Core.Scheduling;
using MES.Domain.Entities.Scheduling;

public enum BaselineStrategy
{
    FCFS,
    EDD,
    WeightedComposite,
    LeastLoaded
}

public sealed class RuleEngineBaselineRunner
{
    private readonly ISchedulingRuleEngine _ruleEngine;

    public RuleEngineBaselineRunner(ISchedulingRuleEngine ruleEngine)
    {
        _ruleEngine = ruleEngine;
    }

    public async Task<IReadOnlyDictionary<BaselineStrategy, RuleEngineResult>> RunAllAsync(
        ScheduleRequest request,
        SchedulingContextSnapshot context,
        CancellationToken ct = default)
    {
        var results = new Dictionary<BaselineStrategy, RuleEngineResult>();
        foreach (var strategy in Enum.GetValues<BaselineStrategy>())
        {
            results[strategy] = await RunAsync(strategy, request, context, ct);
        }

        return results;
    }

    public Task<RuleEngineResult> RunAsync(
        BaselineStrategy strategy,
        ScheduleRequest request,
        SchedulingContextSnapshot context,
        CancellationToken ct = default)
    {
        var (priorityRule, capacityStrategy) = strategy switch
        {
            BaselineStrategy.FCFS => (PriorityRule.FCFS, CapacitySelectionStrategy.LeastLoaded),
            BaselineStrategy.EDD => (PriorityRule.EDD, CapacitySelectionStrategy.LeastLoaded),
            BaselineStrategy.WeightedComposite => (PriorityRule.WeightedComposite, CapacitySelectionStrategy.LeastLoaded),
            BaselineStrategy.LeastLoaded => (PriorityRule.EDD, CapacitySelectionStrategy.LeastLoaded),
            _ => (PriorityRule.EDD, CapacitySelectionStrategy.LeastLoaded)
        };

        return _ruleEngine.GenerateInitialScheduleAsync(request, context, priorityRule, capacityStrategy, ct);
    }
}
