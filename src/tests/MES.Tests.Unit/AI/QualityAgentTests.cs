using FluentAssertions;
using MES.AI.Pro.Agents;
using MES.AI.Pro.Models;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Entities.Quality;
using MES.Domain.Interfaces.Services;
using Moq;

namespace MES.Tests.Unit.AI;

public class QualityAgentTests
{
    private readonly Mock<ILlmGateway> _llmMock = new();
    private readonly Mock<IOnnxModelService> _onnxMock = new();
    private readonly Mock<IVectorStoreService> _vectorMock = new();
    private readonly QualityAgent _agent;

    public QualityAgentTests()
    {
        _agent = new QualityAgent(_llmMock.Object, _onnxMock.Object, _vectorMock.Object);
    }

    [Fact]
    public async Task InspectWithAIAsync_ReturnsInspectionResult()
    {
        var imageData = new byte[] { 0x01, 0x02, 0x03 };
        _vectorMock.Setup(x => x.SearchAsync(It.IsAny<string>(), It.IsAny<float[]>(), It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);
        _llmMock.Setup(x => x.GenerateEmbeddingAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new float[] { 0.1f, 0.2f });
        _llmMock.Setup(x => x.GenerateJsonAsync<TracedInspectionResult>(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new TracedInspectionResult
            {
                IsPassed = true,
                Defects = [],
                Recommendation = "质检通过"
            });

        var result = await _agent.InspectWithAIAsync(imageData, "PROD-A1", "终检");

        result.Should().NotBeNull();
        result.IsPassed.Should().BeTrue();
        result.Recommendation.Should().Be("质检通过");
    }

    [Fact]
    public async Task AnalyzeQualityIssueAsync_ReturnsRootCauseAnalysis()
    {
        var inspection = QualityInspection.Create(
            "WO-001", "PROD-A1", "车削", "终检",
            inspectionQuantity: 100, qualifiedQuantity: 95, defectQuantity: 5,
            inspectorId: "操作员1");
        _vectorMock.Setup(x => x.SearchAsync(It.IsAny<string>(), It.IsAny<float[]>(), It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);
        _llmMock.Setup(x => x.GenerateEmbeddingAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new float[] { 0.1f, 0.2f });
        _llmMock.Setup(x => x.GenerateJsonAsync<TracedRootCauseAnalysis>(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new TracedRootCauseAnalysis
            {
                RootCauses = [new RootCause { Cause = "刀具磨损", Probability = 0.85 }],
                CorrectiveActions = ["更换刀具"],
                PreventiveMeasures = ["缩短刀具更换周期"]
            });

        var result = await _agent.AnalyzeQualityIssueAsync(inspection);

        result.Should().NotBeNull();
        result.RootCauses.Should().Contain(r => r.Cause == "刀具磨损");
        result.CorrectiveActions.Should().Contain("更换刀具");
    }

    [Fact]
    public async Task AnalyzeSpcTrendAsync_ReturnsSpcAlert()
    {
        var data = new List<double> { 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 11.0 };
        _llmMock.Setup(x => x.GenerateJsonAsync<TracedSpcAlert>(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new TracedSpcAlert
            {
                HasTrend = true,
                HasDrift = false,
                TrendDirection = "upward",
                RecommendedAction = "检查刀具磨损"
            });

        var result = await _agent.AnalyzeSpcTrendAsync(data, usl: 12.0, lsl: 8.0, cl: 10.0);

        result.Should().NotBeNull();
        result.HasTrend.Should().BeTrue();
        result.RecommendedAction.Should().NotBeNullOrEmpty();
        // TracedSpcAlert 包含 Mean/Cpk，但返回类型为 SpcAlert
        result.As<MES.AI.Pro.Models.TracedSpcAlert>().Mean.Should().BeGreaterThan(0);
        result.As<MES.AI.Pro.Models.TracedSpcAlert>().Cpk.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task InspectWithAIAsync_WhenLlmReturnsNull_FallsBackToManualReviewResultWithTrace()
    {
        _vectorMock.Setup(x => x.SearchAsync(It.IsAny<string>(), It.IsAny<float[]>(), It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);
        _llmMock.Setup(x => x.GenerateEmbeddingAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new float[] { 0.1f, 0.2f });

        var result = await _agent.InspectWithAIAsync([0x01], "PROD-A1", "终检");

        result.IsPassed.Should().BeFalse();
        result.Recommendation.Should().Contain("人工复核");
        result.As<TracedInspectionResult>().AiDecisionTrace.Confidence.Should().Be(0.78m);
    }

    [Fact]
    public async Task InspectWithAIAsync_PassesCancellationTokenToVectorSearch()
    {
        using var cts = new CancellationTokenSource();
        _vectorMock.Setup(x => x.SearchAsync("quality-defects", It.IsAny<float[]>(), 5, It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);
        _llmMock.Setup(x => x.GenerateEmbeddingAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new float[] { 0.1f, 0.2f });

        await _agent.InspectWithAIAsync([0x01], "PROD-A1", "终检", cts.Token);

        _vectorMock.Verify(
            x => x.SearchAsync("quality-defects", It.IsAny<float[]>(), 5, cts.Token),
            Times.Once);
    }

    [Fact]
    public async Task InspectWithAIAsync_WhenLlmThrows_FallsBackToManualReviewResultWithTrace()
    {
        _vectorMock.Setup(x => x.SearchAsync(It.IsAny<string>(), It.IsAny<float[]>(), It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);
        _llmMock.Setup(x => x.GenerateEmbeddingAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new float[] { 0.1f, 0.2f });
        _llmMock.Setup(x => x.GenerateJsonAsync<TracedInspectionResult>(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("LLM unavailable"));

        var result = await _agent.InspectWithAIAsync([0x01], "PROD-A1", "终检");

        result.IsPassed.Should().BeFalse();
        result.Recommendation.Should().Contain("保守不通过");
        result.As<TracedInspectionResult>().AiDecisionTrace.ModelName.Should().Be("QualityReasoningFallback");
    }

    [Fact]
    public async Task InspectWithAIAsync_WhenRetrievalThrows_FallsBackToManualReviewResultWithTrace()
    {
        _llmMock.Setup(x => x.GenerateEmbeddingAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("embedding unavailable"));

        var result = await _agent.InspectWithAIAsync([0x01], "PROD-A1", "终检");

        result.IsPassed.Should().BeFalse();
        result.Recommendation.Should().Contain("检索失败");
        result.As<TracedInspectionResult>().AiDecisionTrace.ModelName.Should().Be("QualityReasoningFallback");
    }

    [Fact]
    public async Task InspectWithAIAsync_WhenPromptWouldOverflow_SendsBoundedPromptAndTraceTokens()
    {
        string? capturedPrompt = null;
        _vectorMock.Setup(x => x.SearchAsync(It.IsAny<string>(), It.IsAny<float[]>(), It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([
                new DocumentChunk { Id = "case-1", Content = new string('Q', 24000), Source = "长缺陷案例" }
            ]);
        _llmMock.Setup(x => x.GenerateEmbeddingAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new float[] { 0.1f, 0.2f });
        _llmMock.Setup(x => x.GenerateJsonAsync<TracedInspectionResult>(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .Callback<string, CancellationToken>((prompt, _) => capturedPrompt = prompt)
            .ReturnsAsync(new TracedInspectionResult { IsPassed = true });

        var result = await _agent.InspectWithAIAsync([0x01], new string('P', 12000), "终检");

        capturedPrompt.Should().NotBeNull();
        (capturedPrompt ?? string.Empty).Length.Should().BeLessThanOrEqualTo(16_000);
        result.As<TracedInspectionResult>().AiDecisionTrace.TokensInput.Should().BeLessThanOrEqualTo(4000);
    }
}
