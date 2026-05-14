using FluentAssertions;
using MES.AI.Pro.Agents;
using MES.Domain.Entities.Anomalies;
using MES.Domain.Interfaces.Services;
using MES.Domain.ValueObjects;
using Moq;

namespace MES.Tests.Unit.AI;

public class AnomalyAgentTests
{
    [Fact]
    public async Task AnalyzeAsync_WithoutLLM_UsesRulesOnly()
    {
        var agent = new AnomalyAgent();
        var anomaly = CreateAnomaly(AnomalySeverity.Critical, "quality");

        var results = await agent.AnalyzeAsync(anomaly);

        results.Should().NotBeEmpty();
        // Critical severity triggers immediate containment response
        results.Should().Contain(r => r.SuggestedAction.Contains("Pause"));
    }

    [Fact]
    public async Task AnalyzeAsync_LLMReturnsNull_FallsBackToRules()
    {
        var llmMock = new Mock<ILlmGateway>();
        var vectorMock = new Mock<IVectorStoreService>();
        var agent = new AnomalyAgent(llmMock.Object, vectorMock.Object);
        var anomaly = CreateAnomaly(AnomalySeverity.Low, "material");

        llmMock.Setup(x => x.GenerateEmbeddingAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new float[] { 0.1f });
        vectorMock.Setup(x => x.SearchAsync(It.IsAny<string>(), It.IsAny<float[]>(), It.IsAny<int>()))
            .ReturnsAsync([]);
        // GenerateJsonAsync not set up — Moq loose behavior returns null Task
        // The agent's ?? operator converts it to empty list, triggers rule fallback

        var results = await agent.AnalyzeAsync(anomaly);

        results.Should().NotBeEmpty();
        // Falls back to rule for "material" keyword
        results.Should().Contain(r => r.Description.Contains("Material anomaly"));
    }

    [Fact]
    public async Task AnalyzeAsync_RuleAnalysis_CoversAllKeywords()
    {
        var agent = new AnomalyAgent();

        var qualityAnomaly = CreateAnomaly(AnomalySeverity.Medium, "quality");
        var equipmentAnomaly = CreateAnomaly(AnomalySeverity.Medium, "equipment");
        var materialAnomaly = CreateAnomaly(AnomalySeverity.Medium, "material");

        var qualityResults = await agent.AnalyzeAsync(qualityAnomaly);
        var equipmentResults = await agent.AnalyzeAsync(equipmentAnomaly);
        var materialResults = await agent.AnalyzeAsync(materialAnomaly);

        qualityResults.Should().Contain(r => r.Description.Contains("Quality anomaly"));
        equipmentResults.Should().Contain(r => r.Description.Contains("Equipment anomaly"));
        materialResults.Should().Contain(r => r.Description.Contains("Material anomaly"));
    }

    private static ProductionAnomaly CreateAnomaly(AnomalySeverity severity, string type)
    {
        return new ProductionAnomaly(
            new WorkOrderNumber("WO-001"),
            new OperationCode("OP-001"),
            type,
            severity,
            $"Test {type} anomaly",
            $"Description for {type} anomaly");
    }
}
