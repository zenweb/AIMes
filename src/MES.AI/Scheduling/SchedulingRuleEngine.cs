namespace MES.AI.Scheduling;

using MES.AI.Models;
using MES.Domain.Entities.Scheduling;
using Microsoft.Extensions.Logging;

/// <summary>确定性排产规则引擎 — 不依赖LLM，基于确定性规则生成初始排产方案</summary>
public class SchedulingRuleEngine : ISchedulingRuleEngine
{
    private readonly IConstraintValidator _validator;
    private readonly ILogger<SchedulingRuleEngine> _logger;

    public SchedulingRuleEngine(IConstraintValidator validator, ILogger<SchedulingRuleEngine> logger)
    {
        _validator = validator;
        _logger = logger;
    }

    public Task<RuleEngineResult> GenerateInitialScheduleAsync(
        ScheduleRequest request,
        SchedulingContextSnapshot context,
        PriorityRule priorityRule = PriorityRule.EDD,
        CapacitySelectionStrategy capacityStrategy = CapacitySelectionStrategy.LeastLoaded,
        CancellationToken ct = default)
    {
        return GenerateInitialScheduleInternalAsync(request, context, priorityRule, capacityStrategy, null, ct);
    }

    internal Task<RuleEngineResult> GenerateInitialScheduleInternalAsync(
        ScheduleRequest request,
        SchedulingContextSnapshot context,
        PriorityRule priorityRule,
        CapacitySelectionStrategy capacityStrategy,
        DateTime? referenceTime,
        CancellationToken ct)
    {
        var now = referenceTime ?? DateTime.UtcNow;
        var orders = PriorityRuleEngine.Sort(request.Orders, priorityRule, now);

        // 排产锁定工单优先（排在队列最前）
        var lockedIds = new HashSet<string>(request.LockedOrderIds);
        var locked = orders.Where(o => lockedIds.Contains(o.Id)).ToList();
        var normal = orders.Where(o => !lockedIds.Contains(o.Id)).ToList();
        orders = [.. locked, .. normal];

        // 设备状态跟踪
        var equipmentAvailability = context.EquipmentCapacities
            .ToDictionary(e => e.EquipmentId, _ => now);
        var lastProductOnEquipment = new Dictionary<string, string?>();
        var equipmentAssignments = context.EquipmentCapacities
            .ToDictionary(e => e.EquipmentId, _ => new List<ScheduleAssignment>());

        var assignments = new List<ScheduleAssignment>();
        var bottlenecks = context.EquipmentCapacities.Where(e => e.IsBottleneck).ToList();

        var groupIds = new HashSet<string>();

        foreach (var order in orders)
        {
            ct.ThrowIfCancellationRequested();

            // 1. 筛选可用设备
            var eligible = GetEligibleEquipment(order, context.EquipmentCapacities);
            if (eligible.Count == 0) continue;

            // 2. 选择最优设备
            var selected = CapacitySelector.SelectBest(
                eligible, order, equipmentAvailability, lastProductOnEquipment,
                context.ChangeoverMatrix, capacityStrategy);

            if (selected is null) continue;

            // 3. 计算换线时间
            var changeoverTime = CalculateChangeoverTime(
                selected, order, lastProductOnEquipment, context.ChangeoverMatrix);

            // 4. 确定开始时间
            var availTime = equipmentAvailability.GetValueOrDefault(selected.EquipmentId, now);
            var startTime = availTime > now ? availTime : now;

            // 5. 计算加工时间（小时）
            var processingHours = selected.ActualCapacity > 0
                ? order.Quantity / selected.ActualCapacity * 24.0
                : order.Quantity * 1.0;

            var endTime = startTime
                .AddHours(processingHours)
                .AddMinutes(changeoverTime);

            // 6. 分组（同产品族连续生产）
            var groupId = order.ProductCode.Length >= 4
                ? order.ProductCode[..4]
                : order.ProductCode;
            groupIds.Add(groupId);

            // 7. 创建分配记录
            var assignment = new ScheduleAssignment
            {
                WorkOrderId = order.Id,
                EquipmentId = selected.EquipmentId,
                StartTime = startTime,
                EndTime = endTime,
                GroupId = groupId,
                SetupMinutes = changeoverTime,
                IsOnBottleneck = selected.IsBottleneck,
                Dependencies = []
            };

            equipmentAssignments[selected.EquipmentId].Add(assignment);
            assignments.Add(assignment);

            // 8. 更新设备状态
            equipmentAvailability[selected.EquipmentId] = endTime;
            lastProductOnEquipment[selected.EquipmentId] = order.ProductCode;
        }

        // 9. 计算指标
        var metrics = CalculateMetrics(assignments, orders, context, now);
        var validation = _validator.Validate(assignments, request, context);

        // 10. 瓶颈分析
        var bottleneckInfo = BuildBottleneckInfo(assignments, bottlenecks);

        var result = new RuleEngineResult
        {
            Assignments = assignments,
            EstimatedCompletion = assignments.Count > 0
                ? assignments.Max(a => a.EndTime)
                : now,
            UtilizationRate = metrics.UtilizationRate,
            OnTimeDeliveryRate = metrics.OnTimeDeliveryRate,
            TotalChangeoverMinutes = assignments.Sum(a => a.SetupMinutes),
            GroupCount = groupIds.Count,
            BottleneckInfo = bottleneckInfo,
            Validation = validation
        };

        return Task.FromResult(result);
    }

