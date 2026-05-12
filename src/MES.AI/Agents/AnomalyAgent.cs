using MES.AI.Pro.Services;
using MES.Domain.Entities.Anomalies;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Interfaces.Services;
using MES.Domain.ValueObjects;
using System.Diagnostics;
using System.Text.Json;

namespace MES.AI.Pro.Agents;

public class AnomalyAgent
{
    private const string AgentName = nameof(AnomalyAgent);
    private const string AgentVersion = "1.1.0-phase1c";

    private readonly ILlmGateway? _llmGateway;
    private readonly IVectorStoreService? _vectorStore;

    public AnomalyAgent()
    {
    }

    public AnomalyAgent(ILlmGateway llmGateway, IVectorStoreService vectorStore)
    {
        _llmGateway = llmGateway;
        _vectorStore = vectorStore;
    }

    public async Task<List<AnomalyResponse>> AnalyzeAsync(ProductionAnomaly anomaly)
    {
        if (_llmGateway != null && _vectorStore != null)
        {
            var llmResponse = await AnalyzeWithLLMAsync(anomaly);
            if (llmResponse.Count > 0)
            {
                return llmResponse;
            }
        }

        return AnalyzeWithRules(anomaly);
    }

    public async Task<List<AnomalyResponse>> AnalyzeWithLLMAsync(
        ProductionAnomaly anomaly,
        CancellationToken ct = default)
    {
        if (_llmGateway == null || _vectorStore == null)
        {
            return AnalyzeWithRules(anomaly);
        }

        var sw = Stopwatch.StartNew();
        var query = $"production anomaly type={anomaly.AnomalyType} severity={anomaly.Severity} title={anomaly.Title} description={anomaly.Description}";
        var embedding = await _llmGateway.GenerateEmbeddingAsync(query, ct);
        var historicalCases = await _vectorStore.SearchAsync("production-anomalies", embedding, 5);
        var context = JsonSerializer.Serialize(historicalCases.Select(ToContext));
        var prompt = $"""
            你是MES生产异常处置专家。请结合历史异常案例，分析当前异常并给出处置建议。

            当前异常：
            - 工单：{anomaly.WorkOrderNumber.Value}
            - 工序：{anomaly.OperationCode.Value}
            - 设备：{anomaly.EquipmentId ?? "未指定"}
            - 类型：{anomaly.AnomalyType}
            - 等级：{anomaly.Severity}
            - 标题：{anomaly.Title}
            - 描述：{anomaly.Description}

            相似历史异常：
            {context}

            请输出JSON数组，每个元素包含 Description、SuggestedAction、Confidence。
            """;

        var suggestions = await _llmGateway.GenerateJsonAsync<List<AnomalySuggestion>>(prompt, ct)
            ?? new List<AnomalySuggestion>();

        return suggestions.Select(s => CreateResponse(
                anomaly,
                s.Description,
                s.SuggestedAction,
                AiTraceFactory.Create(
                    AgentName,
                    AgentVersion,
                    "ConfiguredLlmGateway",
                    "AnomalyReasoning",
                    "unknown",
                    prompt,
                    context,
                    $"anomaly={anomaly.Id};type={anomaly.AnomalyType};severity={anomaly.Severity}",
                    $"action={s.SuggestedAction}",
                    (decimal)Math.Clamp(s.Confidence <= 0 ? 0.75 : s.Confidence, 0.1, 1.0),
                    AiTraceFactory.EstimateTokens(prompt),
                    AiTraceFactory.EstimateTokens(s.SuggestedAction),
                    (int)sw.ElapsedMilliseconds,
                    "production-anomalies",
                    BusinessKeys(anomaly))))
            .ToList();
    }

    private static List<AnomalyResponse> AnalyzeWithRules(ProductionAnomaly anomaly)
    {
        var responses = new List<AnomalyResponse>();

        if (anomaly.Severity == AnomalySeverity.Critical)
        {
            responses.Add(CreateRuleResponse(
                anomaly,
                "Critical anomaly requires immediate containment.",
                "Pause the affected operation, notify the shift lead, and verify safety conditions before restart."));
        }

        if (ContainsType(anomaly, "quality"))
        {
            responses.Add(CreateRuleResponse(
                anomaly,
                "Quality anomaly may affect product conformity.",
                "Trigger additional inspection for current WIP and quarantine suspect output."));
        }

        if (ContainsType(anomaly, "equipment"))
        {
            responses.Add(CreateRuleResponse(
                anomaly,
                "Equipment anomaly may indicate degradation or setup drift.",
                "Run maintenance check and compare equipment parameters with the approved recipe."));
        }

        if (ContainsType(anomaly, "material"))
        {
            responses.Add(CreateRuleResponse(
                anomaly,
                "Material anomaly may affect availability or substitutability.",
                "Check reserved lot status and confirm approved substitute material options."));
        }

        return responses;
    }

    private static bool ContainsType(ProductionAnomaly anomaly, string keyword)
    {
        return anomaly.AnomalyType.Contains(keyword, StringComparison.OrdinalIgnoreCase)
            || anomaly.Title.Contains(keyword, StringComparison.OrdinalIgnoreCase)
            || anomaly.Description.Contains(keyword, StringComparison.OrdinalIgnoreCase);
    }

    private static AnomalyResponse CreateRuleResponse(ProductionAnomaly anomaly, string description, string suggestedAction)
    {
        var context = $"{anomaly.Id}:{anomaly.Status}:{anomaly.Severity}";
        var trace = AiTraceFactory.Create(
            AgentName,
            AgentVersion,
            "RulesEngine",
            "AnomalyRules",
            "1.0.0",
            "rule-based-anomaly-analysis",
            context,
            $"{anomaly.WorkOrderNumber.Value}/{anomaly.OperationCode.Value}/{anomaly.AnomalyType}/{anomaly.Severity}",
            suggestedAction,
            0.85m,
            1,
            AiTraceFactory.EstimateTokens(suggestedAction),
            0,
            "rule-set:anomaly-keywords",
            BusinessKeys(anomaly));

        return CreateResponse(anomaly, description, suggestedAction, trace);
    }

    private static AnomalyResponse CreateResponse(
        ProductionAnomaly anomaly,
        string description,
        string suggestedAction,
        AiDecisionTrace trace)
    {
        return new AnomalyResponse(AnomalyResponseType.AiSuggestion, description, suggestedAction, AgentName, trace);
    }

    private static object ToContext(DocumentChunk chunk)
    {
        return new { chunk.Id, chunk.Content, chunk.Metadata, chunk.Source };
    }

    private static string BusinessKeys(ProductionAnomaly anomaly)
    {
        return $"workOrder={anomaly.WorkOrderNumber.Value};operation={anomaly.OperationCode.Value};anomaly={anomaly.Id}";
    }

    private sealed class AnomalySuggestion
    {
        public string Description { get; set; } = string.Empty;
        public string SuggestedAction { get; set; } = string.Empty;
        public double Confidence { get; set; }
    }
}
