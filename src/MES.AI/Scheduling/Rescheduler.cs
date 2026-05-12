namespace MES.AI.Core.Scheduling;

using MES.AI.Core.Models;
using MES.Domain.Entities.Scheduling;
using Microsoft.Extensions.Logging;

/// <summary>最小扰动重排引擎 — 插单与故障恢复</summary>
public class Rescheduler : IRescheduler
{
    private readonly ILogger<Rescheduler> _logger;
    private readonly ISchedulingRuleEngine _ruleEngine;
    private readonly LockPeriodManager _lockPeriod;

    public Rescheduler(
        ILogger<Rescheduler> logger,
        ISchedulingRuleEngine ruleEngine,
        LockPeriodManager lockPeriod)
    {
        _logger = logger;
        _ruleEngine = ruleEngine;
        _lockPeriod = lockPeriod;
    }

    public async Task<ReschedulingResult> InsertRushOrderAsync(
        List<ScheduleAssignment> existingAssignments,
        WorkOrderInfo rushOrder,
        List<EquipmentCapacitySummary> equipment,
        List<ChangeoverEntry> changeoverMatrix,
        InsertionPolicy? policy = null,
        List<string>? lockedOrderIds = null,
        CancellationToken ct = default)
    {
        policy ??= InsertionPolicy.Default;
        var now = DateTime.UtcNow;
        var locked = new HashSet<string>(lockedOrderIds ?? []);

        // 优先级门槛检查
        if (rushOrder.Priority < policy.MinimumPriority)
        {
            return new ReschedulingResult
            {
                Assignments = existingAssignments,
                Success = false,
                ErrorMessage = $"工单优先级 {rushOrder.Priority} 低于插单门槛 {policy.MinimumPriority}"
            };
        }

        // 按设备分组现有分配
        var byEquipment = existingAssignments
            .GroupBy(a => a.EquipmentId)
            .ToDictionary(g => g.Key, g => g.OrderBy(a => a.StartTime).ToList());

        // 尝试在每个设备上找插入位置
        var bestGap = FindBestGap(byEquipment, rushOrder, equipment, changeoverMatrix, locked, policy, now);

        if (bestGap is null)
        {
            // 无可用间隙，尝试抢占模式
            if (policy.Strategy == InsertionStrategy.PriorityPreemptive)
            {
                return await TryPreemptiveInsertAsync(
                    existingAssignments, rushOrder, equipment, changeoverMatrix, locked, policy, now, ct);
            }

            return new ReschedulingResult
            {
                Assignments = existingAssignments,
                Success = false,
                ErrorMessage = "未找到可用的排产间隙"
            };
        }

        // 执行插入
        var (gapEquipmentId, gapStartTime, shiftedAssignments) = bestGap.Value;
        var shiftCount = shiftedAssignments.Count;
        var newAssignments = RebuildAssignments(byEquipment, gapEquipmentId, rushOrder, gapStartTime,
            equipment, changeoverMatrix, locked, now);
        var disruptionScore = existingAssignments.Count > 0
            ? (double)shiftCount / existingAssignments.Count
            : 0;

        if (disruptionScore > policy.MaxDisruptionRatio)
        {
            return new ReschedulingResult
            {
                Assignments = existingAssignments,
                Success = false,
                ErrorMessage = $"扰动比率 {disruptionScore:P1} 超过上限 {policy.MaxDisruptionRatio:P1}"
            };
        }

        _logger.LogInformation(
            "Rush order {OrderId} inserted, shifted {ShiftCount} assignments, disruption {Disruption:P1}",
            rushOrder.Id, shiftCount, disruptionScore);

        return new ReschedulingResult
        {
            Assignments = newAssignments,
            Success = true,
            DisruptionScore = Math.Round(disruptionScore * 100, 1),
            ShiftedOrderCount = shiftCount
        };
    }

