using MES.Domain.Interfaces.Services;

namespace MES.Infrastructure.Services;

using MES.Domain.Entities.Scheduling;

/// <summary>物料齐套检查服务 — 校验物料可用量是否满足工单需求</summary>
public class MaterialKittingChecker : IMaterialKittingChecker
{
    private readonly IBomExplosionService _bomExplosion;

    public MaterialKittingChecker(IBomExplosionService bomExplosion)
    {
        _bomExplosion = bomExplosion;
    }

    /// <summary>检查单个产品在给定数量下是否齐套</summary>
    public async Task<KittingCheckResult> CheckAsync(
        string productCode,
        int orderQuantity,
        List<MaterialAvailabilitySummary> materialAvailabilities,
        CancellationToken ct = default)
    {
        var bomItems = await _bomExplosion.ExplodeAsync(productCode, ct);
        var materialMap = materialAvailabilities
            .ToDictionary(m => m.MaterialCode, m => m);

        var items = new List<KittingCheckItem>();
        foreach (var bom in bomItems)
        {
            var requiredQty = bom.QuantityPerUnit * orderQuantity;
            var available = materialMap.TryGetValue(bom.MaterialCode, out var mat)
                ? mat.AvailableQuantity - mat.ReservedQuantity
                : 0;
            var shortage = Math.Max(0, requiredQty - available);

            items.Add(new KittingCheckItem(
                bom.MaterialCode,
                bom.MaterialName,
                requiredQty,
                available,
                shortage,
                shortage <= 0));
        }

        return new KittingCheckResult
        {
            ProductCode = productCode,
            OrderQuantity = orderQuantity,
            Items = items
        };
    }
}
