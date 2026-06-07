using System.Diagnostics;
using System.Text.Json;
using MES.AI.Pro.Models;
using MES.AI.Pro.Services;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Entities.Quality;
using MES.Domain.Interfaces.Services;

namespace MES.AI.Pro.Agents;

/// <summary>
/// 智能质检Agent
/// </summary>
public class QualityAgent
{
    private const string AgentName = nameof(QualityAgent);
    private const string AgentVersion = "1.1.0-phase1c";
    private const string ModelProvider = "ConfiguredLlmGateway";

    private readonly ILlmGateway _llmGateway;
    private readonly IOnnxModelService _onnxService;
    private readonly IVectorStoreService _vectorStore;

    public QualityAgent(
        ILlmGateway llmGateway,
        IOnnxModelService onnxService,
        IVectorStoreService vectorStore)
    {
        _llmGateway = llmGateway;
        _onnxService = onnxService;
        _vectorStore = vectorStore;
    }

    /// <summary>
    /// AI视觉缺陷检测
    /// </summary>
    public async Task<InspectionResult> InspectWithAIAsync(
        byte[] imageData,
        string productCode,
        string inspectionPoint,
        CancellationToken ct = default)
    {
        var sw = Stopwatch.StartNew();
        var query = $"quality visual inspection product={productCode} point={inspectionPoint} imageBytes={imageData.Length}";
        var modelName = "QualityReasoning";
        string retrievalError = string.Empty;
        List<DocumentChunk> similarCases;
        try
        {
            similarCases = await SearchSimilarAsync("quality-defects", query, ct);
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            modelName = "QualityReasoningFallback";
            retrievalError = $"检索失败（{ex.GetType().Name}），返回人工复核前的保守不通过结果。";
            similarCases = [];
        }

        var context = JsonSerializer.Serialize(similarCases.Select(ToSimilarCase));
        var prompt = AiPromptBudget.Bound($"""
            你是MES视觉质检专家。请结合历史缺陷案例判断当前图片是否可能通过质检。

            当前检验：
            - 产品：{productCode}
            - 检验点：{inspectionPoint}
            - 图片字节数：{imageData.Length}

            相似历史缺陷案例：
            {context}

            ONNX视觉模型仍为占位能力，当前判断以历史案例和LLM推理为主。

            请输出JSON，字段包括：IsPassed、Defects、SimilarHistoricalCases、Recommendation。
            """);

        // TODO: Replace this placeholder with ONNX tensor preprocessing and model inference.
        _ = _onnxService;

        TracedInspectionResult result;
        if (!string.IsNullOrEmpty(retrievalError))
        {
            result = BuildManualReviewResult(retrievalError);
        }
        else
        {
            try
            {
                result = await _llmGateway.GenerateJsonAsync<TracedInspectionResult>(prompt, ct);
                if (result is null)
                {
                    modelName = "QualityReasoningFallback";
                    result = BuildManualReviewResult("LLM 返回空结果，需人工复核。");
                }
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                modelName = "QualityReasoningFallback";
                result = BuildManualReviewResult(
                    $"LLM 调用失败（{ex.GetType().Name}），返回人工复核前的保守不通过结果。");
            }
        }

        result.SimilarHistoricalCases = similarCases.Select(ToSimilarCase).ToList();
        result.AiDecisionTrace = BuildTrace(
            prompt,
            context,
            $"product={productCode};point={inspectionPoint};imageBytes={imageData.Length}",
            $"passed={result.IsPassed};defects={result.Defects.Count}",
            0.78m,
            sw.ElapsedMilliseconds,
            "quality-defects",
            $"product={productCode};inspectionPoint={inspectionPoint}",
            modelName);

        return result;
    }

