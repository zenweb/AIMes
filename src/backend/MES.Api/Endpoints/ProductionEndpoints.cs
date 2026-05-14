using MES.Api.Filters;
using MES.Application.DTOs;
using MES.Application.Services;

namespace MES.Api.Endpoints;

public static class ProductionEndpoints
{
    private static readonly AuditEndpointFilter Audit = new("production");

    public static RouteGroupBuilder MapProductionEndpoints(this RouteGroupBuilder group)
    {
        group.MapPost("/scan", ScanAsync)
             .WithTags("生产管理")
             .RequireAuthorization()
             .AddEndpointFilter<ValidationEndpointFilter>()
             .AddEndpointFilter(Audit);
        group.MapPost("/operations/{id}/start", StartAsync)
             .WithTags("生产管理")
             .RequireAuthorization()
             .AddEndpointFilter<ValidationEndpointFilter>()
             .AddEndpointFilter(Audit);
        group.MapPost("/operations/{id}/complete", CompleteAsync)
             .WithTags("生产管理")
             .RequireAuthorization()
             .AddEndpointFilter<ValidationEndpointFilter>()
             .AddEndpointFilter(Audit);
        group.MapPost("/operations/{id}/exception", ReportExceptionAsync)
             .WithTags("生产管理")
             .RequireAuthorization()
             .AddEndpointFilter<ValidationEndpointFilter>()
             .AddEndpointFilter(Audit);
        return group;
    }

    private static async Task<IResult> ScanAsync(
        ScanOperationRequest request,
        IOperationService operationService,
        CancellationToken ct)
    {
        var result = await operationService.ScanAsync(request, ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> StartAsync(
        string id,
        StartOperationRequest request,
        IOperationService operationService,
        CancellationToken ct)
    {
        var result = await operationService.StartAsync(id, request, ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> CompleteAsync(
        string id,
        CompleteOperationRequest request,
        IOperationService operationService,
        CancellationToken ct)
    {
        var result = await operationService.CompleteAsync(id, request, ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> ReportExceptionAsync(
        string id,
        ReportExceptionRequest request,
        IOperationService operationService,
        CancellationToken ct)
    {
        var result = await operationService.ReportExceptionAsync(id, request, ct);
        return TypedResults.Ok(result);
    }
}