    public async Task<ReschedulingResult> RescheduleAfterFailureAsync(
        List<ScheduleAssignment> existingAssignments,
        string failedEquipmentId,
        DateTime failureTime,
        DateTime estimatedRepairTime,
        List<EquipmentCapacitySummary> equipment,
        List<ChangeoverEntry> changeoverMatrix,
        List<string>? lockedOrderIds = null,
        CancellationToken ct = default)
    {
        var locked = new HashSet<string>(lockedOrderIds ?? []);

        // 识别受影响的工单（在故障设备上、在故障时间之后）
        var affected = existingAssignments
            .Where(a => a.EquipmentId == failedEquipmentId && a.StartTime >= failureTime)
            .OrderBy(a => a.StartTime)
            .ToList();

        if (affected.Count == 0)
        {
            return new ReschedulingResult
            {
                Assignments = existingAssignments,
                Success = true,
                DisruptionScore = 0,
                ShiftedOrderCount = 0
            };
        }

        // 保留未受影响的工单
        var unaffected = existingAssignments
            .Where(a => a.EquipmentId != failedEquipmentId || a.StartTime < failureTime)
            .ToList();

        // 受影响工单的开始时间从修复时间算起
        var shiftedCount = 0;
        var currentStart = estimatedRepairTime > failureTime ? estimatedRepairTime : failureTime;

        var reassigned = new List<ScheduleAssignment>();
        foreach (var a in affected)
        {
            if (locked.Contains(a.WorkOrderId))
            {
                // 锁定的工单保持原位（实际场景需人工确认）
                reassigned.Add(a);
                currentStart = a.EndTime;
                continue;
            }

            var duration = a.EndTime - a.StartTime;
            var newStart = currentStart;

            // 尝试分配给其他设备
            var alternatives = equipment
                .Where(e => e.EquipmentId != failedEquipmentId && e.AvailableCapacity > 0)
                .ToList();

            var assigned = false;
            foreach (var alt in alternatives)
            {
                var altAssignments = unaffected.Concat(reassigned)
                    .Where(x => x.EquipmentId == alt.EquipmentId)
                    .OrderBy(x => x.StartTime)
                    .ToList();

                if (altAssignments.Count == 0)
                {
                    reassigned.Add(new ScheduleAssignment
                    {
                        WorkOrderId = a.WorkOrderId,
                        EquipmentId = alt.EquipmentId,
                        StartTime = newStart,
                        EndTime = newStart.Add(duration),
                        GroupId = a.GroupId,
                        SetupMinutes = a.SetupMinutes,
                        IsOnBottleneck = alt.IsBottleneck
                    });
                    assigned = true;
                    shiftedCount++;
                    currentStart = newStart.Add(duration);
                    break;
                }

                // 检查最后一个分配的结束时间之后是否有空间
                var lastEnd = altAssignments.Max(x => x.EndTime);
                var gapEnd = lastEnd;
                if (newStart >= lastEnd)
                {
                    reassigned.Add(new ScheduleAssignment
                    {
                        WorkOrderId = a.WorkOrderId,
                        EquipmentId = alt.EquipmentId,
                        StartTime = newStart,
                        EndTime = newStart.Add(duration),
                        GroupId = a.GroupId,
                        SetupMinutes = a.SetupMinutes,
                        IsOnBottleneck = alt.IsBottleneck
                    });
                    assigned = true;
                    shiftedCount++;
                    currentStart = newStart.Add(duration);
                    break;
                }
            }

            if (!assigned)
            {
                // 留在原设备，从修复时间开始
                reassigned.Add(new ScheduleAssignment
                {
                    WorkOrderId = a.WorkOrderId,
                    EquipmentId = failedEquipmentId,
                    StartTime = newStart,
                    EndTime = newStart.Add(duration),
                    GroupId = a.GroupId,
                    SetupMinutes = a.SetupMinutes,
                    IsOnBottleneck = a.IsOnBottleneck
                });
                shiftedCount++;
                currentStart = newStart.Add(duration);
            }
        }

        var allAssignments = unaffected.Concat(reassigned).ToList();
        var disruptionScore = existingAssignments.Count > 0
            ? (double)shiftedCount / existingAssignments.Count
            : 0;

        _logger.LogInformation(
            "Rescheduled after equipment {EqId} failure, {ShiftedCount} orders shifted, disruption {Disruption:P1}",
            failedEquipmentId, shiftedCount, disruptionScore);

        return new ReschedulingResult
        {
            Assignments = allAssignments,
            Success = true,
            DisruptionScore = Math.Round(disruptionScore * 100, 1),
            ShiftedOrderCount = shiftedCount
        };
    }

