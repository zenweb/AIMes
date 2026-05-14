using MES.Application.DTOs;
using MES.Domain.Entities.Purchase;
using MES.Domain.Interfaces.Repositories;

namespace MES.Application.Services;

public interface IPurchaseAppService
{
    Task<PagedResult<PurchaseOrderSummaryDto>> GetAllAsync(int page = 1, int pageSize = 20, CancellationToken ct = default);
    Task<PurchaseOrderDetailDto?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<PurchaseOrderDetailDto> CreateAsync(CreatePurchaseOrderRequest request, CancellationToken ct = default);
    Task<PurchaseOrderDetailDto> SubmitAsync(string id, CancellationToken ct = default);
    Task<PurchaseOrderDetailDto> ConfirmAsync(string id, CancellationToken ct = default);
    Task<PurchaseOrderDetailDto> ReceiveAsync(string id, ReceiveRequest request, CancellationToken ct = default);
    Task CancelAsync(string id, CancellationToken ct = default);
}

public class PurchaseAppService : IPurchaseAppService
{
    private readonly IPurchaseOrderRepository _orderRepo;

    public PurchaseAppService(IPurchaseOrderRepository orderRepo)
    {
        _orderRepo = orderRepo;
    }

    public async Task<PagedResult<PurchaseOrderSummaryDto>> GetAllAsync(int page = 1, int pageSize = 20, CancellationToken ct = default)
    {
        var all = await _orderRepo.GetAllAsync(ct);
        var total = all.Count;
        var items = all
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(MapToSummary)
            .ToList();
        return new PagedResult<PurchaseOrderSummaryDto>
        {
            Items = items,
            TotalCount = total,
            Page = page,
            PageSize = pageSize,
        };
    }

    public async Task<PurchaseOrderDetailDto?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        var order = await _orderRepo.GetByIdAsync(id, ct);
        return order != null ? MapToDetail(order) : null;
    }

    public async Task<PurchaseOrderDetailDto> CreateAsync(CreatePurchaseOrderRequest request, CancellationToken ct = default)
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

        await _orderRepo.AddAsync(order, ct);
        return MapToDetail(order);
    }

    public async Task<PurchaseOrderDetailDto> SubmitAsync(string id, CancellationToken ct = default)
    {
        var order = await _orderRepo.GetByIdAsync(id, ct)
            ?? throw new InvalidOperationException($"采购单 {id} 不存在");
        order.Submit();
        await _orderRepo.UpdateAsync(order, ct);
        return MapToDetail(order);
    }

    public async Task<PurchaseOrderDetailDto> ConfirmAsync(string id, CancellationToken ct = default)
    {
        var order = await _orderRepo.GetByIdAsync(id, ct)
            ?? throw new InvalidOperationException($"采购单 {id} 不存在");
        order.Confirm();
        await _orderRepo.UpdateAsync(order, ct);
        return MapToDetail(order);
    }

    public async Task<PurchaseOrderDetailDto> ReceiveAsync(string id, ReceiveRequest request, CancellationToken ct = default)
    {
        var order = await _orderRepo.GetByIdAsync(id, ct)
            ?? throw new InvalidOperationException($"采购单 {id} 不存在");
        order.Receive(request.MaterialCode, request.Quantity);
        await _orderRepo.UpdateAsync(order, ct);
        return MapToDetail(order);
    }

    public async Task CancelAsync(string id, CancellationToken ct = default)
    {
        var order = await _orderRepo.GetByIdAsync(id, ct);
        if (order != null)
        {
            order.Cancel();
            await _orderRepo.UpdateAsync(order, ct);
        }
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
