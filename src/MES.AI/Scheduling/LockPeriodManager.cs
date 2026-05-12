namespace MES.AI.Core.Scheduling;

using MES.AI.Core.Models;

/// <summary>锁定周期管理 — 确定哪些工单在锁定期内不可调整</summary>
public class LockPeriodManager
{
    private readonly TimeSpan _defaultLockDuration;

    public LockPeriodManager(TimeSpan? defaultLockDuration = null)
    {
        _defaultLockDuration = defaultLockDuration ?? TimeSpan.FromHours(8);
    }

    /// <summary>判断工单是否在锁定期内（开始时间距现在 < 锁定时长）</summary>
    public bool IsWithinLockPeriod(DateTime orderStartTime, DateTime? now = null)
    {
        var reference = now ?? DateTime.UtcNow;
        return orderStartTime > reference && orderStartTime - reference <= _defaultLockDuration;
    }

    /// <summary>从排产方案中提取锁定的工单 ID 列表</summary>
    public List<string> GetLockedOrderIds(
        List<ScheduleAssignment> assignments,
        TimeSpan? lockDuration = null,
        DateTime? now = null)
    {
        var duration = lockDuration ?? _defaultLockDuration;
        var reference = now ?? DateTime.UtcNow;
        var lockCutoff = reference + duration;

        return assignments
            .Where(a => a.StartTime <= lockCutoff && a.StartTime > reference)
            .Select(a => a.WorkOrderId)
            .Distinct()
            .ToList();
    }
}
