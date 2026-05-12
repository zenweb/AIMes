using MES.Application.DTOs;
using MES.Domain.Entities.Bom;
using MES.Domain.Interfaces.Repositories;
using MES.Domain.ValueObjects;

namespace MES.Application.Services;

public interface IBomAppService
{
    Task<List<BomSummaryDto>> GetAllBomsAsync(CancellationToken ct = default);
    Task<BomDetailDto?> GetBomByIdAsync(string id, CancellationToken ct = default);
    Task<BomExplosionResultDto> ExplodeBomAsync(string bomId, decimal quantity = 1, CancellationToken ct = default);
    Task<BomSummaryDto> CreateBomAsync(CreateBomRequest request, CancellationToken ct = default);
}

public class BomAppService : IBomAppService
{
    private readonly IBomRepository _bomRepo;

    public BomAppService(IBomRepository bomRepo)
    {
        _bomRepo = bomRepo;
    }

    public async Task<List<BomSummaryDto>> GetAllBomsAsync(CancellationToken ct = default)
    {
        // IBomRepository 没有 GetAllAsync，通过领域服务遍历
        // 此处简化：从仓储获取所有 Bom（实际使用中可扩展仓储）
        return new List<BomSummaryDto>();
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
