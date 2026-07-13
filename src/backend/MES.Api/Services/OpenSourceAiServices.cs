using System.Collections.Concurrent;
using System.Security.Cryptography;
using System.Text;
using MES.Domain.Entities.Anomalies;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Entities.Quality;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Interfaces.Services;
using MES.Domain.ValueObjects;

namespace MES.Api.Services;

/// <summary>开源构建的本地确定性替代实现，不依赖商业 LLM 或向量数据库。</summary>
public sealed class OpenSourceLlmGateway : ILlmGateway
{
    private const string UnavailableMessage = "当前开源构建未包含外部 LLM。已使用本地知识检索结果，需启用商业 AI 适配器以生成模型回答。";

    public Task<string> GenerateTextAsync(string prompt, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();
        return Task.FromResult(UnavailableMessage);
    }

    public Task<string> GenerateTextAsync(string systemPrompt, string userPrompt, CancellationToken ct = default) =>
        GenerateTextAsync($"{systemPrompt}\n{userPrompt}", ct);

    public Task<T> GenerateJsonAsync<T>(string prompt, CancellationToken ct = default) where T : class
    {
        ct.ThrowIfCancellationRequested();
        throw new NotSupportedException("开源构建未包含结构化 LLM 生成功能。");
    }

    public Task<float[]> GenerateEmbeddingAsync(string text, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(text));
        return Task.FromResult(hash.Select(value => value / 255f).ToArray());
    }

    public Task<LlmStatusDto> GetStatusAsync(CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();
        return Task.FromResult(new LlmStatusDto
        {
            Provider = "OpenSourceFallback",
            Model = "deterministic-local",
            Reachable = true,
            Version = "1",
            Error = "External LLM is not included in the open-source build."
        });
    }
}

public sealed class OpenSourceVectorStore : IVectorStoreService
{
    private readonly ConcurrentDictionary<string, List<DocumentChunk>> _collections = new();

    public Task UpsertAsync(string collectionName, IEnumerable<DocumentChunk> chunks, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();
        var collection = _collections.GetOrAdd(collectionName, _ => []);
        lock (collection)
        {
            foreach (var chunk in chunks)
            {
                collection.RemoveAll(existing => existing.Id == chunk.Id);
                collection.Add(chunk);
            }
        }

        return Task.CompletedTask;
    }

    public Task<List<DocumentChunk>> SearchAsync(string collectionName, float[] embedding, int top = 5, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();
        if (!_collections.TryGetValue(collectionName, out var collection))
            return Task.FromResult(new List<DocumentChunk>());

        lock (collection)
        {
            return Task.FromResult(collection
                .OrderByDescending(chunk => CosineSimilarity(embedding, chunk.Vector))
                .Take(top)
                .ToList());
        }
    }

    public Task<List<DocumentChunk>> SearchAsync(string collectionName, string query, int top = 5, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();
        if (!_collections.TryGetValue(collectionName, out var collection))
            return Task.FromResult(new List<DocumentChunk>());

        lock (collection)
        {
            return Task.FromResult(collection
                .OrderByDescending(chunk => chunk.Content.Contains(query, StringComparison.OrdinalIgnoreCase))
                .ThenByDescending(chunk => chunk.CreatedAt)
                .Take(top)
                .ToList());
        }
    }

    public Task DeleteCollectionAsync(string collectionName, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();
        _collections.TryRemove(collectionName, out _);
        return Task.CompletedTask;
    }

    private static double CosineSimilarity(float[] left, float[] right)
    {
        if (left.Length == 0 || left.Length != right.Length)
            return 0;

        var dot = 0d;
        var leftMagnitude = 0d;
        var rightMagnitude = 0d;
        for (var index = 0; index < left.Length; index++)
        {
            dot += left[index] * right[index];
            leftMagnitude += left[index] * left[index];
            rightMagnitude += right[index] * right[index];
        }

        var denominator = Math.Sqrt(leftMagnitude) * Math.Sqrt(rightMagnitude);
        return denominator == 0 ? 0 : dot / denominator;
    }
}

