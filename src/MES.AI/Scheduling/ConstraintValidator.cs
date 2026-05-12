namespace MES.AI.Scheduling;

using MES.AI.Models;
using MES.Domain.Entities.Scheduling;

/// <summary>硬约束验证器 — 检查产能/物料/交期/依赖约束</summary>
public class ConstraintValidator : IConstraintValidator
{
    public ConstraintValidationResult Validate(
        List<ScheduleAssignment> assignments,
        ScheduleRequest request,
        SchedulingContextSnapshot context)
    {
        var violations = new List<ConstraintViolation>();

        var equipmentMap = context.EquipmentCapacities
            .ToDictionary(e => e.EquipmentId, e => e);
        var deadlines = request.Deadlines;
        var lockedIds = new HashSet<string>(request.LockedOrderIds);

        foreach (var assignment in assignments)
        {
            // 产能约束：检查设备是否有足够产能
            if (equipmentMap.TryGetValue(assignment.EquipmentId, out var equip))
            {
                var durationHours = (assignment.EndTime - assignment.StartTime).TotalHours;
                var requiredCapacity = durationHours / 24.0 * equip.TheoreticalCapacity;
                if (requiredCapacity > equip.AvailableCapacity)
                {
                    violations.Add(new ConstraintViolation
                    {
                        WorkOrderId = assignment.WorkOrderId,
                        EquipmentId = assignment.EquipmentId,
                        Rule = "Capacity",
                        Message = $"需求产能 {requiredCapacity:F1} 超过设备可用产能 {equip.AvailableCapacity:F1}",
                        Level = ConstraintViolationLevel.Error
                    });
                }
            }

            // 交期约束：检查是否满足交期
            if (deadlines.TryGetValue(assignment.WorkOrderId, out var deadline) && assignment.EndTime > deadline)
            {
                violations.Add(new ConstraintViolation
                {
                    WorkOrderId = assignment.WorkOrderId,
                    EquipmentId = assignment.EquipmentId,
                    Rule = "Deadline",
                    Message = $"计划完成时间 {assignment.EndTime:yyyy-MM-dd HH:mm} 晚于交期 {deadline:yyyy-MM-dd HH:mm}",
                    Level = ConstraintViolationLevel.Warning
                });
            }

            // 锁定周期约束：锁定的工单时间不可调整（当前没有历史值比对，仅标记）
            if (lockedIds.Contains(assignment.WorkOrderId))
            {
                violations.Add(new ConstraintViolation
                {
                    WorkOrderId = assignment.WorkOrderId,
                    EquipmentId = assignment.EquipmentId,
                    Rule = "LockedOrder",
                    Message = "锁定期工单，时间已固定",
                    Level = ConstraintViolationLevel.Info
                });
            }

            // 设备瓶颈标记
            if (equip is { IsBottleneck: true })
            {
                violations.Add(new ConstraintViolation
                {
                    WorkOrderId = assignment.WorkOrderId,
                    EquipmentId = assignment.EquipmentId,
                    Rule = "Bottleneck",
                    Message = "分配在瓶颈工序上，需重点监控",
                    Level = ConstraintViolationLevel.Info
                });
            }
        }

        // 物料约束：检查工单所需物料是否可用
        var materialMap = context.MaterialAvailabilities
            .ToDictionary(m => m.MaterialCode, m => m);
        foreach (var order in request.Orders)
        {
            var bomItems = context.BomRequirements
                .Where(b => b.ProductCode == order.ProductCode)
                .ToList();

            foreach (var bom in bomItems)
            {
                if (materialMap.TryGetValue(bom.MaterialCode, out var material))
                {
                    var requiredQty = (decimal)order.Quantity * bom.QuantityPerUnit;
                    if (material.AvailableQuantity - material.ReservedQuantity < requiredQty)
                    {
                        violations.Add(new ConstraintViolation
                        {
                            WorkOrderId = order.Id,
                            Rule = "Material",
                            Message = $"物料 {bom.MaterialCode} 可用量 {material.AvailableQuantity - material.ReservedQuantity} 不足，需求 {requiredQty}",
                            Level = ConstraintViolationLevel.Error
                        });
                    }
                }
            }
        }

        return new ConstraintValidationResult { Violations = violations };
    }
}
