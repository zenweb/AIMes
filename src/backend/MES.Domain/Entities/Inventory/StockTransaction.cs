namespace MES.Domain.Entities.Inventory;

public class StockTransaction
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string MaterialCode { get; set; } = string.Empty;
    public string MaterialName { get; set; } = string.Empty;
    public TransactionType TransactionType { get; set; }
    public decimal Quantity { get; set; }
    public decimal BalanceBefore { get; set; }
    public decimal BalanceAfter { get; set; }
    public string? ReferenceType { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? Warehouse { get; set; }
    public string? Location { get; set; }
    public string? Operator { get; set; }
    public string? Remark { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