    private static List<EquipmentCapacitySummary> GetEligibleEquipment(
        WorkOrderInfo order,
        List<EquipmentCapacitySummary> allEquipment)
    {
        return allEquipment
            .Where(e => e.AvailableCapacity > 0)
            .ToList();
    }

    private static double CalculateChangeoverTime(
        EquipmentCapacitySummary equipment,
        WorkOrderInfo order,
        IReadOnlyDictionary<string, string?> lastProductOnEquipment,
        List<ChangeoverEntry> changeoverMatrix)
    {
        if (!lastProductOnEquipment.TryGetValue(equipment.EquipmentId, out var lastProduct) || lastProduct is null)
            return 0;

        var entry = changeoverMatrix.Find(c =>
            c.FromProductCode == lastProduct && c.ToProductCode == order.ProductCode);

        if (entry is not null) return entry.SetupTimeMinutes;

        // 根据产品编码前缀估算
        var sameFamily = lastProduct.Length >= 4 && order.ProductCode.Length >= 4
            && lastProduct[..4] == order.ProductCode[..4];
        return sameFamily ? 60 : 240;
    }

    private static (double UtilizationRate, double OnTimeDeliveryRate) CalculateMetrics(
        List<ScheduleAssignment> assignments,
        List<WorkOrderInfo> orders,
        SchedulingContextSnapshot context,
        DateTime now)
    {
        if (assignments.Count == 0 || context.EquipmentCapacities.Count == 0)
            return (0, 0);

        // 计算总利用率：已用时间 / (设备数 × 计划窗口小时数)
        var minStart = assignments.Min(a => a.StartTime);
        var maxEnd = assignments.Max(a => a.EndTime);
        var windowHours = Math.Max((maxEnd - minStart).TotalHours, 1);
        var totalAvailableHours = context.EquipmentCapacities.Count(e => e.AvailableCapacity > 0) * windowHours;
        var totalUsedHours = assignments.Sum(a => (a.EndTime - a.StartTime).TotalHours);

        var utilizationRate = totalAvailableHours > 0
            ? Math.Round(totalUsedHours / totalAvailableHours * 100, 1)
            : 0;

        // 计算准时交付率
        var deadlines = orders.ToDictionary(o => o.Id, o => o.DueDate);
        var onTimeCount = assignments.Count(a =>
            deadlines.TryGetValue(a.WorkOrderId, out var deadline)
            && a.EndTime <= deadline);

        var onTimeDeliveryRate = assignments.Count > 0
            ? Math.Round((double)onTimeCount / assignments.Count * 100, 1)
            : 0;

        return (utilizationRate, onTimeDeliveryRate);
    }

    private static string? BuildBottleneckInfo(
        List<ScheduleAssignment> assignments,
        List<EquipmentCapacitySummary> bottlenecks)
    {
        if (bottlenecks.Count == 0) return null;

        var bottleneckAssignments = assignments
            .Where(a => a.IsOnBottleneck)
            .ToList();

        var bottleneckNames = string.Join(", ", bottlenecks.Select(b => b.EquipmentName));

        return bottleneckAssignments.Count > 0
            ? $"瓶颈工序: {bottleneckNames}，共 {bottleneckAssignments.Count} 个工单分配在瓶颈上"
            : $"瓶颈工序: {bottleneckNames}，当前无工单分配";
    }
}
