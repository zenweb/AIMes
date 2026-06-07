using System.Text.Json;
using MES.Application.DTOs;
using MES.Domain.Entities.Purchase;
using MES.Domain.Enums;
using MES.Domain.Interfaces.Repositories;
using MES.Domain.Interfaces.Services;

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
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAuditLogAppService _auditLog;

    public PurchaseAppService(IPurchaseOrderRepository orderRepo, IUnitOfWork unitOfWork, IAuditLogAppService auditLog)
    {
        _orderRepo = orderRepo;
        _unitOfWork = unitOfWork;
        _auditLog = auditLog;
    }

    public async Task<PagedResult<PurchaseOrderSummaryDto>> GetAllAsync(int page = 1, int pageSize = 20, CancellationToken ct = default)
    {
        var total = await _orderRepo.CountAsync(ct);
        var orders = await _orderRepo.GetPagedAsync(page, pageSize, ct);
        var items = orders
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

    public Task<PurchaseOrderDetailDto> CreateAsync(CreatePurchaseOrderRequest request, CancellationToken ct = default)
    {
        return _unitOfWork.ExecuteAsync(async innerCt =>
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

            await _orderRepo.AddAsync(order, innerCt);
            return MapToDetail(order);
        }, ct);
    }

    public Task<PurchaseOrderDetailDto> SubmitAsync(string id, CancellationToken ct = default)
    {
        return _unitOfWork.ExecuteAsync(async innerCt =>
        {
            var order = await _orderRepo.GetByIdAsync(id, innerCt)
                ?? throw new InvalidOperationException($"采购单 {id} 不存在");
            order.Submit();
            await _orderRepo.UpdateAsync(order, innerCt);
            await WriteStatusAuditAsync("PurchaseSubmit", order, innerCt);
            return MapToDetail(order);
        }, ct);
    }

    public Task<PurchaseOrderDetailDto> ConfirmAsync(string id, CancellationToken ct = default)
    {
        return _unitOfWork.ExecuteAsync(async innerCt =>
        {
            var order = await _orderRepo.GetByIdAsync(id, innerCt)
                ?? throw new InvalidOperationException($"采购单 {id} 不存在");
            order.Confirm();
            await _orderRepo.UpdateAsync(order, innerCt);
            await WriteStatusAuditAsync("PurchaseConfirm", order, innerCt);
            return MapToDetail(order);
        }, ct);
    }

    public Task<PurchaseOrderDetailDto> ReceiveAsync(string id, ReceiveRequest request, CancellationToken ct = default)
    {
        return _unitOfWork.ExecuteAsync(async innerCt =>
        {
            var order = await _orderRepo.GetByIdAsync(id, innerCt)
                ?? throw new InvalidOperationException($"采购单 {id} 不存在");
            order.Receive(request.MaterialCode, request.Quantity);
            await _orderRepo.UpdateAsync(order, innerCt);
            return MapToDetail(order);
        }, ct);
    }

    public Task CancelAsync(string id, CancellationToken ct = default)
    {
        return _unitOfWork.ExecuteAsync(async innerCt =>
        {
            var order = await _orderRepo.GetByIdAsync(id, innerCt);
            if (order != null)
            {
                order.Cancel();
                await _orderRepo.UpdateAsync(order, innerCt);
                await WriteStatusAuditAsync("PurchaseCancel", order, innerCt);
            }
        }, ct);
    }

    private Task WriteStatusAuditAsync(string action, PurchaseOrder order, CancellationToken ct)
    {
        return _auditLog.WriteAuditLogAsync(
            userId: order.CreatedBy,
            action,
            resource: "PurchaseOrder",
            resourceId: order.Id,
            oldValues: null,
            newValues: JsonSerializer.Serialize(new
            {
                order.OrderNumber,
                Status = order.Status.ToString(),
                order.UpdatedAt
            }),
            ipAddress: null,
            userAgent: null,
            AuditInitiatedBy.User,
            ct);
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