    /// <summary>
    /// 质量异常根因分析
    /// </summary>
    public async Task<RootCauseAnalysis> AnalyzeQualityIssueAsync(
        QualityInspection inspection,
        CancellationToken ct = default)
    {
        var sw = Stopwatch.StartNew();
        var defectTypes = string.Join(", ", inspection.Defects.Select(d => d.DefectType));
        var query = $"quality incident product={inspection.ProductCode} process={inspection.ProcessName} defects={defectTypes}";
        var similarIncidents = await SearchSimilarAsync("quality-incidents", query, ct);
        var context = JsonSerializer.Serialize(similarIncidents.Select(ToSimilarCase));

        var prompt = AiPromptBudget.Bound($"""
            你是质量工程专家。请结合相似历史质量事故分析以下质量异常的可能根因。

            不良品信息：
            - 产品：{inspection.ProductCode}
            - 工序：{inspection.ProcessName}
            - 检验点：{inspection.InspectionPoint}
            - 不良类型：{defectTypes}
            - 不良数量：{inspection.DefectQuantity}
            - 检验数量：{inspection.InspectionQuantity}

            相似历史质量事故：
            {context}

            请输出JSON，字段包括：RootCauses、CorrectiveActions、PreventiveMeasures。
            """);

        var result = await _llmGateway.GenerateJsonAsync<TracedRootCauseAnalysis>(prompt, ct)
            ?? new TracedRootCauseAnalysis();

        result.AiDecisionTrace = BuildTrace(
            prompt,
            context,
            $"inspection={inspection.Id};product={inspection.ProductCode};defects={defectTypes}",
            $"rootCauses={result.RootCauses.Count};actions={result.CorrectiveActions.Count}",
            ConfidenceFromRootCause(result),
            sw.ElapsedMilliseconds,
            "quality-incidents",
            $"inspection={inspection.Id};workOrder={inspection.WorkOrderId};product={inspection.ProductCode}");

        return result;
    }

    /// <summary>
    /// SPC异常趋势分析
    /// </summary>
    public async Task<SpcAlert> AnalyzeSpcTrendAsync(
        List<double> data,
        double usl,
        double lsl,
        double cl,
        CancellationToken ct = default)
    {
        var sw = Stopwatch.StartNew();
        var stats = CalculateSpcStats(data, usl, lsl, cl);
        var dataJson = JsonSerializer.Serialize(data);
        var statsJson = JsonSerializer.Serialize(stats);

        var prompt = AiPromptBudget.Bound($"""
            请基于已计算SPC统计量分析异常趋势，并给出管控建议。

            数据序列：{dataJson}
            规格限：USL={usl}, LSL={lsl}, CL={cl}

            统计量与运行规则：
            {statsJson}

            请输出JSON，字段包括：HasTrend、HasDrift、HasCycle、IsNearLimit、TrendDirection、RecommendedAction。
            """);

        var result = await _llmGateway.GenerateJsonAsync<TracedSpcAlert>(prompt, ct)
            ?? new TracedSpcAlert();

        result.Mean = stats.Mean;
        result.StandardDeviation = stats.StandardDeviation;
        result.Cpk = stats.Cpk;
        result.RunRuleViolations = stats.RunRuleViolations;
        result.AiDecisionTrace = BuildTrace(
            prompt,
            statsJson,
            $"points={data.Count};usl={usl};lsl={lsl};cl={cl}",
            $"trend={result.HasTrend};drift={result.HasDrift};cpk={stats.Cpk:F3}",
            0.82m,
            sw.ElapsedMilliseconds,
            "spc-calculations",
            $"spc:usl={usl};lsl={lsl};cl={cl}");

        return result;
    }

    public async Task<DefectRootCauseSummary> GetDefectRootCausesAsync(
        string defectType,
        string productCode,
        CancellationToken ct = default)
    {
        var sw = Stopwatch.StartNew();
        var query = $"historical root causes defect={defectType} product={productCode}";
        var historicalCases = await SearchSimilarAsync("quality-root-causes", query, ct);
        var context = JsonSerializer.Serialize(historicalCases.Select(ToSimilarCase));

        var prompt = AiPromptBudget.Bound($"""
            请汇总相同产品和缺陷类型的历史根因，输出可执行的根因排序。

            缺陷类型：{defectType}
            产品：{productCode}

            历史案例：
            {context}

            请输出JSON，字段包括：DefectType、ProductCode、RootCauses、Evidence。
            """);

        var result = await _llmGateway.GenerateJsonAsync<DefectRootCauseSummary>(prompt, ct)
            ?? new DefectRootCauseSummary();

        result.DefectType = defectType;
        result.ProductCode = productCode;
        result.AiDecisionTrace = BuildTrace(
            prompt,
            context,
            $"defectType={defectType};product={productCode}",
            $"rootCauses={result.RootCauses.Count};evidence={result.Evidence.Count}",
            ConfidenceFromRootCause(result),
            sw.ElapsedMilliseconds,
            "quality-root-causes",
            $"product={productCode};defectType={defectType}");

        return result;
    }

