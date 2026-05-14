using System.Security.Cryptography;
using System.Text;
using MES.Domain.ValueObjects;

namespace MES.AI.Pro.Services;

internal static class AiTraceFactory
{
    public static AiDecisionTrace Create(
        string agentName,
        string agentVersion,
        string modelProvider,
        string modelName,
        string modelVersion,
        string prompt,
        string context,
        string inputSummary,
        string outputSummary,
        decimal confidence,
        int tokensInput,
        int tokensOutput,
        int latencyMs,
        string sourceReferences,
        string relatedBusinessKeys)
    {
        return new AiDecisionTrace
        {
            AgentName = agentName,
            AgentVersion = agentVersion,
            ModelProvider = modelProvider,
            ModelName = modelName,
            ModelVersion = modelVersion,
            PromptHash = Sha256(prompt),
            ContextHash = Sha256(context),
            InputSummary = inputSummary,
            OutputSummary = outputSummary,
            Confidence = confidence,
            TokensInput = Math.Max(1, tokensInput),
            TokensOutput = Math.Max(1, tokensOutput),
            LatencyMs = Math.Max(0, latencyMs),
            HumanAdoptionStatus = HumanAdoptionStatus.Pending,
            SourceReferences = sourceReferences,
            RelatedBusinessKeys = relatedBusinessKeys,
            CreatedAt = DateTime.UtcNow
        };
    }

    public static int EstimateTokens(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            return 1;
        }

        return Math.Max(1, text.Length / 4);
    }

    private static string Sha256(string value)
    {
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(value));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }
}
