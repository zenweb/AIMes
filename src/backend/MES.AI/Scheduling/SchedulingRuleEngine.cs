namespace MES.AI.Core.Scheduling;

using System.Diagnostics;
using MES.AI.Core.Models;
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

    public Task<RuleEngineResult> GenerateInitialScheduleAsync(
        ScheduleRequest request,
        SchedulingContextSnapshot context,
        PriorityRule priorityRule,
        CapacitySelectionStrategy capacityStrategy,
        WeightedSchedulingConfig config,
        CancellationToken ct)
    {
        return GenerateInitialScheduleInternalAsync(request, context, priorityRule, capacityStrategy, null, config, ct);
    }

    /// <summary>根据瓶颈利用率自动调整权重配置</summary>
    public static WeightedSchedulingConfig AdjustWeightsForBottlenecks(
        WeightedSchedulingConfig config,
        SchedulingContextSnapshot context)
    {
        if (context.EquipmentCapacities.Count == 0) return config;

        var bottleneckUtil = context.EquipmentCapacities
            .Where(e => e.IsBottleneck)
            .Select(e => e.UtilizationRate)
            .DefaultIfEmpty(0)
            .Average();

        // 瓶颈利用率 > 80%: 提高交期权重，优先排紧迫工单
        if (bottleneckUtil > 0.80)
        {
            return config with
            {
                DueDateWeight = Math.Min(0.8, config.DueDateWeight + 0.2),
                ProcessingTimeWeight = Math.Max(0.05, config.ProcessingTimeWeight - 0.1),
                EnableBatchScheduling = true
            };
        }

        // 瓶颈利用率 > 60%: 适度调整
        if (bottleneckUtil > 0.60)
        {
            return config with
            {
                DueDateWeight = Math.Min(0.65, config.DueDateWeight + 0.1),
                EnableBatchScheduling = true
            };
        }

        return config;
    }

    private RuleEngineResult RecordMetrics(RuleEngineResult result, int orderCount, long elapsedMs)
    {
        MesMetrics.SchedulingDuration.Record(elapsedMs / 1000.0);
        MesMetrics.SchedulingOrderCount.Record(orderCount);
        MesMetrics.SchedulingOnTimeDelivery.Record(result.OnTimeDeliveryRate);
        MesMetrics.SchedulingUtilization.Record(result.UtilizationRate);
        return result;
    }

    internal Task<RuleEngineResult> GenerateInitialScheduleInternalAsync(
        ScheduleRequest request,
        SchedulingContextSnapshot context,
        PriorityRule priorityRule,
        CapacitySelectionStrategy capacityStrategy,
        DateTime? referenceTime,
        CancellationToken ct)
    {
        return GenerateInitialScheduleInternalAsync(request, context, priorityRule, capacityStrategy, referenceTime, null, ct);
    }

    internal Task<RuleEngineResult> GenerateInitialScheduleInternalAsync(
        ScheduleRequest request,
        SchedulingContextSnapshot context,
        PriorityRule priorityRule,
        CapacitySelectionStrategy capacityStrategy,
        DateTime? referenceTime,
        WeightedSchedulingConfig? schedulingConfig,
        CancellationToken ct)
    {
        var sw = System.Diagnostics.Stopwatch.StartNew();
        var now = referenceTime ?? DateTime.UtcNow;
        var orders = PriorityRuleEngine.Sort(request.Orders, priorityRule, now);

        // 批次排产: 按产品族分组，减少换线时间
        if (schedulingConfig?.EnableBatchScheduling == true || priorityRule == PriorityRule.WeightedComposite)
        {
            orders = [.. orders
                .GroupBy(o => o.ProductCode.Length >= 4 ? o.ProductCode[..4] : o.ProductCode)
                .OrderByDescending(g => g.Max(o => o.Priority))
                .SelectMany(g => g)];
        }

        // 排产锁定工单优先（排在队列最前）
        var lockedIds = new HashSet<string>(request.LockedOrderIds);
        var locked = orders.Where(o => lockedIds.Contains(o.Id)).ToList();
        var normal = orders.Where(o => !lockedIds.Contains(o.Id)).ToList();
        orders = [.. locked, .. normal];

        // ---- A层/B层增强: 物料齐套预检 ----
        var warnings = new List<string>();
        var skippedOrderIds = new List<string>();
        var bomMap = BuildBomRequirementMap(context.BomRequirements);
        var materialMap = context.MaterialAvailabilities
            .ToDictionary(m => m.MaterialCode, m => m);
        var routeMap = context.Routings.ToDictionary(r => r.RouteCode, r => r);

        // ---- A层增强: 路由工序关联的设备类型匹配 ----
        var routeEquipmentHints = BuildRouteEquipmentHints(context);

        // ---- B层增强: 过滤物料不足的工单 ----
        var filteredOrders = new List<WorkOrderInfo>();
        foreach (var order in orders)
        {
            ct.ThrowIfCancellationRequested();

            if (lockedIds.Contains(order.Id))
            {
                filteredOrders.Add(order);
                continue;
            }

            if (bomMap.TryGetValue(order.ProductCode, out var bomItems))
            {
                var hasShortage = false;
                foreach (var (materialCode, qtyPerUnit) in bomItems)
                {
                    var required = (decimal)order.Quantity * qtyPerUnit;
                    var available = (decimal)(materialMap.TryGetValue(materialCode, out var m)
                        ? m.AvailableQuantity - m.ReservedQuantity
                        : 0);
                    if (available < required)
                    {
                        hasShortage = true;
                        warnings.Add($"工单 {order.OrderNumber}({order.ProductCode}) 缺料: {materialCode} 需 {required:F0} 可用 {(double)available:F0}");
                        break;
                    }
                }
                if (hasShortage)
                {
                    skippedOrderIds.Add(order.Id);
                    continue;
                }
            }

            filteredOrders.Add(order);
        }
        orders = filteredOrders;

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

            // 1. 筛选可用设备（含 A层 路由工序关联）
            var eligible = GetEligibleEquipment(order, context.EquipmentCapacities, routeEquipmentHints);
            if (eligible.Count == 0)
            {
                warnings.Add($"工单 {order.OrderNumber}({order.ProductCode}) 无匹配设备（路由: {order.RouteCode}），跳过");
                skippedOrderIds.Add(order.Id);
                continue;
            }

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
            Validation = validation,
            Warnings = warnings,
            SkippedOrderIds = skippedOrderIds
        };

        RecordMetrics(result, orders.Count, sw.ElapsedMilliseconds);
        return Task.FromResult(result);
    }

    /// <summary>按产品编码预聚合 BOM 用量: ProductCode → (MaterialCode, QtyPerUnit)[]</summary>
    private static Dictionary<string, List<(string MaterialCode, decimal QtyPerUnit)>> BuildBomRequirementMap(
        List<BomRequirementSummary> bomRequirements)
    {
        var map = new Dictionary<string, List<(string, decimal)>>();
        foreach (var bom in bomRequirements)
        {
            if (!map.ContainsKey(bom.ProductCode))
                map[bom.ProductCode] = [];
            map[bom.ProductCode].Add((bom.MaterialCode, bom.QuantityPerUnit));
        }
        return map;
    }

    /// <summary>从工序路由数据建立产品 → 所需设备类型提示</summary>
    private static Dictionary<string, HashSet<string>> BuildRouteEquipmentHints(
        SchedulingContextSnapshot context)
    {
        // 从 EquipmentCapacities 提取设备类型 → 设备ID 映射
        var typeToIds = new Dictionary<string, HashSet<string>>();
        foreach (var eq in context.EquipmentCapacities)
        {
            if (!typeToIds.ContainsKey(eq.EquipmentType))
                typeToIds[eq.EquipmentType] = [];
            typeToIds[eq.EquipmentType].Add(eq.EquipmentId);
        }

        // 工序步数较多的路由 → 需要更通用的设备（多工序设备）
        var routeHints = new Dictionary<string, HashSet<string>>();
        foreach (var route in context.Routings)
        {
            var hint = new HashSet<string>();
            if (route.StepCount <= 3)
            {
                // 少工序: 匹配 CNC/注塑机等专用设备
                foreach (var type in typeToIds.Keys)
                {
                    if (type is "CNC" or "InjectionMolding" or "冲压机")
                        hint.UnionWith(typeToIds[type]);
                }
            }
            else
            {
                // 多工序: 匹配组装线等通用设备
                foreach (var type in typeToIds.Keys)
                {
                    if (type is "Assembly" or "组装线")
                        hint.UnionWith(typeToIds[type]);
                }
            }
            routeHints[route.RouteCode] = hint;
        }
        return routeHints;
    }

    private static List<EquipmentCapacitySummary> GetEligibleEquipment(
        WorkOrderInfo order,
        List<EquipmentCapacitySummary> allEquipment,
        Dictionary<string, HashSet<string>>? routeHints = null)
    {
        var eligible = allEquipment
            .Where(e => e.AvailableCapacity > 0)
            .ToList();

        // 如果存在路由工序提示，按设备类型进一步筛选
        if (routeHints is { Count: > 0 } && !string.IsNullOrEmpty(order.RouteCode)
            && routeHints.TryGetValue(order.RouteCode, out var hintIds))
        {
            var hinted = eligible.Where(e => hintIds.Contains(e.EquipmentId)).ToList();
            if (hinted.Count > 0)
                eligible = hinted;
        }

        return eligible;
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
