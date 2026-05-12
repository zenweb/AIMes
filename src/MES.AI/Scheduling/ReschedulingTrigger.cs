namespace MES.AI.Scheduling;

using MES.AI.Models;
using MES.AI.Services;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Interfaces.Repositories;
using MES.Domain.ValueObjects;
using Microsoft.Extensions.Logging;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

/// <summary>重排触发器 — 处理设备故障/物料短缺/急单等事件驱动的重排</summary>
public class ReschedulingTrigger
{
    private readonly IRescheduler _rescheduler;
    private readonly ISchedulingContextProvider _contextProvider;
    private readonly LockPeriodManager _lockPeriod;
    private readonly ILogger<ReschedulingTrigger> _logger;

    public ReschedulingTrigger(
        IRescheduler rescheduler,
        ISchedulingContextProvider contextProvider,
        LockPeriodManager lockPeriod,
        ILogger<ReschedulingTrigger> logger)
    {
        _rescheduler = rescheduler;
        _contextProvider = contextProvider;
        _lockPeriod = lockPeriod;
        _logger = logger;
    }

    /// <summary>急单插入</summary>
    public async Task<SchedulingResult> HandleRushOrderAsync(
        ScheduleRequest originalRequest,
        WorkOrderInfo rushOrder,
        SchedulingResult currentSchedule,
        InsertionPolicy? policy = null,
        CancellationToken ct = default)
    {
        var context = await _contextProvider.GetContextAsync(originalRequest.WorkshopId, ct);
        var lockedIds = _lockPeriod.GetLockedOrderIds(currentSchedule.Assignments);

        var result = await _rescheduler.InsertRushOrderAsync(
            currentSchedule.Assignments, rushOrder, context.EquipmentCapacities,
            context.ChangeoverMatrix, policy, lockedIds, ct);

        return BuildResult(result, currentSchedule, context, originalRequest,
            ReschedulingReason.RushOrder, $"急单插入: {rushOrder.OrderNumber}");
    }

    /// <summary>设备故障重排</summary>
    public async Task<SchedulingResult> HandleEquipmentFailureAsync(
        ScheduleRequest originalRequest,
        SchedulingResult currentSchedule,
        string failedEquipmentId,
        DateTime failureTime,
        DateTime estimatedRepairTime,
        CancellationToken ct = default)
    {
        var context = await _contextProvider.GetContextAsync(originalRequest.WorkshopId, ct);
        var lockedIds = _lockPeriod.GetLockedOrderIds(currentSchedule.Assignments);

        var result = await _rescheduler.RescheduleAfterFailureAsync(
            currentSchedule.Assignments, failedEquipmentId, failureTime,
            estimatedRepairTime, context.EquipmentCapacities,
            context.ChangeoverMatrix, lockedIds, ct);

        return BuildResult(result, currentSchedule, context, originalRequest,
            ReschedulingReason.EquipmentFailure, $"设备故障: {failedEquipmentId}");
    }

    private static SchedulingResult BuildResult(
        ReschedulingResult rescheduleResult,
        SchedulingResult currentSchedule,
        SchedulingContextSnapshot context,
        ScheduleRequest request,
        ReschedulingReason reason,
        string reasonDetail)
    {
        return new SchedulingResult
        {
            Assignments = rescheduleResult.Assignments,
            EstimatedCompletion = rescheduleResult.Assignments.Count > 0
                ? rescheduleResult.Assignments.Max(a => a.EndTime)
                : currentSchedule.EstimatedCompletion,
            UtilizationRate = currentSchedule.UtilizationRate,
            OnTimeDeliveryRate = currentSchedule.OnTimeDeliveryRate,
            TotalChangeoverMinutes = currentSchedule.TotalChangeoverMinutes,
            GroupCount = currentSchedule.GroupCount,
            BottleneckInfo = currentSchedule.BottleneckInfo,
            OptimizationNotes = rescheduleResult.Success
                ? $"重排成功 ({reasonDetail})，扰动度: {rescheduleResult.DisruptionScore}%，调整工单: {rescheduleResult.ShiftedOrderCount}"
                : $"重排失败: {rescheduleResult.ErrorMessage}",
            DataCompletenessScore = context.CompletenessScore,
            AiDecisionTrace = new AiDecisionTrace
            {
                AgentName = "ReschedulingTrigger",
                AgentVersion = "1.0.0",
                ModelProvider = "RuleEngine",
                ModelName = reason.ToString(),
                ModelVersion = "deterministic",
                PromptHash = ComputeSha256(reasonDetail),
                ContextHash = ComputeSha256(JsonSerializer.Serialize(context)),
                InputSummary = $"Reason={reason}; Assignments={currentSchedule.Assignments.Count}; Equipment={request.Equipment.Count}",
                OutputSummary = $"Success={rescheduleResult.Success}; Disruption={rescheduleResult.DisruptionScore}; Shifted={rescheduleResult.ShiftedOrderCount}",
                SourceReferences = "Rescheduler+LockPeriodManager",
                RelatedBusinessKeys = string.Join(',', request.Orders.Select(o => o.OrderNumber))
            }
        };
    }

    private static string ComputeSha256(string value)
    {
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(value));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }
}
