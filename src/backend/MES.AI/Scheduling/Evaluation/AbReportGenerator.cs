namespace MES.AI.Core.Scheduling.Evaluation;

using System.Text;

public static class AbReportGenerator
{
    public static string GenerateMarkdown(AbComparisonResult result)
    {
        var builder = new StringBuilder();
        builder.AppendLine($"# A/B Comparison Report - {result.DatasetId}");
        builder.AppendLine();
        builder.AppendLine($"- Seed: `{result.Seed}`");
        builder.AppendLine($"- Agent OTD lift vs best baseline: `{result.AgentOtdLiftPoints:F2}` points");
        builder.AppendLine();
        builder.AppendLine("| Scenario | OTD | Utilization | Changeover min | Assignments | Avg delay h |");
        builder.AppendLine("| --- | ---: | ---: | ---: | ---: | ---: |");
        foreach (var baseline in result.Baselines)
        {
            AppendRow(builder, baseline);
        }
        AppendRow(builder, result.Agent);
        return builder.ToString();
    }

    private static void AppendRow(StringBuilder builder, AbScenarioResult item)
    {
        builder.AppendLine($"| {item.Name} | {item.OtdRate:F2}% | {item.UtilizationRate:F2}% | {item.ChangeoverMinutes:F0} | {item.AssignmentCount} | {item.AverageDelayHours:F2} |");
    }
}