    private async Task<List<DocumentChunk>> SearchSimilarAsync(string collectionName, string query, CancellationToken ct)
    {
        var embedding = await _llmGateway.GenerateEmbeddingAsync(query, ct);
        return await _vectorStore.SearchAsync(collectionName, embedding, 5, ct);
    }

    private static SimilarCase ToSimilarCase(DocumentChunk chunk)
    {
        chunk.Metadata.TryGetValue("correctiveAction", out var correctiveAction);
        return new SimilarCase
        {
            CaseId = chunk.Id,
            Description = chunk.Content,
            CorrectiveAction = correctiveAction ?? string.Empty
        };
    }

    private static TracedInspectionResult BuildManualReviewResult(string recommendation)
    {
        return new TracedInspectionResult
        {
            IsPassed = false,
            Recommendation = recommendation
        };
    }

    private static SpcStats CalculateSpcStats(List<double> data, double usl, double lsl, double cl)
    {
        if (data.Count == 0)
        {
            return new SpcStats(0, 0, 0, new List<string> { "No data points." });
        }

        var mean = data.Average();
        var variance = data.Count > 1 ? data.Sum(x => Math.Pow(x - mean, 2)) / (data.Count - 1) : 0;
        var stddev = Math.Sqrt(variance);
        var cpk = stddev > 0 ? Math.Min((usl - mean) / (3 * stddev), (mean - lsl) / (3 * stddev)) : 0;
        var violations = new List<string>();

        if (data.Count >= 7 && IsMonotonic(data.TakeLast(7).ToList(), increasing: true))
        {
            violations.Add("Last 7 points are continuously increasing.");
        }

        if (data.Count >= 7 && IsMonotonic(data.TakeLast(7).ToList(), increasing: false))
        {
            violations.Add("Last 7 points are continuously decreasing.");
        }

        if (data.Count >= 8 && data.TakeLast(8).All(x => x > cl))
        {
            violations.Add("Last 8 points are above center line.");
        }

        if (data.Count >= 8 && data.TakeLast(8).All(x => x < cl))
        {
            violations.Add("Last 8 points are below center line.");
        }

        if (data.Any(x => x > usl || x < lsl))
        {
            violations.Add("At least one point is outside specification limits.");
        }

        return new SpcStats(mean, stddev, cpk, violations);
    }

    private static bool IsMonotonic(List<double> values, bool increasing)
    {
        return values.Zip(values.Skip(1), (a, b) => increasing ? b > a : b < a).All(x => x);
    }

    private static decimal ConfidenceFromRootCause(RootCauseAnalysis result)
    {
        var max = result.RootCauses.Count == 0 ? 0.7 : result.RootCauses.Max(x => x.Probability);
        return (decimal)Math.Clamp(max, 0.1, 1.0);
    }

    private static decimal ConfidenceFromRootCause(DefectRootCauseSummary result)
    {
        var max = result.RootCauses.Count == 0 ? 0.7 : result.RootCauses.Max(x => x.Probability);
        return (decimal)Math.Clamp(max, 0.1, 1.0);
    }

    private static MES.Domain.ValueObjects.AiDecisionTrace BuildTrace(
        string prompt,
        string context,
        string inputSummary,
        string outputSummary,
        decimal confidence,
        long latencyMs,
        string sourceReferences,
        string relatedBusinessKeys,
        string modelName = "QualityReasoning")
    {
        return AiTraceFactory.Create(
            AgentName,
            AgentVersion,
            ModelProvider,
            modelName,
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

    private sealed record SpcStats(double Mean, double StandardDeviation, double Cpk, List<string> RunRuleViolations);
}
