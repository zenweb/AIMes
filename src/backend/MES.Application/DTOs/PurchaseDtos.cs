using System.ComponentModel.DataAnnotations;

namespace MES.Application.DTOs;

public class PurchaseOrderSummaryDto
{
    public string Id { get; set; } = string.Empty;
    public string OrderNumber { get; set; } = string.Empty;
    public string SupplierName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }
    public DateTime? ExpectedDeliveryDate { get; set; }
    public decimal TotalAmount { get; set; }
    public int ItemCount { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class PurchaseOrderDetailDto
{
    public string Id { get; set; } = string.Empty;
    public string OrderNumber { get; set; } = string.Empty;
    public string SupplierName { get; set; } = string.Empty;
    public string? SupplierContact { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }
    public DateTime? ExpectedDeliveryDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public decimal TotalAmount { get; set; }
    public string? Remark { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<PurchaseOrderLineItemDto> Items { get; set; } = new();
}

public class PurchaseOrderLineItemDto
{
    public string Id { get; set; } = string.Empty;
    public string MaterialCode { get; set; } = string.Empty;
    public string MaterialName { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal ReceivedQuantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public DateTime? ExpectedDate { get; set; }
    public string? Remark { get; set; }
}

public class CreatePurchaseOrderRequest
{
    [Required] public string OrderNumber { get; set; } = string.Empty;
    [Required] public string SupplierName { get; set; } = string.Empty;
    public string? SupplierContact { get; set; }
    public DateTime? ExpectedDeliveryDate { get; set; }
    public string? Remark { get; set; }
    [Required] public string CreatedBy { get; set; } = string.Empty;
    public List<CreatePurchaseLineRequest> Items { get; set; } = new();
}

public class CreatePurchaseLineRequest
{
    [Required] public string MaterialCode { get; set; } = string.Empty;
    [Required] public string MaterialName { get; set; } = string.Empty;
    [Required] public string Unit { get; set; } = string.Empty;
    [Required][Range(1, int.MaxValue)] public decimal Quantity { get; set; }
    [Required][Range(0, double.MaxValue)] public decimal UnitPrice { get; set; }
    public DateTime? ExpectedDate { get; set; }
    public string? Remark { get; set; }
}

public class ReceiveRequest
{
    [Required] public string MaterialCode { get; set; } = string.Empty;
    [Required][Range(1, int.MaxValue)] public decimal Quantity { get; set; }
}
