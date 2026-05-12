using System.ComponentModel.DataAnnotations;

namespace MES.Application.DTOs;

public class BomSummaryDto
{
    public string Id { get; set; } = string.Empty;
    public string BomCode { get; set; } = string.Empty;
    public string BomName { get; set; } = string.Empty;
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string BomType { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime? EffectiveDate { get; set; }
    public DateTime? ExpireDate { get; set; }
    public int ItemCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class BomDetailDto
{
    public string Id { get; set; } = string.Empty;
    public string BomCode { get; set; } = string.Empty;
    public string BomName { get; set; } = string.Empty;
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string BomType { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime? EffectiveDate { get; set; }
    public DateTime? ExpireDate { get; set; }
    public List<BomItemDto> Items { get; set; } = new();
    public List<BomChangeRecordDto> ChangeHistory { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class BomItemDto
{
    public string Id { get; set; } = string.Empty;
    public string MaterialCode { get; set; } = string.Empty;
    public string MaterialName { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public string Unit { get; set; } = string.Empty;
    public decimal? LossRate { get; set; }
    public int? LeadTimeDays { get; set; }
    public string ConsumptionTiming { get; set; } = string.Empty;
    public int Sequence { get; set; }
    public List<BomItemDto> Children { get; set; } = new();
}

public class BomChangeRecordDto
{
    public string ChangeDescription { get; set; } = string.Empty;
    public string ChangedBy { get; set; } = string.Empty;
    public DateTime ChangedAt { get; set; }
}

public class BomExplosionResultDto
{
    public string BomId { get; set; } = string.Empty;
    public string BomName { get; set; } = string.Empty;
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public List<BomExplosionItemDto> Items { get; set; } = new();
}

public class BomExplosionItemDto
{
    public string MaterialCode { get; set; } = string.Empty;
    public string MaterialName { get; set; } = string.Empty;
    public decimal QuantityPerUnit { get; set; }
    public decimal TotalQuantity { get; set; }
    public string Unit { get; set; } = string.Empty;
    public decimal? LossRate { get; set; }
    public int? LeadTimeDays { get; set; }
    public string ConsumptionTiming { get; set; } = string.Empty;
    public int Level { get; set; }
    public List<BomExplosionItemDto> Children { get; set; } = new();
}

public class CreateBomRequest
{
    [Required] public string BomCode { get; set; } = string.Empty;
    [Required] public string BomName { get; set; } = string.Empty;
    [Required] public string ProductCode { get; set; } = string.Empty;
    [Required] public string ProductName { get; set; } = string.Empty;
    public string BomType { get; set; } = "Manufacturing";
    public DateTime? EffectiveDate { get; set; }
    public DateTime? ExpireDate { get; set; }
    public List<CreateBomItemRequest> Items { get; set; } = new();
}

public class CreateBomItemRequest
{
    [Required] public string MaterialCode { get; set; } = string.Empty;
    [Required] public string MaterialName { get; set; } = string.Empty;
    [Required] public decimal Quantity { get; set; }
    [Required] public string Unit { get; set; } = string.Empty;
    public decimal? LossRate { get; set; }
    public int? LeadTimeDays { get; set; }
    public string ConsumptionTiming { get; set; } = string.Empty;
    public int Sequence { get; set; }
}
