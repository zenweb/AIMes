using MES.Domain.Interfaces.Services;

namespace MES.Infrastructure.Services;

using MES.Domain.Entities.Scheduling;
using MES.Domain.Interfaces.Repositories;
using Microsoft.Extensions.Logging;

/// <summary>BOM 多层级递归展开服务</summary>
public class BomExplosionService : IBomExplosionService
{
    private readonly IBomRepository _bomRepository;
    private readonly ILogger<BomExplosionService> _logger;

    public BomExplosionService(IBomRepository bomRepository, ILogger<BomExplosionService> logger)
    {
        _bomRepository = bomRepository;
        _logger = logger;
    }

    /// <summary>递归展开 BOM 到叶子节点，返回完整物料清单（含每级累计用量）</summary>
    public async Task<List<BomRequirementSummary>> ExplodeAsync(string productCode, CancellationToken ct = default)
    {
        var boms = await _bomRepository.GetByProductCodeAsync(new Domain.ValueObjects.ProductCode(productCode), ct);
        var bom = boms.FirstOrDefault(b => b.BomVersionStatus == Domain.Entities.Bom.BomVersionStatus.Released);
        bom ??= boms.FirstOrDefault();

        if (bom is null)
        {
            _logger.LogWarning("BOM not found for product code: {ProductCode}", productCode);
            return [];
        }

        var result = new List<BomRequirementSummary>();
        foreach (var item in bom.Items)
        {
            ExplodeItem(item, 1, result);
        }
        return result;
    }

    private static void ExplodeItem(Domain.Entities.Bom.BomItem item, decimal parentQuantity, List<BomRequirementSummary> result)
    {
        var totalQuantity = parentQuantity * ApplyLossRate(item.Quantity, item.LossRate);

        if (item.Children.Count > 0)
        {
            foreach (var child in item.Children)
            {
                ExplodeItem(child, totalQuantity, result);
            }
        }
        else
        {
            result.Add(new BomRequirementSummary(
                string.Empty, // ProductCode filled by caller
                item.MaterialCode.Value,
                item.MaterialName,
                totalQuantity,
                item.Unit,
                item.LossRate));
        }
    }

    private static decimal ApplyLossRate(decimal quantity, decimal? lossRate)
    {
        return lossRate is > 0 ? quantity * (1 + lossRate.Value) : quantity;
    }

    /// <summary>批量展开多个产品的 BOM</summary>
    public async Task<Dictionary<string, List<BomRequirementSummary>>> ExplodeBatchAsync(
        IEnumerable<string> productCodes, CancellationToken ct = default)
    {
        var result = new Dictionary<string, List<BomRequirementSummary>>();
        foreach (var code in productCodes.Distinct())
        {
            var items = await ExplodeAsync(code, ct);
            // 填充 ProductCode
            result[code] = items.Select(i => new BomRequirementSummary(
                code, i.MaterialCode, i.MaterialName, i.QuantityPerUnit, i.Unit, i.LossRate)).ToList();
        }
        return result;
    }
}
