using MES.Application.DTOs;
using MES.Domain.Entities.Purchase;

namespace MES.Application.Services;

public interface IPurchaseAppService
{
    Task<List<PurchaseOrderSummaryDto>> GetAllAsync(CancellationToken ct = default);
    Task<PurchaseOrderDetailDto?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<PurchaseOrderDetailDto> CreateAsync(CreatePurchaseOrderRequest request, CancellationToken ct = default);
    Task<PurchaseOrderDetailDto> SubmitAsync(string id, CancellationToken ct = default);
    Task<PurchaseOrderDetailDto> ConfirmAsync(string id, CancellationToken ct = default);
    Task<PurchaseOrderDetailDto> ReceiveAsync(string id, ReceiveRequest request, CancellationToken ct = default);
    Task CancelAsync(string id, CancellationToken ct = default);
}

public class PurchaseAppService : IPurchaseAppService
{
    private static readonly List<PurchaseOrder> _orders = new();
    private static readonly object _lock = new();

    public Task<List<PurchaseOrderSummaryDto>> GetAllAsync(CancellationToken ct = default)
    {
        lock (_lock)
        {
            var result = _orders.OrderByDescending(o => o.CreatedAt)
                .Select(MapToSummary)
                .ToList();
            return Task.FromResult(result);
        }
    }

    public Task<PurchaseOrderDetailDto?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        lock (_lock)
        {
            var order = _orders.FirstOrDefault(o => o.Id == id);
            return Task.FromResult(order != null ? MapToDetail(order) : null);
        }
    }

    public Task<PurchaseOrderDetailDto> CreateAsync(CreatePurchaseOrderRequest request, CancellationToken ct = default)
    {
        lock (_lock)
        {
            var order = new PurchaseOrder(
                request.OrderNumber,
                request.SupplierName,
                request.SupplierContact,
                request.ExpectedDeliveryDate,
                request.Remark,
                request.CreatedBy);

            foreach (var itemReq in request.Items)
            {
                order.AddItem(new PurchaseOrderLineItem
                {
                    MaterialCode = itemReq.MaterialCode,
                    MaterialName = itemReq.MaterialName,
                    Unit = itemReq.Unit,
                    Quantity = itemReq.Quantity,
                    UnitPrice = itemReq.UnitPrice,
                    ExpectedDate = itemReq.ExpectedDate,
                    Remark = itemReq.Remark,
                });
            }

            _orders.Add(order);
            return Task.FromResult(MapToDetail(order));
        }
    }

    public Task<PurchaseOrderDetailDto> SubmitAsync(string id, CancellationToken ct = default)
    {
        lock (_lock)
        {
            var order = _orders.FirstOrDefault(o => o.Id == id)
                ?? throw new InvalidOperationException($"采购单 {id} 不存在");
            order.Submit();
            return Task.FromResult(MapToDetail(order));
        }
    }

    public Task<PurchaseOrderDetailDto> ConfirmAsync(string id, CancellationToken ct = default)
    {
        lock (_lock)
        {
            var order = _orders.FirstOrDefault(o => o.Id == id)
                ?? throw new InvalidOperationException($"采购单 {id} 不存在");
            order.Confirm();
            return Task.FromResult(MapToDetail(order));
        }
    }

    public Task<PurchaseOrderDetailDto> ReceiveAsync(string id, ReceiveRequest request, CancellationToken ct = default)
    {
        lock (_lock)
        {
            var order = _orders.FirstOrDefault(o => o.Id == id)
                ?? throw new InvalidOperationException($"采购单 {id} 不存在");
            order.Receive(request.MaterialCode, request.Quantity);
            return Task.FromResult(MapToDetail(order));
        }
    }

    public Task CancelAsync(string id, CancellationToken ct = default)
    {
        lock (_lock)
        {
            var order = _orders.FirstOrDefault(o => o.Id == id);
            if (order != null) order.Cancel();
        }
        return Task.CompletedTask;
    }

    private static PurchaseOrderSummaryDto MapToSummary(PurchaseOrder o) => new()
    {
        Id = o.Id,
        OrderNumber = o.OrderNumber,
        SupplierName = o.SupplierName,
        Status = o.Status.ToString(),
        OrderDate = o.OrderDate,
        ExpectedDeliveryDate = o.ExpectedDeliveryDate,
        TotalAmount = o.TotalAmount,
        ItemCount = o.Items.Count,
        CreatedBy = o.CreatedBy,
        CreatedAt = o.CreatedAt,
    };

    private static PurchaseOrderDetailDto MapToDetail(PurchaseOrder o) => new()
    {
        Id = o.Id,
        OrderNumber = o.OrderNumber,
        SupplierName = o.SupplierName,
        SupplierContact = o.SupplierContact,
        Status = o.Status.ToString(),
        OrderDate = o.OrderDate,
        ExpectedDeliveryDate = o.ExpectedDeliveryDate,
        CompletedDate = o.CompletedDate,
        TotalAmount = o.TotalAmount,
        Remark = o.Remark,
        CreatedBy = o.CreatedBy,
        CreatedAt = o.CreatedAt,
        UpdatedAt = o.UpdatedAt,
        Items = o.Items.Select(i => new PurchaseOrderLineItemDto
        {
            Id = i.Id,
            MaterialCode = i.MaterialCode,
            MaterialName = i.MaterialName,
            Unit = i.Unit,
            Quantity = i.Quantity,
            ReceivedQuantity = i.ReceivedQuantity,
            UnitPrice = i.UnitPrice,
            TotalPrice = i.TotalPrice,
            ExpectedDate = i.ExpectedDate,
            Remark = i.Remark,
        }).ToList(),
    };
}
