using System.Collections;
using FluentAssertions;
using MES.AI.Pro.Agents;
using MES.Domain.Entities.Anomalies;
using MES.Domain.Entities.Knowledge;
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
        vectorMock.Setup(x => x.SearchAsync(It.IsAny<string>(), It.IsAny<float[]>(), It.IsAny<int>(), It.IsAny<CancellationToken>()))
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

    [Fact]
    public async Task AnalyzeWithLLMAsync_WhenLlmReturnsSuggestion_AddsTraceAndTokenBudget()
    {
        var llm = new CapturingLlmGateway { ReturnAnomalySuggestion = true };
        var vectorMock = new Mock<IVectorStoreService>();
        var agent = new AnomalyAgent(llm, vectorMock.Object);
        var anomaly = CreateAnomaly(AnomalySeverity.Medium, "equipment");

        vectorMock.Setup(x => x.SearchAsync("production-anomalies", It.IsAny<float[]>(), 5, It.IsAny<CancellationToken>()))
            .ReturnsAsync([
                new DocumentChunk { Id = "case-1", Content = "Historical spindle vibration case", Source = "casebook" }
            ]);

        var results = await agent.AnalyzeWithLLMAsync(anomaly);

        results.Should().ContainSingle();
        results[0].SuggestedAction.Should().Be("Run vibration diagnosis.");
        var trace = results[0].AiDecisionTrace;
        trace.Should().NotBeNull();
        trace.ModelProvider.Should().Be("ConfiguredLlmGateway");
        trace.TokensInput.Should().BeLessThanOrEqualTo(4000);
    }

    [Fact]
    public async Task AnalyzeWithLLMAsync_PassesCancellationTokenToVectorSearch()
    {
        var llm = new CapturingLlmGateway { ReturnAnomalySuggestion = true };
        var vectorMock = new Mock<IVectorStoreService>();
        var agent = new AnomalyAgent(llm, vectorMock.Object);
        var anomaly = CreateAnomaly(AnomalySeverity.Medium, "equipment");
        using var cts = new CancellationTokenSource();

        vectorMock.Setup(x => x.SearchAsync("production-anomalies", It.IsAny<float[]>(), 5, It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        await agent.AnalyzeWithLLMAsync(anomaly, cts.Token);

        vectorMock.Verify(
            x => x.SearchAsync("production-anomalies", It.IsAny<float[]>(), 5, cts.Token),
            Times.Once);
    }

    [Fact]
    public async Task AnalyzeAsync_WhenLlmThrows_FallsBackToRules()
    {
        var llm = new CapturingLlmGateway { GenerateEmbeddingException = new InvalidOperationException("llm offline") };
        var vectorMock = new Mock<IVectorStoreService>();
        var agent = new AnomalyAgent(llm, vectorMock.Object);
        var anomaly = CreateAnomaly(AnomalySeverity.Low, "material");

        var results = await agent.AnalyzeAsync(anomaly);

        results.Should().Contain(r => r.Description.Contains("Material anomaly"));
        results.Should().AllSatisfy(r =>
        {
            var trace = r.AiDecisionTrace;
            trace.Should().NotBeNull();
            trace.ModelProvider.Should().Be("RulesEngine");
        });
    }

    [Fact]
    public async Task AnalyzeAsync_WhenVectorRetrievalThrows_FallsBackToRules()
    {
        var llm = new CapturingLlmGateway { ReturnAnomalySuggestion = true };
        var vectorMock = new Mock<IVectorStoreService>();
        var agent = new AnomalyAgent(llm, vectorMock.Object);
        var anomaly = CreateAnomaly(AnomalySeverity.Low, "material");
        vectorMock.Setup(x => x.SearchAsync("production-anomalies", It.IsAny<float[]>(), 5, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("vector unavailable"));

        var results = await agent.AnalyzeAsync(anomaly);

        results.Should().Contain(r => r.Description.Contains("Material anomaly"));
        results.Should().AllSatisfy(r =>
        {
            var trace = r.AiDecisionTrace;
            trace.Should().NotBeNull();
            trace.ModelProvider.Should().Be("RulesEngine");
        });
    }

    [Fact]
    public async Task AnalyzeAsync_WhenVectorRetrievalCanceled_ThrowsOperationCanceledException()
    {
        var llm = new CapturingLlmGateway { ReturnAnomalySuggestion = true };
        var vectorMock = new Mock<IVectorStoreService>();
        var agent = new AnomalyAgent(llm, vectorMock.Object);
        var anomaly = CreateAnomaly(AnomalySeverity.Low, "material");
        vectorMock.Setup(x => x.SearchAsync("production-anomalies", It.IsAny<float[]>(), 5, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new OperationCanceledException());

        var act = () => agent.AnalyzeAsync(anomaly);

        await act.Should().ThrowAsync<OperationCanceledException>();
    }

    [Fact]
    public async Task AnalyzeWithLLMAsync_WhenPromptWouldOverflow_SendsBoundedPrompt()
    {
        var llm = new CapturingLlmGateway { ReturnAnomalySuggestion = true };
        var vectorMock = new Mock<IVectorStoreService>();
        var agent = new AnomalyAgent(llm, vectorMock.Object);
        var anomaly = CreateAnomaly(AnomalySeverity.Medium, "equipment");
        anomaly = new ProductionAnomaly(
            anomaly.WorkOrderNumber,
            anomaly.OperationCode,
            anomaly.AnomalyType,
            anomaly.Severity,
            new string('T', 12000),
            new string('D', 12000));

        vectorMock.Setup(x => x.SearchAsync("production-anomalies", It.IsAny<float[]>(), 5, It.IsAny<CancellationToken>()))
            .ReturnsAsync([
                new DocumentChunk { Id = "case-1", Content = new string('H', 12000), Source = "casebook" }
            ]);

        var results = await agent.AnalyzeWithLLMAsync(anomaly);

        results.Should().ContainSingle();
        llm.LastJsonPrompt.Should().NotBeNull();
        (llm.LastJsonPrompt ?? string.Empty).Length.Should().BeLessThanOrEqualTo(16_000);
        var trace = results[0].AiDecisionTrace;
        trace.Should().NotBeNull();
        trace.TokensInput.Should().BeLessThanOrEqualTo(4000);
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

    private sealed class CapturingLlmGateway : ILlmGateway
    {
        public bool ReturnAnomalySuggestion { get; init; }
        public Exception? GenerateEmbeddingException { get; init; }
        public string? LastJsonPrompt { get; private set; }

        public Task<string> GenerateTextAsync(string prompt, CancellationToken ct = default)
        {
            return Task.FromResult(string.Empty);
        }

        public Task<string> GenerateTextAsync(string systemPrompt, string userPrompt, CancellationToken ct = default)
        {
            return Task.FromResult(string.Empty);
        }

        public Task<T> GenerateJsonAsync<T>(string prompt, CancellationToken ct = default) where T : class
        {
            LastJsonPrompt = prompt;

            if (ReturnAnomalySuggestion && typeof(T).IsGenericType)
            {
                if (Activator.CreateInstance(typeof(T)) is not IList list)
                {
                    throw new InvalidOperationException($"Could not create {typeof(T).Name}.");
                }

                var itemType = typeof(T).GetGenericArguments()[0];
                var item = Activator.CreateInstance(itemType)
                    ?? throw new InvalidOperationException($"Could not create {itemType.Name}.");
                itemType.GetProperty("Description")?.SetValue(item, "Equipment anomaly resembles vibration drift.");
                itemType.GetProperty("SuggestedAction")?.SetValue(item, "Run vibration diagnosis.");
                itemType.GetProperty("Confidence")?.SetValue(item, 0.91);
                list.Add(item);
                return Task.FromResult((T)list);
            }

            throw new InvalidOperationException($"Unexpected JSON type {typeof(T).Name}.");
        }

        public Task<float[]> GenerateEmbeddingAsync(string text, CancellationToken ct = default)
        {
            if (GenerateEmbeddingException != null)
            {
                throw GenerateEmbeddingException;
            }

            return Task.FromResult(new[] { 0.1f, 0.2f });
        }

        public Task<LlmStatusDto> GetStatusAsync(CancellationToken ct = default)
        {
            return Task.FromResult(new LlmStatusDto { Provider = "test", Model = "test", Reachable = false });
        }
    }
}
