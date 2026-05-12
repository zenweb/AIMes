namespace MES.Domain.Entities.Production;

/// <summary>
/// 物料
/// </summary>
public class Material
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string MaterialCode { get; set; } = string.Empty;
    public string MaterialName { get; set; } = string.Empty;
    public string MaterialType { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public int AvailableQuantity { get; set; }
    public int ReservedQuantity { get; set; }
    public int SafetyStock { get; set; }
    public string StorageLocation { get; set; } = string.Empty;
    public DateTime? ExpiryDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}