using System.Diagnostics;
using System.Text.Json;
using MES.AI.Pro.Models;
using MES.AI.Pro.Services;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Interfaces.Services;

namespace MES.AI.Pro.Agents;

public class ProcessParameterAgent
{
    private const string AgentName = nameof(ProcessParameterAgent);
    private const string AgentVersion = "1.0.0-phase1c";

    private readonly ILlmGateway _llmGateway;
    private readonly IVectorStoreService _vectorStore;

    public ProcessParameterAgent(ILlmGateway llmGateway, IVectorStoreService vectorStore)
    {
        _llmGateway = llmGateway;
        _vectorStore = vectorStore;
    }

    public async Task<ProcessParameterRecommendation> RecommendParametersAsync(
        string productCode,
        string processName,
        Dictionary<string, double> constraints,
        CancellationToken ct = default)
    {
        var sw = Stopwatch.StartNew();
        var similarCases = await SearchAsync("process-parameters", $"product={productCode};process={processName};constraints={JsonSerializer.Serialize(constraints)}", ct);
        var context = JsonSerializer.Serialize(similarCases.Select(ToContext));
        var prompt = $"""
            请基于相似产品和工序的历史参数推荐最优工艺参数。

            产品：{productCode}
            工序：{processName}
            约束：{JsonSerializer.Serialize(constraints)}
            相似参数案例：{context}

            请输出JSON，字段包括：OptimalParameters、SensitivityAnalysis、QualityControlPoints、RecommendationReason。
            """;

        var result = await _llmGateway.GenerateJsonAsync<TracedProcessParameterRecommendation>(prompt, ct)
            ?? new TracedProcessParameterRecommendation();

        result.AiDecisionTrace = BuildTrace(
            prompt,
            context,
            $"product={productCode};process={processName};constraints={constraints.Count}",
            $"parameters={result.OptimalParameters.Count};controlPoints={result.QualityControlPoints.Count}",
            0.78m,
            sw.ElapsedMilliseconds,
            "process-parameters",
            $"product={productCode};process={processName}");

        return result;
    }

    public async Task<ProcessParameterRecommendation> OptimizeParametersAsync(
        string productCode,
        string processName,
        Dictionary<string, double> currentParameters,
        List<InspectionResult> qualityResults,
        CancellationToken ct = default)
    {
        var sw = Stopwatch.StartNew();
        var context = JsonSerializer.Serialize(new { currentParameters, qualityResults });
        var prompt = $"""
            请根据当前工艺参数和质量结果提出参数优化建议。

            产品：{productCode}
            工序：{processName}
            当前参数与质量结果：
            {context}

            请输出JSON，字段包括：OptimalParameters、SensitivityAnalysis、QualityControlPoints、RecommendationReason。
            """;

        var result = await _llmGateway.GenerateJsonAsync<TracedProcessParameterRecommendation>(prompt, ct)
            ?? new TracedProcessParameterRecommendation();

        result.AiDecisionTrace = BuildTrace(
            prompt,
            context,
            $"product={productCode};process={processName};parameters={currentParameters.Count};qualityResults={qualityResults.Count}",
            $"parameters={result.OptimalParameters.Count};reason={result.RecommendationReason}",
            0.8m,
            sw.ElapsedMilliseconds,
            "quality-results;current-parameters",
            $"product={productCode};process={processName}");

        return result;
    }

    public async Task<ProcessMatchResult> FindBestProcessMatchAsync(
        string productCode,
        Dictionary<string, double> targetCharacteristics,
        CancellationToken ct = default)
    {
        var sw = Stopwatch.StartNew();
        var query = $"best process match product={productCode};target={JsonSerializer.Serialize(targetCharacteristics)}";
        var matches = await SearchAsync("process-parameters", query, ct);
        var similarCases = matches.Select(ToSimilarCase).ToList();
        var bestParameters = ExtractParameters(matches.FirstOrDefault());
        var context = JsonSerializer.Serialize(similarCases);

        return new ProcessMatchResult
        {
            ProductCode = productCode,
            Parameters = bestParameters,
            SimilarCases = similarCases,
            Confidence = matches.Count == 0 ? 0.5 : 0.82,
            AiDecisionTrace = BuildTrace(
                query,
                context,
                $"product={productCode};targets={targetCharacteristics.Count}",
                $"matches={matches.Count};parameters={bestParameters.Count}",
                matches.Count == 0 ? 0.5m : 0.82m,
                sw.ElapsedMilliseconds,
                "process-parameters",
                $"product={productCode}")
        };
    }

    private async Task<List<DocumentChunk>> SearchAsync(string collectionName, string query, CancellationToken ct)
    {
        var embedding = await _llmGateway.GenerateEmbeddingAsync(query, ct);
        return await _vectorStore.SearchAsync(collectionName, embedding, 5);
    }

    private static object ToContext(DocumentChunk chunk)
    {
        return new { chunk.Id, chunk.Content, chunk.Metadata, chunk.Source };
    }

    private static SimilarCase ToSimilarCase(DocumentChunk chunk)
    {
        chunk.Metadata.TryGetValue("correctiveAction", out var correctiveAction);
        return new SimilarCase { CaseId = chunk.Id, Description = chunk.Content, CorrectiveAction = correctiveAction ?? string.Empty };
    }

    private static Dictionary<string, double> ExtractParameters(DocumentChunk? chunk)
    {
        if (chunk == null || !chunk.Metadata.TryGetValue("parameters", out var parametersJson))
        {
            return new Dictionary<string, double>();
        }

        return JsonSerializer.Deserialize<Dictionary<string, double>>(parametersJson) ?? new Dictionary<string, double>();
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
            "ProcessParameterReasoning",
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
