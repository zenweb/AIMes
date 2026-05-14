using MES.Domain.Primitives;

namespace MES.Domain.Entities.Purchase;

public class PurchaseOrder : AggregateRoot
{
    public string OrderNumber { get; private set; } = string.Empty;
    public string SupplierName { get; private set; } = string.Empty;
    public string? SupplierContact { get; private set; }
    public PurchaseOrderStatus Status { get; private set; } = PurchaseOrderStatus.Draft;
    public DateTime OrderDate { get; private set; } = DateTime.UtcNow;
    public DateTime? ExpectedDeliveryDate { get; private set; }
    public DateTime? CompletedDate { get; private set; }
    public decimal TotalAmount => Items.Sum(i => i.TotalPrice);
    public string? Remark { get; private set; }
    public string CreatedBy { get; private set; } = string.Empty;
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; private set; }
    public List<PurchaseOrderLineItem> Items { get; private set; } = new();

    private PurchaseOrder() { }

    public PurchaseOrder(string orderNumber, string supplierName, string? supplierContact, DateTime? expectedDeliveryDate, string? remark, string createdBy)
    {
        OrderNumber = orderNumber;
        SupplierName = supplierName;
        SupplierContact = supplierContact;
        ExpectedDeliveryDate = expectedDeliveryDate;
        Remark = remark;
        CreatedBy = createdBy;
    }

    public void AddItem(PurchaseOrderLineItem item)
    {
        Items.Add(item);
        UpdatedAt = DateTime.UtcNow;
    }

    public void Submit()
    {
        if (Status != PurchaseOrderStatus.Draft) return;
        Status = PurchaseOrderStatus.Submitted;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Confirm()
    {
        if (Status != PurchaseOrderStatus.Submitted) return;
        Status = PurchaseOrderStatus.Confirmed;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Receive(string materialCode, decimal quantity)
    {
        var item = Items.FirstOrDefault(i => i.MaterialCode == materialCode);
        if (item == null) return;
        item.ReceivedQuantity += quantity;
        UpdatedAt = DateTime.UtcNow;

        if (Items.All(i => i.ReceivedQuantity >= i.Quantity))
        {
            Status = PurchaseOrderStatus.Completed;
            CompletedDate = DateTime.UtcNow;
        }
        else
        {
            Status = PurchaseOrderStatus.PartiallyReceived;
        }
    }

    public void Cancel()
    {
        Status = PurchaseOrderStatus.Cancelled;
        CompletedDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }
}
