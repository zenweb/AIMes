namespace MES.AI.Core.Scheduling.Evaluation;

public static class SignificanceTest
{
    public static ProportionTestResult TwoProportionZTest(int baselineOnTime, int baselineTotal, int agentOnTime, int agentTotal)
    {
        if (baselineTotal <= 0 || agentTotal <= 0)
        {
            return new ProportionTestResult(0, 1, false, "样本数量不足，不能判断 OTD 差异显著性。");
        }

        var p1 = baselineOnTime / (double)baselineTotal;
        var p2 = agentOnTime / (double)agentTotal;
        var pooled = (baselineOnTime + agentOnTime) / (double)(baselineTotal + agentTotal);
        var standardError = Math.Sqrt(pooled * (1 - pooled) * (1.0 / baselineTotal + 1.0 / agentTotal));
        if (standardError == 0)
        {
            return new ProportionTestResult(0, 1, false, "两组 OTD 方差为零，不能形成显著性结论。");
        }

        var z = (p2 - p1) / standardError;
        var pValue = 2 * (1 - NormalCdf(Math.Abs(z)));
        var significant = pValue < 0.05;
        var conclusion = significant
            ? "Agent OTD 改善在 95% 置信水平下显著。"
            : "Agent OTD 改善未达到 95% 显著性门槛，需扩大样本或复核场景。";
        return new ProportionTestResult(Math.Round(z, 4), Math.Round(pValue, 4), significant, conclusion);
    }

    private static double NormalCdf(double x) => 0.5 * (1.0 + Erf(x / Math.Sqrt(2.0)));

    private static double Erf(double x)
    {
        var sign = Math.Sign(x);
        x = Math.Abs(x);
        var t = 1.0 / (1.0 + 0.3275911 * x);
        var y = 1.0 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.Exp(-x * x);
        return sign * y;
    }
}

public sealed record ProportionTestResult(double ZScore, double PValue, bool SignificantAt95, string Conclusion);
