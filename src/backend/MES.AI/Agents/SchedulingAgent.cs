using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using MES.AI.Core.Models;
using MES.AI.Core.Scheduling;
using MES.AI.Pro.Services;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Interfaces.Repositories;
using MES.Domain.Interfaces.Services;
using MES.Domain.ValueObjects;
using Microsoft.SemanticKernel;

namespace MES.AI.Pro.Agents;

public class SchedulingAgent
{
    private readonly Kernel _kernel;
    private readonly ILlmGateway _llmGateway;
    private readonly ISchedulingContextProvider _contextProvider;
    private readonly ISchedulingRuleEngine _ruleEngine;
    private readonly IConstraintValidator _constraintValidator;

    public SchedulingAgent(
        Kernel kernel,
        ILlmGateway llmGateway,
        ISchedulingContextProvider contextProvider,
        ISchedulingRuleEngine ruleEngine,
        IConstraintValidator constraintValidator)
    {
        _kernel = kernel.Clone();
        _llmGateway = llmGateway;
        _contextProvider = contextProvider;
        _ruleEngine = ruleEngine;
        _constraintValidator = constraintValidator;
    }

    public virtual async Task<SchedulingResult> OptimizeScheduleAsync(
        ScheduleRequest request,
        CancellationToken ct = default)
    {
        var context = await _contextProvider.GetContextAsync(request.WorkshopId, ct);

        // C1: 根据瓶颈利用率调整权重
        var adjustedConfig = SchedulingRuleEngine.AdjustWeightsForBottlenecks(
            WeightedSchedulingConfig.Default, context);

        // Step 1: 规则引擎生成初始排产方案（瓶颈感知权重）
        var ruleResult = await _ruleEngine.GenerateInitialScheduleAsync(
            request, context,
            PriorityRule.WeightedComposite,
            CapacitySelectionStrategy.LeastLoaded,
            adjustedConfig, ct);

        // Step 2: 约束检查 — 如果规则引擎方案有致命违规，直接返回
        if (!ruleResult.Validation.IsValid)
        {
            var fallbackResult = ConvertRuleResult(ruleResult, context);
            fallbackResult.OptimizationNotes = "规则引擎方案未通过约束验证，返回基础方案";
            fallbackResult.AiDecisionTrace = BuildDecisionTrace(request, fallbackResult, "", context, ruleResult);
            return fallbackResult;
        }

        // Step 3: LLM 在规则引擎基础上精调
        string? prompt = null;
        SchedulingResult result;
        try
        {
            prompt = AiPromptBudget.Bound(BuildSchedulingPrompt(request, context, ruleResult));
            result = await _llmGateway.GenerateJsonAsync<SchedulingResult>(prompt, ct);

            // Step 4: 再验证 LLM 输出
            var llmValidation = _constraintValidator.Validate(result.Assignments, request, context);
            if (!llmValidation.IsValid)
            {
                result = ConvertRuleResult(ruleResult, context);
                result.OptimizationNotes = $"LLM 输出未通过约束验证（{llmValidation.Violations.Count(v => v.Level == ConstraintViolationLevel.Error)} 个错误），回退到规则引擎方案";
            }
            else
            {
                result.Warnings = ruleResult.Warnings;
                result.SkippedOrderIds = ruleResult.SkippedOrderIds;
                result.OptimizationNotes = $"规则引擎生成初始方案（{ruleResult.Assignments.Count} 分配）→ LLM 精调完成";
            }
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            result = ConvertRuleResult(ruleResult, context);
            result.OptimizationNotes = $"LLM 调用失败（{ex.GetType().Name}），回退到规则引擎方案";
        }

        result.DataCompletenessScore = context.CompletenessScore;
        result.AiDecisionTrace = BuildDecisionTrace(request, result, prompt ?? "", context, ruleResult);

        return result;
    }

