using MES.Application.DTOs;
using MES.Domain.Entities.Bom;
using MES.Domain.Entities.Production;
using MES.Domain.Interfaces.Repositories;
using MES.Domain.ValueObjects;

namespace MES.Application.Services;

public interface IBomAppService
{
    Task<PagedResult<BomSummaryDto>> GetAllBomsAsync(int page = 1, int pageSize = 20, CancellationToken ct = default);
    Task<BomDetailDto?> GetBomByIdAsync(string id, CancellationToken ct = default);
    Task<BomExplosionResultDto> ExplodeBomAsync(string bomId, decimal quantity = 1, CancellationToken ct = default);
    Task<BomSummaryDto> CreateBomAsync(CreateBomRequest request, CancellationToken ct = default);
    Task<KittingCheckResultDto> CheckKittingAsync(string bomId, decimal quantity = 1, CancellationToken ct = default);
}

public class BomAppService : IBomAppService
{
    private readonly IBomRepository _bomRepo;
    private readonly IMaterialRepository _materialRepo;

    public BomAppService(IBomRepository bomRepo, IMaterialRepository materialRepo)
    {
        _bomRepo = bomRepo;
        _materialRepo = materialRepo;
    }

    public async Task<PagedResult<BomSummaryDto>> GetAllBomsAsync(int page = 1, int pageSize = 20, CancellationToken ct = default)
    {
        var all = await _bomRepo.GetAllAsync(ct);
        var skip = Math.Max(0, page - 1) * pageSize;
        return new PagedResult<BomSummaryDto>
        {
            Items = all.Skip(skip).Take(pageSize).Select(MapToSummary).ToList(),
            TotalCount = all.Count,
            Page = page,
            PageSize = pageSize,
        };
    }

    public async Task<BomDetailDto?> GetBomByIdAsync(string id, CancellationToken ct = default)
    {
        var bom = await _bomRepo.GetByIdAsync(id, ct);
        return bom != null ? MapToDetail(bom) : null;
    }

    public async Task<BomExplosionResultDto> ExplodeBomAsync(string bomId, decimal quantity = 1, CancellationToken ct = default)
    {
        var bom = await _bomRepo.GetByIdAsync(bomId, ct);
        if (bom == null)
            throw new InvalidOperationException($"BOM {bomId} 不存在");

        var items = ExplodeItems(bom.Items, quantity, 0);
        return new BomExplosionResultDto
        {
            BomId = bom.Id,
            BomName = bom.BomName,
            ProductCode = bom.ProductCode.Value,
            ProductName = bom.ProductName,
            Items = items
        };
    }

    public async Task<BomSummaryDto> CreateBomAsync(CreateBomRequest request, CancellationToken ct = default)
    {
        var bomType = request.BomType switch
        {
            "Engineering" => BomType.Engineering,
            "Service" => BomType.Service,
            _ => BomType.Manufacturing
        };

        var bom = new BillOfMaterial(
            request.BomCode,
            request.BomName,
            new ProductCode(request.ProductCode),
            request.ProductName,
            bomType,
            "V1.0");

        foreach (var itemReq in request.Items)
        {
            var item = new BomItem(
                new MaterialCode(itemReq.MaterialCode),
                itemReq.MaterialName,
                itemReq.Quantity,
                itemReq.Unit,
                itemReq.Sequence,
                itemReq.LossRate,
                itemReq.LeadTimeDays,
                itemReq.ConsumptionTiming);
            bom.AddItem(item);
        }

        var created = await _bomRepo.AddAsync(bom, ct);
        return MapToSummary(created);
    }

