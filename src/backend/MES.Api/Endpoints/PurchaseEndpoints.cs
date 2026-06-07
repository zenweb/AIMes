using MES.Api.Filters;
using MES.Api.Hubs;
using MES.Application.DTOs;
using MES.Application.Services;

namespace MES.Api.Endpoints;

public static class PurchaseEndpoints
{
    private static readonly AuditEndpointFilter Audit = new("purchase");

    public static RouteGroupBuilder MapPurchaseEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/{id}", GetByIdAsync).WithTags("采购管理");
        group.MapGet("/", GetAllAsync).WithTags("采购管理");
        group.MapPost("/", CreateAsync).WithTags("采购管理").AddEndpointFilter<ValidationEndpointFilter>().AddEndpointFilter(Audit);
        group.MapPost("/{id}/submit", SubmitAsync).WithTags("采购管理").AddEndpointFilter<ValidationEndpointFilter>().AddEndpointFilter(Audit);
        group.MapPost("/{id}/confirm", ConfirmAsync).WithTags("采购管理").AddEndpointFilter<ValidationEndpointFilter>().AddEndpointFilter(Audit);
        group.MapPost("/{id}/receive", ReceiveAsync).WithTags("采购管理").AddEndpointFilter<ValidationEndpointFilter>().AddEndpointFilter(Audit);
        group.MapPost("/{id}/cancel", CancelAsync).WithTags("采购管理").AddEndpointFilter<ValidationEndpointFilter>().AddEndpointFilter(Audit);
        return group;
    }

    private static async Task<IResult> GetAllAsync([AsParameters] PageQueryParameters parameters, IPurchaseAppService purchaseService, CancellationToken ct)
    {
        var result = await purchaseService.GetAllAsync(parameters.Page, parameters.PageSize, ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> GetByIdAsync(string id, IPurchaseAppService purchaseService, CancellationToken ct)
    {
        var order = await purchaseService.GetByIdAsync(id, ct);
        if (order is null)
            return TypedResults.NotFound(new { message = $"采购单 {id} 不存在" });
        return TypedResults.Ok(order);
    }

    private static async Task<IResult> CreateAsync(
        CreatePurchaseOrderRequest request,
        IPurchaseAppService purchaseService,
        CancellationToken ct)
    {
        var order = await purchaseService.CreateAsync(request, ct);
        return TypedResults.Created($"/api/v1/purchase/{order.Id}", order);
    }

    private static async Task<IResult> SubmitAsync(
        string id,
        IPurchaseAppService purchaseService,
        INotificationService notificationService,
        CancellationToken ct)
    {
        var result = await purchaseService.SubmitAsync(id, ct);
        await notificationService.NotifyPurchaseOrderStatusChanged(id, result.OrderNumber, "Submitted");
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> ConfirmAsync(
        string id,
        IPurchaseAppService purchaseService,
        INotificationService notificationService,
        CancellationToken ct)
    {
        var result = await purchaseService.ConfirmAsync(id, ct);
        await notificationService.NotifyPurchaseOrderStatusChanged(id, result.OrderNumber, "Confirmed");
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> ReceiveAsync(
        string id,
        ReceiveRequest request,
        IPurchaseAppService purchaseService,
        INotificationService notificationService,
        CancellationToken ct)
    {
        var result = await purchaseService.ReceiveAsync(id, request, ct);
        await notificationService.NotifyPurchaseOrderStatusChanged(id, result.OrderNumber, result.Status);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> CancelAsync(
        string id,
        IPurchaseAppService purchaseService,
        INotificationService notificationService,
        CancellationToken ct)
    {
        await purchaseService.CancelAsync(id, ct);
        await notificationService.NotifyPurchaseOrderStatusChanged(id, id, "Cancelled");
        return TypedResults.Ok();
    }
}
