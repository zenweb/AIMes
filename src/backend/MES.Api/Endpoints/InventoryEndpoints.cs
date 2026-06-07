using MES.Api.Filters;
using MES.Api.Hubs;
using MES.Application.DTOs;
using MES.Application.Services;

namespace MES.Api.Endpoints;

public static class InventoryEndpoints
{
    private static readonly AuditEndpointFilter Audit = new("inventory");

    public static RouteGroupBuilder MapInventoryEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/dashboard", GetDashboardAsync).WithTags("库存管理");
        group.MapGet("/transactions", GetTransactionsAsync).WithTags("库存管理");
        group.MapGet("/{materialCode}", GetByCodeAsync).WithTags("库存管理");
        group.MapGet("/", GetAllAsync).WithTags("库存管理");
        group.MapPost("/stock-in", StockInAsync).WithTags("库存管理").AddEndpointFilter<ValidationEndpointFilter>().AddEndpointFilter(Audit);
        group.MapPost("/stock-out", StockOutAsync).WithTags("库存管理").AddEndpointFilter<ValidationEndpointFilter>().AddEndpointFilter(Audit);
        group.MapPost("/transfer", TransferAsync).WithTags("库存管理").AddEndpointFilter<ValidationEndpointFilter>().AddEndpointFilter(Audit);
        group.MapPost("/adjust", AdjustAsync).WithTags("库存管理").AddEndpointFilter<ValidationEndpointFilter>().AddEndpointFilter(Audit);
        return group;
    }

    private static async Task<IResult> GetDashboardAsync(IInventoryAppService inventoryService, CancellationToken ct)
    {
        var result = await inventoryService.GetDashboardAsync(ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> GetAllAsync(IInventoryAppService inventoryService, CancellationToken ct)
    {
        var items = await inventoryService.GetAllItemsAsync(ct);
        return TypedResults.Ok(items);
    }

    private static async Task<IResult> GetByCodeAsync(string materialCode, IInventoryAppService inventoryService, CancellationToken ct)
    {
        var item = await inventoryService.GetItemByCodeAsync(materialCode, ct);
        if (item is null)
            return TypedResults.NotFound(new { message = $"物料 {materialCode} 不存在" });
        return TypedResults.Ok(item);
    }

    private static async Task<IResult> GetTransactionsAsync(
        string? materialCode,
        IInventoryAppService inventoryService,
        CancellationToken ct,
        int page = 1,
        int pageSize = 20)
    {
        var result = await inventoryService.GetTransactionsAsync(materialCode, page, pageSize, ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> StockInAsync(
        StockInRequest request,
        IInventoryAppService inventoryService,
        INotificationService notificationService,
        CancellationToken ct)
    {
        var result = await inventoryService.StockInAsync(request, ct);
        await notificationService.NotifyInventoryChanged(request.MaterialCode, result.MaterialName, "StockIn", request.Quantity);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> StockOutAsync(
        StockOutRequest request,
        IInventoryAppService inventoryService,
        INotificationService notificationService,
        CancellationToken ct)
    {
        var result = await inventoryService.StockOutAsync(request, ct);
        await notificationService.NotifyInventoryChanged(request.MaterialCode, result.MaterialName, "StockOut", request.Quantity);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> TransferAsync(
        TransferRequest request,
        IInventoryAppService inventoryService,
        INotificationService notificationService,
        CancellationToken ct)
    {
        var result = await inventoryService.TransferAsync(request, ct);
        await notificationService.NotifyInventoryChanged(request.MaterialCode, result.MaterialName, "Transfer", request.Quantity);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> AdjustAsync(
        AdjustmentRequest request,
        IInventoryAppService inventoryService,
        INotificationService notificationService,
        CancellationToken ct)
    {
        var result = await inventoryService.AdjustAsync(request, ct);
        await notificationService.NotifyInventoryChanged(request.MaterialCode, result.MaterialName, "Adjustment", request.NewQuantity);
        return TypedResults.Ok(result);
    }
}