    private async Task<ReschedulingResult> TryPreemptiveInsertAsync(
        List<ScheduleAssignment> existingAssignments,
        WorkOrderInfo rushOrder,
        List<EquipmentCapacitySummary> equipment,
        List<ChangeoverEntry> changeoverMatrix,
        HashSet<string> locked,
        InsertionPolicy policy,
        DateTime now,
        CancellationToken ct)
    {
        // 找到可被抢占的低优先级工单
        var bumpable = existingAssignments
            .Where(a => !locked.Contains(a.WorkOrderId))
            .OrderByDescending(a => a.StartTime)  // 越晚的越优先被挤掉
            .ToList();

        if (bumpable.Count == 0)
        {
            return new ReschedulingResult
            {
                Assignments = existingAssignments,
                Success = false,
                ErrorMessage = "无可被抢占的工单"
            };
        }

        // 移除最后一个可被抢占的工单
        var toRemove = bumpable[^1];
        var remainingAssignments = existingAssignments
            .Where(a => a.WorkOrderId != toRemove.WorkOrderId)
            .ToList();

        _logger.LogInformation("Preempting order {OrderId} for rush order {RushId}",
            toRemove.WorkOrderId, rushOrder.Id);

        // 递归尝试插单
        return await InsertRushOrderAsync(
            remainingAssignments, rushOrder, equipment, changeoverMatrix,
            policy, [.. locked], ct);
    }

    private static (string EquipmentId, DateTime GapStart, List<ScheduleAssignment> Shifted)? FindBestGap(
        Dictionary<string, List<ScheduleAssignment>> byEquipment,
        WorkOrderInfo rushOrder,
        List<EquipmentCapacitySummary> equipment,
        List<ChangeoverEntry> changeoverMatrix,
        HashSet<string> locked,
        InsertionPolicy policy,
        DateTime now)
    {
        (string EquipmentId, DateTime GapStart, List<ScheduleAssignment> Shifted)? best = null;
        var bestScore = double.MaxValue;

        foreach (var equip in equipment)
        {
            if (equip.AvailableCapacity <= 0) continue;

            var assignments = byEquipment.TryGetValue(equip.EquipmentId, out var list) ? list : [];
            var (gapStart, shifted) = FindEarliestGap(assignments, rushOrder, locked, now, policy.LookAheadWindow);

            if (!gapStart.HasValue) continue;

            // 评分：时间越早越好，扰动越小越好
            var timeScore = (gapStart.Value - now).TotalHours;
            var disruptionScore = shifted.Count * 10;
            var totalScore = timeScore + disruptionScore;

            if (best is null || totalScore < bestScore)
            {
                bestScore = totalScore;
                best = (equip.EquipmentId, gapStart.Value, shifted);
            }
        }

        return best;
    }

