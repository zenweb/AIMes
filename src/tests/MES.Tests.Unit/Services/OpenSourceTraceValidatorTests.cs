using FluentAssertions;
using MES.Api.Services;
using MES.Domain.Interfaces.Services;
using MES.Domain.ValueObjects;

namespace MES.Tests.Unit.Services;

public sealed class OpenSourceTraceValidatorTests
{
    [Fact]
    public void Validate_WhenTraceIsMissing_ShouldRejectUnauditableAiOutput()
    {
        var validator = new OpenSourceTraceValidator();

        var result = validator.Validate(null);

        result.IsValid.Should().BeFalse(
            "open-source fallback output must preserve the same mandatory audit-trace boundary as commercial AI output");
        result.Errors.Should().ContainSingle("AiDecisionTrace is required.");
    }

    [Fact]
    public void Validate_WhenTraceFieldsAreIncomplete_ShouldRejectTheFallbackOutput()
    {
        var validator = new OpenSourceTraceValidator();

        var result = validator.Validate(new AiDecisionTrace());

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain("AgentName is required.");
        result.Errors.Should().Contain("Confidence must be between 0 and 1.");
        result.Errors.Should().Contain("TokensInput must be greater than 0.");
        result.Errors.Should().Contain("TokensOutput must be greater than 0.");
    }

    [Fact]
    public async Task OpenSourceScheduleFallback_WhenNoEquipmentIsAvailable_ShouldEmitAValidTrace()
    {
        var service = new OpenSourceScheduleOptimizationService();
        var request = new ScheduleOptimizationRequest(
            "workshop-1",
            [],
            [],
            new Dictionary<string, int>(),
            new Dictionary<string, DateTime>(),
            null,
            "balanced",
            null);

        var result = await service.OptimizeAsync(request);
        var validation = new OpenSourceTraceValidator().Validate(result.AiDecisionTrace);

        validation.IsValid.Should().BeTrue();
        validation.Errors.Should().BeEmpty();
    }
}
