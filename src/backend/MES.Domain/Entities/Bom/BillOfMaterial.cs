using MES.Domain.Primitives;
using MES.Domain.ValueObjects;

namespace MES.Domain.Entities.Bom;

public class BillOfMaterial : AggregateRoot
{
    public string BomCode { get; private set; } = string.Empty;
    public string BomName { get; private set; } = string.Empty;
    public ProductCode ProductCode { get; private set; } = new(string.Empty);
    public string ProductName { get; private set; } = string.Empty;
    public BomType BomType { get; private set; } = BomType.Manufacturing;
    public new string Version { get; private set; } = string.Empty;
    public BomVersionStatus BomVersionStatus { get; private set; } = BomVersionStatus.Draft;
    public DateTime? EffectiveDate { get; private set; }
    public DateTime? ExpireDate { get; private set; }
    public List<BomItem> Items { get; private set; } = new();
    public List<BomChangeRecord> ChangeHistory { get; private set; } = new();
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; private set; }

    private BillOfMaterial() { }

    public BillOfMaterial(string bomCode, string bomName, ProductCode productCode, string productName, BomType bomType, string version)
    {
        BomCode = bomCode;
        BomName = bomName;
        ProductCode = productCode;
        ProductName = productName;
        BomType = bomType;
        Version = version;
    }

    public void AddItem(BomItem item)
    {
        Items.Add(item);
        UpdatedAt = DateTime.UtcNow;
    }

    public void Release(DateTime effectiveDate, string approvedBy)
    {
        BomVersionStatus = BomVersionStatus.Released;
        EffectiveDate = effectiveDate;
        UpdatedAt = DateTime.UtcNow;
        ChangeHistory.Add(new BomChangeRecord($"Released version {Version}", approvedBy));
    }
}