    public async Task<KittingCheckResultDto> CheckKittingAsync(string bomId, decimal quantity = 1, CancellationToken ct = default)
    {
        var bom = await _bomRepo.GetByIdAsync(bomId, ct);
        if (bom == null)
            throw new InvalidOperationException($"BOM {bomId} 不存在");

        // 展平 BOM 并按物料编码汇总需求
        var explosion = ExplodeItems(bom.Items, quantity, 0);
        var flatRequirements = new Dictionary<string, (decimal Total, string Name, string Unit)>();
        FlattenRequirements(explosion, flatRequirements);

        // 逐物料检查可用库存
        var items = new List<KittingItemDto>();
        foreach (var (materialCode, (total, name, unit)) in flatRequirements)
        {
            var material = await _materialRepo.GetByCodeAsync(materialCode, ct);
            var available = material?.NetAvailable ?? 0;
            var shortage = Math.Max(0, total - available);
            items.Add(new KittingItemDto
            {
                MaterialCode = materialCode,
                MaterialName = name,
                RequiredQuantity = total,
                AvailableQuantity = available,
                ShortageQuantity = shortage,
                IsAvailable = shortage <= 0,
                Unit = unit
            });
        }

        return new KittingCheckResultDto
        {
            BomId = bom.Id,
            BomName = bom.BomName,
            ProductCode = bom.ProductCode.Value,
            ProductName = bom.ProductName,
            RequiredQuantity = quantity,
            AllAvailable = items.All(i => i.IsAvailable),
            Items = [.. items.OrderBy(i => i.MaterialCode)]
        };
    }

    private static void FlattenRequirements(List<BomExplosionItemDto> items, Dictionary<string, (decimal Total, string Name, string Unit)> result)
    {
        foreach (var item in items)
        {
            if (result.TryGetValue(item.MaterialCode, out var existing))
                result[item.MaterialCode] = (existing.Total + item.TotalQuantity, item.MaterialName, item.Unit);
            else
                result[item.MaterialCode] = (item.TotalQuantity, item.MaterialName, item.Unit);

            if (item.Children.Count > 0)
                FlattenRequirements(item.Children, result);
        }
    }

    private List<BomExplosionItemDto> ExplodeItems(List<BomItem> items, decimal multiplier, int level)
    {
        var result = new List<BomExplosionItemDto>();
        foreach (var item in items)
        {
            var total = item.Quantity * multiplier;
            var dto = new BomExplosionItemDto
            {
                MaterialCode = item.MaterialCode.Value,
                MaterialName = item.MaterialName,
                QuantityPerUnit = item.Quantity,
                TotalQuantity = total,
                Unit = item.Unit,
                LossRate = item.LossRate,
                LeadTimeDays = item.LeadTimeDays,
                ConsumptionTiming = item.ConsumptionTiming,
                Level = level
            };

            if (item.Children.Count > 0)
                dto.Children = ExplodeItems(item.Children, total, level + 1);

            result.Add(dto);
        }
        return result;
    }

    private BomSummaryDto MapToSummary(BillOfMaterial bom) => new()
    {
        Id = bom.Id,
        BomCode = bom.BomCode,
        BomName = bom.BomName,
        ProductCode = bom.ProductCode.Value,
        ProductName = bom.ProductName,
        BomType = bom.BomType.ToString(),
        Version = bom.Version,
        Status = bom.BomVersionStatus.ToString(),
        EffectiveDate = bom.EffectiveDate,
        ExpireDate = bom.ExpireDate,
        ItemCount = bom.Items.Count,
        CreatedAt = bom.CreatedAt
    };

    private BomDetailDto MapToDetail(BillOfMaterial bom) => new()
    {
        Id = bom.Id,
        BomCode = bom.BomCode,
        BomName = bom.BomName,
        ProductCode = bom.ProductCode.Value,
        ProductName = bom.ProductName,
        BomType = bom.BomType.ToString(),
        Version = bom.Version,
        Status = bom.BomVersionStatus.ToString(),
        EffectiveDate = bom.EffectiveDate,
        ExpireDate = bom.ExpireDate,
        Items = bom.Items.Select(MapToItemDto).ToList(),
        ChangeHistory = bom.ChangeHistory.Select(c => new BomChangeRecordDto
        {
            ChangeDescription = c.ChangeDescription,
            ChangedBy = c.ChangedBy,
            ChangedAt = c.ChangedAt
        }).ToList(),
        CreatedAt = bom.CreatedAt,
        UpdatedAt = bom.UpdatedAt
    };

    private BomItemDto MapToItemDto(BomItem item) => new()
    {
        Id = item.Id,
        MaterialCode = item.MaterialCode.Value,
        MaterialName = item.MaterialName,
        Quantity = item.Quantity,
        Unit = item.Unit,
        LossRate = item.LossRate,
        LeadTimeDays = item.LeadTimeDays,
        ConsumptionTiming = item.ConsumptionTiming,
        Sequence = item.Sequence,
        Children = item.Children.Select(MapToItemDto).ToList()
    };
}
