namespace MES.Domain.Entities.Purchase;

public enum PurchaseOrderStatus
{
    Draft,
    Submitted,
    Confirmed,
    PartiallyReceived,
    Completed,
    Cancelled,
}
