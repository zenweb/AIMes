using System.ComponentModel.DataAnnotations;

namespace MES.Application.DTOs;

public class InventoryItemDto
{
    public string Id { get; set; } = string.Empty;
    public string MaterialCode { get; set; } = string.Empty;
    public string MaterialName { get; set; } = string.Empty;
    public string MaterialType { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public int AvailableQuantity { get; set; }
    public int ReservedQuantity { get; set; }
    public int RealQuantity => AvailableQuantity - ReservedQuantity;
    public int SafetyStock { get; set; }
    public string StorageLocation { get; set; } = string.Empty;
    public DateTime? ExpiryDate { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class StockTransactionDto
{
    public string Id { get; set; } = string.Empty;
    public string MaterialCode { get; set; } = string.Empty;
    public string MaterialName { get; set; } = string.Empty;
    public string TransactionType { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal BalanceBefore { get; set; }
    public decimal BalanceAfter { get; set; }
    public string? ReferenceType { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? Warehouse { get; set; }
    public string? Operator { get; set; }
    public string? Remark { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class InventoryDashboardDto
{
    public int TotalMaterials { get; set; }
    public int LowStockCount { get; set; }
    public int OutOfStockCount { get; set; }
    public int TodayTransactions { get; set; }
}

public class StockInRequest
{
    [Required] public string MaterialCode { get; set; } = string.Empty;
    [Required][Range(1, int.MaxValue)] public int Quantity { get; set; }
    public string? Warehouse { get; set; }
    public string? Location { get; set; }
    public string? ReferenceType { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? Operator { get; set; }
    public string? Remark { get; set; }
}

public class StockOutRequest
{
    [Required] public string MaterialCode { get; set; } = string.Empty;
    [Required][Range(1, int.MaxValue)] public int Quantity { get; set; }
    public string? ReferenceType { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? Operator { get; set; }
    public string? Remark { get; set; }
}

public class TransferRequest
{
    [Required] public string MaterialCode { get; set; } = string.Empty;
    [Required][Range(1, int.MaxValue)] public int Quantity { get; set; }
    [Required] public string FromWarehouse { get; set; } = string.Empty;
    [Required] public string ToWarehouse { get; set; } = string.Empty;
    public string? Operator { get; set; }
    public string? Remark { get; set; }
}

public class AdjustmentRequest
{
    [Required] public string MaterialCode { get; set; } = string.Empty;
    [Required] public int NewQuantity { get; set; }
    public string? Operator { get; set; }
    public string? Remark { get; set; }
}
