using MES.AI.Pro.Models;
using MES.AI.Pro.Services;
using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Interfaces.Services;
using System.Diagnostics;
using System.Text.Json;

namespace MES.AI.Pro.Agents;

public class MaintenanceAgent
{
    private const string AgentName = nameof(MaintenanceAgent);
    private const string AgentVersion = "1.0.0-phase1c";

    private readonly ILlmGateway _llmGateway;
    private readonly IVectorStoreService _vectorStore;

    public MaintenanceAgent(ILlmGateway llmGateway, IVectorStoreService vectorStore)
    {
        _llmGateway = llmGateway;
        _vectorStore = vectorStore;
    }

    public async Task<FailurePredictionResult> PredictFailureAsync(
        string equipmentId,
        List<EquipmentTelemetry> telemetry,
        CancellationToken ct = default)
    {
        var sw = Stopwatch.StartNew();
        var trendSummary = BuildTelemetrySummary(telemetry);
        var historicalPatterns = await SearchAsync("equipment-failures", $"equipment={equipmentId};telemetry={trendSummary}", ct);
        var context = JsonSerializer.Serialize(historicalPatterns.Select(ToContext));
        var prompt = $"""
            你是设备预测性维护专家。请基于遥测趋势和历史故障模式预测潜在失效。

            设备：{equipmentId}
            遥测趋势：{trendSummary}

            相似历史故障模式：
            {context}

            请输出JSON，字段包括：EquipmentId、PredictedFailures、Confidence、Reasoning。
            """;

        var result = await _llmGateway.GenerateJsonAsync<FailurePredictionResult>(prompt, ct)
            ?? new FailurePredictionResult();

        result.EquipmentId = equipmentId;
        result.AiDecisionTrace = BuildTrace(
            prompt,
            context,
            $"equipment={equipmentId};telemetryPoints={telemetry.Count}",
            $"failures={result.PredictedFailures.Count};confidence={result.Confidence:F2}",
            result.Confidence <= 0 ? 0.72m : (decimal)Math.Clamp(result.Confidence, 0.1, 1.0),
            sw.ElapsedMilliseconds,
            "equipment-failures",
            $"equipment={equipmentId}");

        return result;
    }

    public async Task<MaintenanceRecommendationResult> RecommendMaintenanceAsync(
        Equipment equipment,
        double runHours,
        List<MaintenanceRecord> pastMaintenance,
        FailurePredictionResult predictedFailure,
        CancellationToken ct = default)
    {
        var sw = Stopwatch.StartNew();
        var context = JsonSerializer.Serialize(new
        {
            equipment.EquipmentCode,
            equipment.EquipmentType,
            equipment.LastMaintenanceDate,
            equipment.NextMaintenanceDate,
            runHours,
            pastMaintenance = pastMaintenance.Select(m => new { m.MaintenanceType, m.Description, m.StartTime, m.Result }),
            predictedFailure.PredictedFailures
        });
        var prompt = $"""
            请基于运行小时、历史维护记录和预测故障给出维护建议。

            设备维护上下文：
            {context}

            请输出JSON，字段包括：EquipmentId、RecommendedDate、Tasks、Reasoning。
            """;

        var result = await _llmGateway.GenerateJsonAsync<MaintenanceRecommendationResult>(prompt, ct)
            ?? new MaintenanceRecommendationResult();

        result.EquipmentId = equipment.Id;
        result.AiDecisionTrace = BuildTrace(
            prompt,
            context,
            $"equipment={equipment.Id};runHours={runHours};maintenanceRecords={pastMaintenance.Count}",
            $"tasks={result.Tasks.Count};date={result.RecommendedDate:O}",
            predictedFailure.AiDecisionTrace.Confidence ?? 0.72m,
            sw.ElapsedMilliseconds,
            "maintenance-records;failure-prediction",
            $"equipment={equipment.Id};equipmentCode={equipment.EquipmentCode}");

        return result;
    }

    public async Task<TelemetryAnomalyAnalysis> AnalyzeTelemetryAnomalyAsync(
        string equipmentId,
        List<EquipmentTelemetry> telemetry,
        CancellationToken ct = default)
    {
        var sw = Stopwatch.StartNew();
        var baseline = BuildBaseline(telemetry);
        var current = telemetry.OrderByDescending(t => t.Timestamp).FirstOrDefault()?.Parameters ?? new Dictionary<string, double>();
        var anomalyStats = current.Select(kv => new
        {
            Parameter = kv.Key,
            Value = kv.Value,
            Expected = baseline.TryGetValue(kv.Key, out var expected) ? expected : kv.Value,
            Deviation = baseline.TryGetValue(kv.Key, out var expectedValue) && expectedValue != 0 ? (kv.Value - expectedValue) / expectedValue : 0
        }).ToList();
        var context = JsonSerializer.Serialize(anomalyStats);
        var prompt = $"""
            请比较当前遥测与历史基线，识别异常参数并分类严重度。

            设备：{equipmentId}
            基线与偏差：
            {context}

            请输出JSON，字段包括：EquipmentId、Anomalies、Severity、RecommendedAction。
            """;

        var result = await _llmGateway.GenerateJsonAsync<TelemetryAnomalyAnalysis>(prompt, ct)
            ?? new TelemetryAnomalyAnalysis();

        result.EquipmentId = equipmentId;
        result.AiDecisionTrace = BuildTrace(
            prompt,
            context,
            $"equipment={equipmentId};telemetryPoints={telemetry.Count}",
            $"anomalies={result.Anomalies.Count};severity={result.Severity}",
            0.8m,
            sw.ElapsedMilliseconds,
            "telemetry-baseline",
            $"equipment={equipmentId}");

        return result;
    }

    private async Task<List<DocumentChunk>> SearchAsync(string collectionName, string query, CancellationToken ct)
    {
        var embedding = await _llmGateway.GenerateEmbeddingAsync(query, ct);
        return await _vectorStore.SearchAsync(collectionName, embedding, 5);
    }

    private static string BuildTelemetrySummary(List<EquipmentTelemetry> telemetry)
    {
        var summary = telemetry
            .SelectMany(t => t.Parameters.Select(p => new { p.Key, p.Value }))
            .GroupBy(p => p.Key)
            .Select(g => new { Parameter = g.Key, Min = g.Min(x => x.Value), Max = g.Max(x => x.Value), Avg = g.Average(x => x.Value) });

        return JsonSerializer.Serialize(summary);
    }

    private static Dictionary<string, double> BuildBaseline(List<EquipmentTelemetry> telemetry)
    {
        return telemetry
            .SelectMany(t => t.Parameters)
            .GroupBy(p => p.Key)
            .ToDictionary(g => g.Key, g => g.Average(x => x.Value));
    }

    private static object ToContext(DocumentChunk chunk)
    {
        return new { chunk.Id, chunk.Content, chunk.Metadata, chunk.Source };
    }

    private static MES.Domain.ValueObjects.AiDecisionTrace BuildTrace(
        string prompt,
        string context,
        string inputSummary,
        string outputSummary,
        decimal confidence,
        long latencyMs,
        string sourceReferences,
        string relatedBusinessKeys)
    {
        return AiTraceFactory.Create(
            AgentName,
            AgentVersion,
            "ConfiguredLlmGateway",
            "MaintenanceReasoning",
            "unknown",
            prompt,
            context,
            inputSummary,
            outputSummary,
            confidence,
            AiTraceFactory.EstimateTokens(prompt),
            AiTraceFactory.EstimateTokens(outputSummary),
            (int)latencyMs,
            sourceReferences,
            relatedBusinessKeys);
    }
}