public sealed class OpenSourceScheduleOptimizationService : IScheduleOptimizationService
{
    public Task<ScheduleOptimizationResult> OptimizeAsync(ScheduleOptimizationRequest request, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();
        if (request.Equipment.Count == 0)
        {
            return Task.FromResult(new ScheduleOptimizationResult([], DateTime.UtcNow, 0, 0, 0, 0, null,
                "未提供可用设备，无法生成排程。", ["No equipment available."], request.Orders.Select(order => order.Id).ToList(),
                CreateTrace(request, [])));
        }

        var availability = request.Equipment.ToDictionary(equipment => equipment.Id, _ => DateTime.UtcNow);
        var assignments = new List<ScheduleAssignmentData>();
        foreach (var order in request.Orders.OrderBy(order => order.DueDate).ThenByDescending(order => order.Priority))
        {
            var equipment = request.Equipment.OrderBy(item => availability[item.Id]).First();
            var start = availability[equipment.Id];
            var duration = TimeSpan.FromMinutes(Math.Max(1, Math.Ceiling(order.Quantity / Math.Max(1, equipment.Capacity) * 60)));
            var end = start.Add(duration);
            assignments.Add(new ScheduleAssignmentData(order.Id, equipment.Id, start, end, [], null, 0, false));
            availability[equipment.Id] = end;
        }

        var completion = assignments.Count == 0 ? DateTime.UtcNow : assignments.Max(item => item.EndTime);
        return Task.FromResult(new ScheduleOptimizationResult(assignments, completion, 0, 0, 0, 0, null,
            "使用开源确定性规则生成排程。", [], [], CreateTrace(request, assignments)));
    }

    private static AiDecisionTrace CreateTrace(
        ScheduleOptimizationRequest request,
        IReadOnlyCollection<ScheduleAssignmentData> assignments) => new()
        {
            AgentName = "OpenSourceScheduleOptimizationService",
            AgentVersion = "1",
            ModelProvider = "OpenSourceFallback",
            ModelName = "deterministic-local",
            ModelVersion = "1",
            PromptHash = "not-applicable",
            ContextHash = "not-applicable",
            InputSummary = $"orders={request.Orders.Count};equipment={request.Equipment.Count}",
            OutputSummary = $"assignments={assignments.Count}",
            Confidence = 1m,
            TokensInput = 1,
            TokensOutput = 1,
            SourceReferences = "local-rules",
            RelatedBusinessKeys = request.Orders.Count == 0
                ? "none"
                : string.Join(',', request.Orders.Select(order => order.Id))
        };
}

public sealed class OpenSourceQualityAnalysisService : IQualityAnalysisService
{
    public Task<QualityAnalysisResult> AnalyzeQualityIssueAsync(QualityInspection inspection, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();
        var cause = new QualityRootCauseItem("需人工复核", 1, "开源构建未启用模型根因分析");
        return Task.FromResult(new QualityAnalysisResult([cause], ["隔离受影响批次并复检"], ["补充过程检验数据"], CreateTrace("quality-analysis")));
    }

    public Task<SpcAnalysisResult> AnalyzeSpcTrendAsync(List<double> data, double usl, double lsl, double cl, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();
        var hasDrift = data.Any(value => value > usl || value < lsl);
        return Task.FromResult(new SpcAnalysisResult(false, hasDrift, false, hasDrift, "Stable",
            hasDrift ? "存在超规格点，请复核过程参数。" : "当前数据未发现超规格点。", CreateTrace("spc-analysis")));
    }

