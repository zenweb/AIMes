namespace MES.AI.Core.Scheduling;

using MES.AI.Core.Models;
using MES.Domain.Entities.Scheduling;
using Microsoft.Extensions.Logging;
using System.Text.Json;

/// <summary>排产方案采纳反馈服务 — 记录人工调整用于持续改进</summary>
public class AdoptionFeedbackService
{
    private readonly ILogger<AdoptionFeedbackService> _logger;

    public AdoptionFeedbackService(ILogger<AdoptionFeedbackService> logger)
    {
        _logger = logger;
    }

    /// <summary>记录人工调整反馈</summary>
    public ScheduleAdoptionFeedback RecordOverride(
        string schedulePlanId,
        string workshopId,
        string optimizationObjective,
        List<ScheduleAssignment> originalAssignments,
        List<ScheduleAssignment> modifiedAssignments,
        OverrideReasonCategory reasonCategory,
        string? reasonDetail,
        List<string>? movedOrderIds,
        string operatorUser,
        string? aiTraceId = null)
    {
        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        };

        var feedback = new ScheduleAdoptionFeedback
        {
            SchedulePlanId = schedulePlanId,
            WorkshopId = workshopId,
            OptimizationObjective = optimizationObjective,
            OriginalAssignmentsJson = JsonSerializer.Serialize(originalAssignments, jsonOptions),
            ModifiedAssignmentsJson = JsonSerializer.Serialize(modifiedAssignments, jsonOptions),
            ReasonCategory = reasonCategory,
            ReasonDetail = reasonDetail,
            MovedOrderIdsJson = movedOrderIds is { Count: > 0 }
                ? JsonSerializer.Serialize(movedOrderIds, jsonOptions)
                : null,
            OperatorUser = operatorUser,
            AiTraceId = aiTraceId,
        };

        _logger.LogInformation(
            "排产调整反馈: Plan={PlanId} 用户={User} 类型={Category} 移动工单={Count}个",
            schedulePlanId, operatorUser, reasonCategory, movedOrderIds?.Count ?? 0);

        return feedback;
    }
}
