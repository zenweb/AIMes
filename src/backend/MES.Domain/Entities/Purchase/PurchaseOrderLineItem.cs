namespace MES.Domain.Entities.Purchase;

public class PurchaseOrderLineItem
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string MaterialCode { get; set; } = string.Empty;
    public string MaterialName { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal ReceivedQuantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice => Quantity * UnitPrice;
    public DateTime? ExpectedDate { get; set; }
    public string? Remark { get; set; }
}
