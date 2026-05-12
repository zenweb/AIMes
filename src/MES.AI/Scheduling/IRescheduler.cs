namespace MES.AI.Scheduling;

using MES.AI.Models;
using MES.Domain.Entities.Scheduling;

/// <summary>重排结果</summary>
public class ReschedulingResult
{
    public required List<ScheduleAssignment> Assignments { get; init; }
    public bool Success { get; init; }
    public double DisruptionScore { get; init; }
    public int ShiftedOrderCount { get; init; }
    public List<string> RemovedOrderIds { get; init; } = [];
    public string? ErrorMessage { get; init; }
}

/// <summary>重排原因</summary>
public enum ReschedulingReason { RushOrder, EquipmentFailure, MaterialShortage, Manual }

/// <summary>重排请求</summary>
public class ReschedulingRequest
{
    public ReschedulingReason Reason { get; init; }
    public string? RushOrderId { get; init; }
    public string? FailedEquipmentId { get; init; }
    public DateTime? FailureStartTime { get; init; }
    public DateTime? EstimatedRepairTime { get; init; }
    public string? ShortageMaterialCode { get; init; }
    public InsertionPolicy? Policy { get; init; }
    public List<string> AdditionalLockedOrderIds { get; init; } = [];
}

/// <summary>重排引擎接口 — 插单与故障恢复</summary>
public interface IRescheduler
{
    /// <summary>插单：将紧急工单插入现有排产方案，最小化扰动</summary>
    Task<ReschedulingResult> InsertRushOrderAsync(
        List<ScheduleAssignment> existingAssignments,
        WorkOrderInfo rushOrder,
        List<EquipmentCapacitySummary> equipment,
        List<ChangeoverEntry> changeoverMatrix,
        InsertionPolicy? policy = null,
        List<string>? lockedOrderIds = null,
        CancellationToken ct = default);

    /// <summary>设备故障重排：移除/重分配受影响工单</summary>
    Task<ReschedulingResult> RescheduleAfterFailureAsync(
        List<ScheduleAssignment> existingAssignments,
        string failedEquipmentId,
        DateTime failureTime,
        DateTime estimatedRepairTime,
        List<EquipmentCapacitySummary> equipment,
        List<ChangeoverEntry> changeoverMatrix,
        List<string>? lockedOrderIds = null,
        CancellationToken ct = default);
}
