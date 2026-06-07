using FluentAssertions;
using MES.AI.Pro.Agents;
using MES.AI.Pro.Models;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Interfaces.Services;
using Moq;

namespace MES.Tests.Unit.AI;

public class ProcessParameterAgentTests
{
    private readonly Mock<ILlmGateway> _llmMock = new();
    private readonly Mock<IVectorStoreService> _vectorMock = new();
    private readonly ProcessParameterAgent _agent;

    public ProcessParameterAgentTests()
    {
        _agent = new ProcessParameterAgent(_llmMock.Object, _vectorMock.Object);
    }

    [Fact]
    public async Task RecommendParametersAsync_ReturnsRecommendation()
    {
        var constraints = new Dictionary<string, double> { ["max_temp"] = 200, ["max_pressure"] = 50 };
        _llmMock.Setup(x => x.GenerateEmbeddingAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new float[] { 0.1f });
        _vectorMock.Setup(x => x.SearchAsync("process-parameters", It.IsAny<float[]>(), 5, It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);
        _llmMock.Setup(x => x.GenerateJsonAsync<TracedProcessParameterRecommendation>(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new TracedProcessParameterRecommendation
            {
                OptimalParameters = new() { ["temperature"] = 180, ["pressure"] = 35 },
                QualityControlPoints = ["温度", "压力"],
                RecommendationReason = "相似工序历史数据"
            });

        var result = await _agent.RecommendParametersAsync("PROD-A1", "注塑", constraints);

        result.Should().NotBeNull();
        result.OptimalParameters.Should().ContainKey("temperature");
        result.OptimalParameters["temperature"].Should().Be(180);
    }

    [Fact]
    public async Task OptimizeParametersAsync_ReturnsOptimization()
    {
        var currentParams = new Dictionary<string, double> { ["temperature"] = 190, ["pressure"] = 40 };
        _llmMock.Setup(x => x.GenerateJsonAsync<TracedProcessParameterRecommendation>(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new TracedProcessParameterRecommendation
            {
                OptimalParameters = new() { ["temperature"] = 185 },
                SensitivityAnalysis = [new() { ParameterName = "temperature", Sensitivity = 0.8 }],
                RecommendationReason = "质量反馈优化"
            });

        var result = await _agent.OptimizeParametersAsync("PROD-A1", "注塑", currentParams, []);

        result.Should().NotBeNull();
        result.OptimalParameters["temperature"].Should().Be(185);
        result.SensitivityAnalysis.Should().Contain(s => s.ParameterName == "temperature");
    }

    [Fact]
    public async Task FindBestProcessMatchAsync_ReturnsMatch()
    {
        var targets = new Dictionary<string, double> { ["hardness"] = 45, ["tensile"] = 600 };
        _llmMock.Setup(x => x.GenerateEmbeddingAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new float[] { 0.1f });
        _vectorMock.Setup(x => x.SearchAsync("process-parameters", It.IsAny<float[]>(), 5, It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        var result = await _agent.FindBestProcessMatchAsync("PROD-A1", targets);

        result.Should().NotBeNull();
        result.ProductCode.Should().Be("PROD-A1");
        result.Confidence.Should().Be(0.5); // No matches found
    }

    [Fact]
    public async Task FindBestProcessMatchAsync_PassesCancellationTokenToVectorSearch()
    {
        using var cts = new CancellationTokenSource();
        var targets = new Dictionary<string, double> { ["hardness"] = 45 };
        _llmMock.Setup(x => x.GenerateEmbeddingAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new float[] { 0.1f });
        _vectorMock.Setup(x => x.SearchAsync("process-parameters", It.IsAny<float[]>(), 5, It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        await _agent.FindBestProcessMatchAsync("PROD-A1", targets, cts.Token);

        _vectorMock.Verify(
            x => x.SearchAsync("process-parameters", It.IsAny<float[]>(), 5, cts.Token),
            Times.Once);
    }

    [Fact]
    public async Task RecommendParametersAsync_WhenLlmReturnsNull_FallsBackToEmptyRecommendationWithTrace()
    {
        var constraints = new Dictionary<string, double> { ["max_temp"] = 200 };
        _llmMock.Setup(x => x.GenerateEmbeddingAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new float[] { 0.1f });
        _vectorMock.Setup(x => x.SearchAsync("process-parameters", It.IsAny<float[]>(), 5, It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        var result = await _agent.RecommendParametersAsync("PROD-A1", "注塑", constraints);

        result.OptimalParameters.Should().BeEmpty();
        result.As<TracedProcessParameterRecommendation>().AiDecisionTrace.Confidence.Should().Be(0.78m);
    }

    [Fact]
    public async Task RecommendParametersAsync_WhenLlmThrows_FallsBackToEmptyRecommendationWithTrace()
    {
        var constraints = new Dictionary<string, double> { ["max_temp"] = 200 };
        _llmMock.Setup(x => x.GenerateEmbeddingAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new float[] { 0.1f });
        _vectorMock.Setup(x => x.SearchAsync("process-parameters", It.IsAny<float[]>(), 5, It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);
        _llmMock.Setup(x => x.GenerateJsonAsync<TracedProcessParameterRecommendation>(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("LLM unavailable"));

        var result = await _agent.RecommendParametersAsync("PROD-A1", "注塑", constraints);

        result.RecommendationReason.Should().Contain("LLM 调用失败");
        result.As<TracedProcessParameterRecommendation>().AiDecisionTrace.ModelName.Should().Be("ProcessParameterReasoningFallback");
    }

    [Fact]
    public async Task RecommendParametersAsync_WhenRetrievalThrows_FallsBackToEmptyRecommendationWithTrace()
    {
        var constraints = new Dictionary<string, double> { ["max_temp"] = 200 };
        _llmMock.Setup(x => x.GenerateEmbeddingAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("embedding unavailable"));

        var result = await _agent.RecommendParametersAsync("PROD-A1", "注塑", constraints);

        result.RecommendationReason.Should().Contain("检索失败");
        result.As<TracedProcessParameterRecommendation>().AiDecisionTrace.ModelName.Should().Be("ProcessParameterReasoningFallback");
    }

    [Fact]
    public async Task RecommendParametersAsync_WhenPromptWouldOverflow_SendsBoundedPromptAndTraceTokens()
    {
        string? capturedPrompt = null;
        var constraints = new Dictionary<string, double> { ["max_temp"] = 200 };
        _llmMock.Setup(x => x.GenerateEmbeddingAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new float[] { 0.1f });
        _vectorMock.Setup(x => x.SearchAsync("process-parameters", It.IsAny<float[]>(), 5, It.IsAny<CancellationToken>()))
            .ReturnsAsync([
                new DocumentChunk { Id = "case-1", Content = new string('P', 24000), Source = "长工艺案例" }
            ]);
        _llmMock.Setup(x => x.GenerateJsonAsync<TracedProcessParameterRecommendation>(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .Callback<string, CancellationToken>((prompt, _) => capturedPrompt = prompt)
            .ReturnsAsync(new TracedProcessParameterRecommendation { RecommendationReason = "基于截断案例" });

        var result = await _agent.RecommendParametersAsync(new string('C', 12000), "注塑", constraints);

        capturedPrompt.Should().NotBeNull();
        (capturedPrompt ?? string.Empty).Length.Should().BeLessThanOrEqualTo(16_000);
        result.As<TracedProcessParameterRecommendation>().AiDecisionTrace.TokensInput.Should().BeLessThanOrEqualTo(4000);
    }
}