    private static (DateTime? GapStart, List<ScheduleAssignment> Shifted) FindEarliestGap(
        List<ScheduleAssignment> existingAssignments,
        WorkOrderInfo rushOrder,
        HashSet<string> locked,
        DateTime now,
        TimeSpan lookAhead)
    {
        var ordered = existingAssignments
            .Where(a => !locked.Contains(a.WorkOrderId))
            .OrderBy(a => a.StartTime)
            .ToList();

        var searchEnd = now + lookAhead;
        var currentPos = now;
        var shifted = new List<ScheduleAssignment>();

        foreach (var assignment in ordered)
        {
            if (assignment.StartTime > searchEnd) break;

            var gapMinutes = (assignment.StartTime - currentPos).TotalMinutes;
            // 简化的加工时间估算
            var neededMinutes = rushOrder.Quantity * 1.0;
            if (neededMinutes < 1) neededMinutes = 60;

            if (gapMinutes >= neededMinutes)
            {
                return (currentPos, shifted);
            }

            // 如果间隙不够，移动当前工单
            shifted.Add(assignment);
            currentPos = assignment.EndTime > currentPos.AddMinutes(neededMinutes)
                ? assignment.EndTime
                : currentPos.AddMinutes(neededMinutes);
        }

        // 检查末尾
        var remaining = (searchEnd - currentPos).TotalMinutes;
        if (remaining >= 60)
        {
            return (currentPos, shifted);
        }

        return (null, []);
    }

    private static List<ScheduleAssignment> RebuildAssignments(
        Dictionary<string, List<ScheduleAssignment>> byEquipment,
        string equipmentId,
        WorkOrderInfo rushOrder,
        DateTime gapStart,
        List<EquipmentCapacitySummary> equipment,
        List<ChangeoverEntry> changeoverMatrix,
        HashSet<string> locked,
        DateTime now)
    {
        var result = new List<ScheduleAssignment>();
        var inserted = false;
        var equip = equipment.FirstOrDefault(e => e.EquipmentId == equipmentId);

        foreach (var (eqId, assignments) in byEquipment)
        {
            foreach (var a in assignments.OrderBy(a => a.StartTime))
            {
                if (eqId == equipmentId && !inserted && a.StartTime >= gapStart)
                {
                    // 插入急单
                    var duration = TimeSpan.FromHours(Math.Max(rushOrder.Quantity / (equip?.ActualCapacity ?? 50) * 24, 1));
                    result.Add(new ScheduleAssignment
                    {
                        WorkOrderId = rushOrder.Id,
                        EquipmentId = equipmentId,
                        StartTime = gapStart,
                        EndTime = gapStart.Add(duration),
                        GroupId = rushOrder.ProductCode.Length >= 4 ? rushOrder.ProductCode[..4] : rushOrder.ProductCode,
                        SetupMinutes = 60,
                        IsOnBottleneck = equip?.IsBottleneck ?? false
                    });
                    inserted = true;

                    // 后续工单顺延
                    var shift = (gapStart.Add(duration) - a.StartTime);
                    if (!locked.Contains(a.WorkOrderId))
                    {
                        result.Add(new ScheduleAssignment
                        {
                            WorkOrderId = a.WorkOrderId,
                            EquipmentId = a.EquipmentId,
                            StartTime = a.StartTime.Add(shift),
                            EndTime = a.EndTime.Add(shift),
                            GroupId = a.GroupId,
                            SetupMinutes = a.SetupMinutes,
                            IsOnBottleneck = a.IsOnBottleneck
                        });
                    }
                    else
                    {
                        result.Add(a);
                    }
                }
                else
                {
                    result.Add(a);
                }
            }
        }

        // 如果队列中没有比 gapStart 更晚的工单，追加到最后
        if (!inserted)
        {
            var lastEnd = byEquipment.TryGetValue(equipmentId, out var eqAssignments) && eqAssignments.Count > 0
                ? eqAssignments.Max(a => a.EndTime)
                : now;
            var start = lastEnd > gapStart ? lastEnd : gapStart;
            var duration = TimeSpan.FromHours(Math.Max(rushOrder.Quantity / (equip?.ActualCapacity ?? 50) * 24, 1));
            result.Add(new ScheduleAssignment
            {
                WorkOrderId = rushOrder.Id,
                EquipmentId = equipmentId,
                StartTime = start,
                EndTime = start.Add(duration),
                GroupId = rushOrder.ProductCode.Length >= 4 ? rushOrder.ProductCode[..4] : rushOrder.ProductCode,
                SetupMinutes = 60,
                IsOnBottleneck = equip?.IsBottleneck ?? false
            });
        }

        return result;
    }
}