    private static string BuildSchedulingPrompt(
        ScheduleRequest request,
        SchedulingContextSnapshot context,
        RuleEngineResult ruleResult)
    {
        var ordersJson = JsonSerializer.Serialize(request.Orders);
        var equipmentJson = JsonSerializer.Serialize(request.Equipment);
        var materialsJson = JsonSerializer.Serialize(request.Materials);
        var deadlinesJson = JsonSerializer.Serialize(request.Deadlines);
        var contextJson = JsonSerializer.Serialize(context);
        var changeoverJson = JsonSerializer.Serialize(context.ChangeoverMatrix);
        var objective = request.OptimizationObjective ?? "due_date";
        var lockedJson = JsonSerializer.Serialize(request.LockedOrderIds);

        // 规则引擎初始方案注入（含 C层 瓶颈警告和跳过的工单）
        var initialScheduleJson = JsonSerializer.Serialize(new
        {
            Assignments = ruleResult.Assignments.Select(a => new
            {
                a.WorkOrderId,
                a.EquipmentId,
                a.StartTime,
                a.EndTime,
                a.GroupId,
                a.SetupMinutes,
                a.IsOnBottleneck
            }),
            ruleResult.UtilizationRate,
            ruleResult.OnTimeDeliveryRate,
            ruleResult.TotalChangeoverMinutes,
            ruleResult.GroupCount,
            ruleResult.BottleneckInfo,
            Warnings = ruleResult.Warnings,
            SkippedOrderIds = ruleResult.SkippedOrderIds
        });

        // 瓶颈利用率汇总
        var bottleneckSummary = string.Join("; ",
            context.EquipmentCapacities
                .Where(e => e.IsBottleneck)
                .Select(e => $"{e.EquipmentName}({e.UtilizationRate:F1}%)"));

        return $"""
            你是MES智能排产专家。请基于以下约束条件优化生产排程。

            === 规则引擎初始方案（供参考） ===
            规则引擎已基于确定性规则生成初始排产方案：
            {initialScheduleJson}

            请在规则引擎方案基础上进行智能优化调整，而非完全重新生成。
            你可以调整：时间分配、设备选择、顺序优化；但需保留合理的分组和瓶颈优先原则。

            === 优化目标 ===
            当前目标：{objective}
            可选值：due_date（交期优先）/ utilization（利用率优先）/ changeover（换线成本优先）/ balanced（均衡）

            === 核心排产原则 ===
            1. 瓶颈优先：先排瓶颈工序，其他工序围绕瓶颈配套
            2. 留白比排满更稳定：瓶颈预留 10%-20% 产能，关键节点留缓冲
            3. 少切换比多干活更高效：同材料/同工艺路线的订单连续生产，降低换型次数
            4. 锁定周期：以下工单处于锁定期，时间不可调整：
               {lockedJson}

            === 订单列表 ===
            {ordersJson}

            === 设备产能 ===
            {equipmentJson}
            （含理论/实际/预留产能和瓶颈标记）

            === 物料可用量 ===
            {materialsJson}

            === 交期要求 ===
            {deadlinesJson}

            === 切换成本矩阵（换模/换线时间，分钟） ===
            {changeoverJson}

            === 排产上下文快照（工艺路线/在制品/执行状态） ===
            {contextJson}

            数据完整性评分：{context.CompletenessScore.OverallScore}/100

            === 瓶颈信息 ===
            瓶颈设备利用率: {bottleneckSummary}
            规则引擎因缺料跳过的工单: {(ruleResult.SkippedOrderIds.Count > 0 ? string.Join(", ", ruleResult.SkippedOrderIds) : "无")}
            警告: {(ruleResult.Warnings.Count > 0 ? string.Join("; ", ruleResult.Warnings) : "无")}

            === 输出要求 ===
            请输出最优排产方案，包含：
            1. 每个工单的开始/结束时间
            2. 设备分配方案
            3. 预计完成时间
            4. 关键路径分析
            5. 分组建议（同组工单连续生产）
            6. 总换线时间估算
            7. 瓶颈分析说明
            8. 准时交付率预测

            请以JSON格式输出：
            [JSON_OUTPUT]
            """;
    }

    private static SchedulingResult ConvertRuleResult(RuleEngineResult ruleResult, SchedulingContextSnapshot context)
    {
        return new SchedulingResult
        {
            Assignments = ruleResult.Assignments,
            EstimatedCompletion = ruleResult.EstimatedCompletion,
            UtilizationRate = ruleResult.UtilizationRate,
            OnTimeDeliveryRate = ruleResult.OnTimeDeliveryRate,
            TotalChangeoverMinutes = ruleResult.TotalChangeoverMinutes,
            GroupCount = ruleResult.GroupCount,
            BottleneckInfo = ruleResult.BottleneckInfo,
            DataCompletenessScore = context.CompletenessScore,
            Warnings = ruleResult.Warnings,
            SkippedOrderIds = ruleResult.SkippedOrderIds
        };
    }

    private static AiDecisionTrace BuildDecisionTrace(
        ScheduleRequest request,
        SchedulingResult result,
        string prompt,
        SchedulingContextSnapshot context,
        RuleEngineResult ruleResult)
    {
        var contextJson = JsonSerializer.Serialize(context);
        return new AiDecisionTrace
        {
            AgentName = nameof(SchedulingAgent),
            AgentVersion = "2.1.0-hybrid",
            ModelProvider = "ConfiguredLlmGateway",
            ModelName = "SchedulingOptimization",
            ModelVersion = "unknown",
            PromptHash = ComputeSha256(prompt),
            ContextHash = ComputeSha256(contextJson),
            InputSummary = $"Workshop={request.WorkshopId}; Orders={request.Orders.Count}; Equipment={request.Equipment.Count}; Objective={request.OptimizationObjective ?? "due_date"}; RuleEngine={ruleResult.Assignments.Count}assignments/{ruleResult.UtilizationRate}%util",
            OutputSummary = $"Assignments={result.Assignments.Count}; Utilization={result.UtilizationRate}; OTD={result.OnTimeDeliveryRate}; Changeover={result.TotalChangeoverMinutes}min; Groups={result.GroupCount}",
            Confidence = 0.78m,
            TokensInput = AiTraceFactory.EstimateTokens(prompt),
            TokensOutput = AiTraceFactory.EstimateTokens(result.OptimizationNotes ?? string.Empty),
            SourceReferences = "SchedulingRuleEngine+SchedulingContextSnapshot+ChangeoverMatrix",
            RelatedBusinessKeys = string.Join(',', request.Orders.Select(o => o.OrderNumber))
        };
    }

    private static string ComputeSha256(string value)
    {
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(value));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }
}
