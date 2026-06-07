using FluentAssertions;
using MES.AI.Pro.Agents;
using MES.AI.Pro.Models;
using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Interfaces.Services;
using Moq;

namespace MES.Tests.Unit.AI;

public class MaintenanceAgentTests
{
    private readonly Mock<ILlmGateway> _llmMock = new();
    private readonly Mock<IVectorStoreService> _vectorMock = new();
    private readonly MaintenanceAgent _agent;

    public MaintenanceAgentTests()
    {
        _agent = new MaintenanceAgent(_llmMock.Object, _vectorMock.Object);
    }

    [Fact]
    public async Task PredictFailureAsync_ReturnsPrediction()
    {
        var telemetry = new List<EquipmentTelemetry>
        {
            new() { EquipmentId = "EQ1", Timestamp = DateTime.UtcNow, Parameters = new() { ["temperature"] = 85.0 } }
        };
        _llmMock.Setup(x => x.GenerateEmbeddingAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new float[] { 0.1f });
        _vectorMock.Setup(x => x.SearchAsync("equipment-failures", It.IsAny<float[]>(), 5, It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);
        _llmMock.Setup(x => x.GenerateJsonAsync<FailurePredictionResult>(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new FailurePredictionResult
            {
                EquipmentId = "EQ1",
                PredictedFailures = [new() { FailureType = "轴承磨损", Confidence = 0.78 }],
                Confidence = 0.78,
                Reasoning = "温度持续升高"
            });

        var result = await _agent.PredictFailureAsync("EQ1", telemetry);

        result.Should().NotBeNull();
        result.EquipmentId.Should().Be("EQ1");
        result.PredictedFailures.Should().Contain(f => f.FailureType == "轴承磨损");
        result.Confidence.Should().Be(0.78);
    }

    [Fact]
    public async Task RecommendMaintenanceAsync_ReturnsRecommendation()
    {
        var equipment = Equipment.Create("CNC-001", "CNC加工中心", "CNC", "WS-001", "车间", 100);
        var predictedFailure = new FailurePredictionResult
        {
            EquipmentId = "EQ1",
            AiDecisionTrace = new() { Confidence = 0.72m }
        };
        _llmMock.Setup(x => x.GenerateJsonAsync<MaintenanceRecommendationResult>(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new MaintenanceRecommendationResult
            {
                EquipmentId = "EQ1",
                RecommendedDate = DateTime.UtcNow.AddDays(7),
                Tasks = [new() { TaskName = "更换轴承", Description = "更换主轴轴承" }],
                Reasoning = "预测到轴承磨损"
            });

        var result = await _agent.RecommendMaintenanceAsync(
            equipment, runHours: 5000, pastMaintenance: [], predictedFailure);

        result.Should().NotBeNull();
        result.Tasks.Should().Contain(t => t.TaskName == "更换轴承");
    }

    [Fact]
    public async Task AnalyzeTelemetryAnomalyAsync_DetectsAnomalies()
    {
        var telemetry = new List<EquipmentTelemetry>
        {
            new() { EquipmentId = "EQ1", Timestamp = DateTime.UtcNow.AddHours(-1), Parameters = new() { ["temperature"] = 75.0, ["vibration"] = 1.0 } },
            new() { EquipmentId = "EQ1", Timestamp = DateTime.UtcNow, Parameters = new() { ["temperature"] = 95.0, ["vibration"] = 2.5 } },
        };
        _llmMock.Setup(x => x.GenerateJsonAsync<TelemetryAnomalyAnalysis>(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new TelemetryAnomalyAnalysis
            {
                EquipmentId = "EQ1",
                Anomalies = [new() { ParameterName = "temperature", Value = 95.0, Deviation = 0.27, Severity = "warning" }],
                Severity = "warning",
                RecommendedAction = "检查冷却系统"
            });

        var result = await _agent.AnalyzeTelemetryAnomalyAsync("EQ1", telemetry);

        result.Should().NotBeNull();
        result.Anomalies.Should().Contain(a => a.ParameterName == "temperature");
        result.RecommendedAction.Should().Be("检查冷却系统");
    }

    [Fact]
    public async Task PredictFailureAsync_WhenLlmReturnsNull_FallsBackToEmptyPredictionWithTrace()
    {
        var telemetry = CreateTelemetry("EQ1", "temperature", 85.0);
        _llmMock.Setup(x => x.GenerateEmbeddingAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new float[] { 0.1f });
        _vectorMock.Setup(x => x.SearchAsync("equipment-failures", It.IsAny<float[]>(), 5, It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        var result = await _agent.PredictFailureAsync("EQ1", telemetry);

        result.EquipmentId.Should().Be("EQ1");
        result.PredictedFailures.Should().BeEmpty();
        result.AiDecisionTrace.Confidence.Should().Be(0.72m);
    }

    [Fact]
    public async Task PredictFailureAsync_PassesCancellationTokenToVectorSearch()
    {
        using var cts = new CancellationTokenSource();
        var telemetry = CreateTelemetry("EQ1", "temperature", 85.0);
        _llmMock.Setup(x => x.GenerateEmbeddingAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new float[] { 0.1f });
        _vectorMock.Setup(x => x.SearchAsync("equipment-failures", It.IsAny<float[]>(), 5, It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        await _agent.PredictFailureAsync("EQ1", telemetry, cts.Token);

        _vectorMock.Verify(
            x => x.SearchAsync("equipment-failures", It.IsAny<float[]>(), 5, cts.Token),
            Times.Once);
    }

    [Fact]
    public async Task PredictFailureAsync_WhenLlmThrows_FallsBackToEmptyPredictionWithTrace()
    {
        var telemetry = CreateTelemetry("EQ1", "temperature", 85.0);
        _llmMock.Setup(x => x.GenerateEmbeddingAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new float[] { 0.1f });
        _vectorMock.Setup(x => x.SearchAsync("equipment-failures", It.IsAny<float[]>(), 5, It.IsAny<CancellationToken>()))
            .ReturnsAsync([
                new DocumentChunk { Id = "case-1", Content = "历史高温故障", Source = "维修记录" }
            ]);
        _llmMock.Setup(x => x.GenerateJsonAsync<FailurePredictionResult>(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("LLM unavailable"));

        var result = await _agent.PredictFailureAsync("EQ1", telemetry);

        result.EquipmentId.Should().Be("EQ1");
        result.Reasoning.Should().Contain("LLM 调用失败");
        result.AiDecisionTrace.ModelName.Should().Be("MaintenanceReasoningFallback");
    }

    [Fact]
    public async Task PredictFailureAsync_WhenRetrievalThrows_FallsBackToEmptyPredictionWithTrace()
    {
        var telemetry = CreateTelemetry("EQ1", "temperature", 85.0);
        _llmMock.Setup(x => x.GenerateEmbeddingAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("embedding unavailable"));

        var result = await _agent.PredictFailureAsync("EQ1", telemetry);

        result.EquipmentId.Should().Be("EQ1");
        result.Reasoning.Should().Contain("检索失败");
        result.AiDecisionTrace.ModelName.Should().Be("MaintenanceReasoningFallback");
    }

    [Fact]
    public async Task PredictFailureAsync_WhenPromptWouldOverflow_SendsBoundedPromptAndTraceTokens()
    {
        string? capturedPrompt = null;
        var telemetry = CreateTelemetry("EQ1", "temperature", 85.0);
        _llmMock.Setup(x => x.GenerateEmbeddingAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new float[] { 0.1f });
        _vectorMock.Setup(x => x.SearchAsync("equipment-failures", It.IsAny<float[]>(), 5, It.IsAny<CancellationToken>()))
            .ReturnsAsync([
                new DocumentChunk { Id = "case-1", Content = new string('F', 24000), Source = "长维修记录" }
            ]);
        _llmMock.Setup(x => x.GenerateJsonAsync<FailurePredictionResult>(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .Callback<string, CancellationToken>((prompt, _) => capturedPrompt = prompt)
            .ReturnsAsync(new FailurePredictionResult { Confidence = 0.74 });

        var result = await _agent.PredictFailureAsync("EQ1", telemetry);

        capturedPrompt.Should().NotBeNull();
        (capturedPrompt ?? string.Empty).Length.Should().BeLessThanOrEqualTo(16_000);
        result.AiDecisionTrace.TokensInput.Should().BeLessThanOrEqualTo(4000);
    }

    private static List<EquipmentTelemetry> CreateTelemetry(string equipmentId, string parameterName, double value)
    {
        return
        [
            new() { EquipmentId = equipmentId, Timestamp = DateTime.UtcNow, Parameters = new() { [parameterName] = value } }
        ];
    }
}
