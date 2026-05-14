using MES.Domain.Interfaces.Services;
using MES.Domain.ValueObjects;

namespace MES.AI.Pro.Services;

public sealed class AiDecisionTraceValidator : ITraceValidator
{
    public (bool IsValid, List<string> Errors) Validate(AiDecisionTrace? trace)
    {
        var errors = new List<string>();

        if (trace == null)
        {
            return (false, new List<string> { "AiDecisionTrace is required." });
        }

        Require(trace.TraceId, nameof(trace.TraceId), errors);
        Require(trace.AgentName, nameof(trace.AgentName), errors);
        Require(trace.AgentVersion, nameof(trace.AgentVersion), errors);
        Require(trace.ModelProvider, nameof(trace.ModelProvider), errors);
        Require(trace.ModelName, nameof(trace.ModelName), errors);
        Require(trace.ModelVersion, nameof(trace.ModelVersion), errors);
        Require(trace.PromptHash, nameof(trace.PromptHash), errors);
        Require(trace.ContextHash, nameof(trace.ContextHash), errors);
        Require(trace.InputSummary, nameof(trace.InputSummary), errors);
        Require(trace.OutputSummary, nameof(trace.OutputSummary), errors);
        Require(trace.SourceReferences, nameof(trace.SourceReferences), errors);
        Require(trace.RelatedBusinessKeys, nameof(trace.RelatedBusinessKeys), errors);

        if (!trace.Confidence.HasValue || trace.Confidence.Value <= 0 || trace.Confidence.Value > 1)
        {
            errors.Add("Confidence must be between 0 and 1.");
        }

        if (!trace.TokensInput.HasValue || trace.TokensInput.Value <= 0)
        {
            errors.Add("TokensInput must be greater than 0.");
        }

        if (!trace.TokensOutput.HasValue || trace.TokensOutput.Value <= 0)
        {
            errors.Add("TokensOutput must be greater than 0.");
        }

        if (trace.LatencyMs < 0)
        {
            errors.Add("LatencyMs must not be negative.");
        }

        if (!Enum.IsDefined(trace.HumanAdoptionStatus))
        {
            errors.Add("HumanAdoptionStatus must be a defined value.");
        }

        if (trace.CreatedAt == default)
        {
            errors.Add("CreatedAt is required.");
        }

        return (errors.Count == 0, errors);
    }

    private static void Require(string? value, string fieldName, List<string> errors)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            errors.Add($"{fieldName} is required.");
        }
    }
}
