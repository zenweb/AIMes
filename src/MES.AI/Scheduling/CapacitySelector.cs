namespace MES.AI.Core.Scheduling;

using MES.AI.Core.Models;
using MES.Domain.Entities.Scheduling;

/// <summary>设备选择策略</summary>
public static class CapacitySelector
{
    /// <summary>根据策略选择最优设备</summary>
    public static EquipmentCapacitySummary? SelectBest(
        List<EquipmentCapacitySummary> candidates,
        WorkOrderInfo order,
        IReadOnlyDictionary<string, DateTime> equipmentAvailability,
        IReadOnlyDictionary<string, string?> lastProductOnEquipment,
        List<ChangeoverEntry> changeoverMatrix,
        CapacitySelectionStrategy strategy)
    {
        if (candidates.Count == 0) return null;
        if (candidates.Count == 1) return candidates[0];

        return strategy switch
        {
            CapacitySelectionStrategy.EarliestAvailable => candidates
                .OrderBy(e => equipmentAvailability.GetValueOrDefault(e.EquipmentId, DateTime.MinValue))
                .ThenBy(e => e.EquipmentId)
                .First(),

            CapacitySelectionStrategy.LeastLoaded => candidates
                .OrderBy(e => e.UtilizationRate)
                .ThenBy(e => e.EquipmentId)
                .First(),

            CapacitySelectionStrategy.MostSuitable => candidates
                .OrderByDescending(e => CalculateSuitabilityScore(e, order))
                .ThenBy(e => e.EquipmentId)
                .First(),

            CapacitySelectionStrategy.LeastChangeoverCost => candidates
                .OrderBy(e => EstimateChangeoverCost(e, order, lastProductOnEquipment, changeoverMatrix))
                .ThenBy(e => e.EquipmentId)
                .First(),

            _ => candidates.First()
        };
    }

    private static double CalculateSuitabilityScore(EquipmentCapacitySummary equipment, WorkOrderInfo order)
    {
        var score = 0.0;
        if (equipment.IsBottleneck) score += 10;
        if (equipment.AvailableCapacity > 0) score += 5;
        return score;
    }

    private static double EstimateChangeoverCost(
        EquipmentCapacitySummary equipment,
        WorkOrderInfo order,
        IReadOnlyDictionary<string, string?> lastProductOnEquipment,
        List<ChangeoverEntry> changeoverMatrix)
    {
        if (!lastProductOnEquipment.TryGetValue(equipment.EquipmentId, out var lastProduct) || lastProduct is null)
            return 0;

        var entry = changeoverMatrix.Find(c =>
            c.FromProductCode == lastProduct && c.ToProductCode == order.ProductCode);

        return entry?.SetupTimeMinutes ?? 120;
    }
}