    private static AiDecisionTrace CreateTrace(string operation) => new()
    {
        AgentName = "OpenSourceQualityAnalysisService",
        AgentVersion = "1",
        ModelProvider = "OpenSourceFallback",
        ModelName = "deterministic-local",
        ModelVersion = "1",
        PromptHash = operation,
        ContextHash = operation,
        InputSummary = operation,
        OutputSummary = operation,
        Confidence = 1m,
        TokensInput = 1,
        TokensOutput = 1,
        SourceReferences = "local-rules",
        RelatedBusinessKeys = operation
    };
}

public sealed class OpenSourceAnomalyAnalysisService : IAnomalyAnalysisService
{
    public Task<List<AnomalyResponse>> AnalyzeAsync(ProductionAnomaly anomaly, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();
        return Task.FromResult(new List<AnomalyResponse>
        {
            new(AnomalyResponseType.System, "开源规则建议先隔离异常影响范围。", "通知责任人并执行现场复核", "OpenSourceRules")
        });
    }
}

public sealed class OpenSourceAdoptionFeedbackService : IAdoptionFeedbackService
{
    public ScheduleAdoptionFeedback RecordOverride(string schedulePlanId, string workshopId, string optimizationObjective,
        OverrideReasonCategory reasonCategory, string? reasonDetail, List<string>? movedOrderIds, string operatorUser, string? aiTraceId = null) => new()
        {
            SchedulePlanId = schedulePlanId,
            WorkshopId = workshopId,
            OptimizationObjective = optimizationObjective,
            ReasonCategory = reasonCategory,
            ReasonDetail = reasonDetail,
            MovedOrderIdsJson = movedOrderIds is { Count: > 0 } ? string.Join(',', movedOrderIds) : null,
            OperatorUser = operatorUser,
            AiTraceId = aiTraceId
        };
}

public sealed class OpenSourceTraceValidator : ITraceValidator
{
    public (bool IsValid, List<string> Errors) Validate(AiDecisionTrace? trace)
    {
        if (trace is null)
        {
            return (false, ["AiDecisionTrace is required."]);
        }

        var errors = new List<string>();
        Require(trace.AgentName, nameof(trace.AgentName), errors);
        Require(trace.AgentVersion, nameof(trace.AgentVersion), errors);
        Require(trace.ModelProvider, nameof(trace.ModelProvider), errors);
        Require(trace.ModelName, nameof(trace.ModelName), errors);
        Require(trace.ModelVersion, nameof(trace.ModelVersion), errors);
        Require(trace.PromptHash, nameof(trace.PromptHash), errors);
        Require(trace.ContextHash, nameof(trace.ContextHash), errors);
        Require(trace.InputSummary, nameof(trace.InputSummary), errors);
        Require(trace.OutputSummary, nameof(trace.OutputSummary), errors);
        Require(trace.SourceReferences, nameof(trace.SourceReferences), errors);
        Require(trace.RelatedBusinessKeys, nameof(trace.RelatedBusinessKeys), errors);

        if (!trace.Confidence.HasValue || trace.Confidence.Value <= 0 || trace.Confidence.Value > 1)
        {
            errors.Add("Confidence must be between 0 and 1.");
        }

        if (!trace.TokensInput.HasValue || trace.TokensInput.Value <= 0)
        {
            errors.Add("TokensInput must be greater than 0.");
        }

        if (!trace.TokensOutput.HasValue || trace.TokensOutput.Value <= 0)
        {
            errors.Add("TokensOutput must be greater than 0.");
        }

        if (trace.LatencyMs < 0)
        {
            errors.Add("LatencyMs must not be negative.");
        }

        if (!Enum.IsDefined(trace.HumanAdoptionStatus))
        {
            errors.Add("HumanAdoptionStatus must be a defined value.");
        }

        if (trace.CreatedAt == default)
        {
            errors.Add("CreatedAt is required.");
        }

        return (errors.Count == 0, errors);
    }

    private static void Require(string? value, string fieldName, List<string> errors)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            errors.Add($"{fieldName} is required.");
        }
    }
}
