namespace MES.Domain.Entities.Production;

public class Material
{
    internal Material() { }

    public string Id { get; internal set; } = Guid.NewGuid().ToString();
    public string MaterialCode { get; internal set; } = string.Empty;
    public string MaterialName { get; internal set; } = string.Empty;
    public string MaterialType { get; internal set; } = string.Empty;
    public string Unit { get; internal set; } = string.Empty;
    public int AvailableQuantity { get; internal set; }
    public int ReservedQuantity { get; internal set; }
    public int SafetyStock { get; internal set; }
    public string StorageLocation { get; internal set; } = string.Empty;
    public DateTime? ExpiryDate { get; internal set; }
    public DateTime CreatedAt { get; internal set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; internal set; }

    public static Material Create(string code, string name, string unit,
        int safetyStock = 0, string? storageLocation = null,
        string? materialType = null, int availableQuantity = 0, string? id = null, DateTime? createdAt = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(code);
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        ArgumentOutOfRangeException.ThrowIfNegative(safetyStock);
        ArgumentOutOfRangeException.ThrowIfNegative(availableQuantity);

        return new Material
        {
            Id = id ?? Guid.NewGuid().ToString(),
            MaterialCode = code,
            MaterialName = name,
            MaterialType = materialType ?? string.Empty,
            Unit = unit,
            SafetyStock = safetyStock,
            StorageLocation = storageLocation ?? string.Empty,
            AvailableQuantity = availableQuantity,
            ReservedQuantity = 0,
            CreatedAt = createdAt ?? DateTime.UtcNow,
        };
    }

    public int NetAvailable => AvailableQuantity - ReservedQuantity;
    public bool IsLowStock => NetAvailable < SafetyStock;

    public void Reserve(int quantity)
    {
        if (quantity <= 0)
            throw new ArgumentOutOfRangeException(nameof(quantity), "预留数量必须为正数");
        if (quantity > NetAvailable)
            throw new InvalidOperationException($"可用库存不足：需要 {quantity}，可用 {NetAvailable}");

        ReservedQuantity += quantity;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Release(int quantity)
    {
        if (quantity <= 0)
            throw new ArgumentOutOfRangeException(nameof(quantity), "释放数量必须为正数");
        if (quantity > ReservedQuantity)
            throw new InvalidOperationException($"预留不足：需要释放 {quantity}，已预留 {ReservedQuantity}");

        ReservedQuantity -= quantity;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Consume(int quantity)
    {
        if (quantity <= 0)
            throw new ArgumentOutOfRangeException(nameof(quantity), "消耗数量必须为正数");
        if (quantity > AvailableQuantity)
            throw new InvalidOperationException($"库存不足：需要消耗 {quantity}，可用 {AvailableQuantity}");

        AvailableQuantity -= quantity;
        ReservedQuantity = Math.Max(0, ReservedQuantity - quantity);
        UpdatedAt = DateTime.UtcNow;
    }

    public void StockIn(int quantity)
    {
        if (quantity <= 0)
            throw new ArgumentOutOfRangeException(nameof(quantity), "入库数量必须为正数");

        AvailableQuantity += quantity;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetSafetyStock(int level)
    {
        ArgumentOutOfRangeException.ThrowIfNegative(level);
        SafetyStock = level;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateLocation(string location)
    {
        StorageLocation = location ?? string.Empty;
        UpdatedAt = DateTime.UtcNow;
    }
}
