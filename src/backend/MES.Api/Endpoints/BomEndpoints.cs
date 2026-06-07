using MES.Api.Filters;
using MES.Application.DTOs;
using MES.Application.Services;

namespace MES.Api.Endpoints;

public static class BomEndpoints
{
    private static readonly AuditEndpointFilter Audit = new("bom");

    public static RouteGroupBuilder MapBomEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/", GetAllAsync).WithTags("BOM管理");
        group.MapGet("/{id}", GetByIdAsync).WithTags("BOM管理");
        group.MapPost("/", CreateAsync).WithTags("BOM管理").AddEndpointFilter<ValidationEndpointFilter>().AddEndpointFilter(Audit);
        group.MapGet("/{id}/explode", ExplodeAsync).WithTags("BOM管理");
        group.MapGet("/{id}/kitting", KittingAsync).WithTags("BOM管理");
        return group;
    }

    private static async Task<IResult> GetAllAsync([AsParameters] PageQueryParameters parameters, IBomAppService bomService, CancellationToken ct)
    {
        var boms = await bomService.GetAllBomsAsync(parameters.Page, parameters.PageSize, ct);
        return TypedResults.Ok(boms);
    }

    private static async Task<IResult> GetByIdAsync(string id, IBomAppService bomService, CancellationToken ct)
    {
        var bom = await bomService.GetBomByIdAsync(id, ct);
        if (bom is null)
            return TypedResults.NotFound(new { message = $"BOM {id} 不存在" });
        return TypedResults.Ok(bom);
    }

    private static async Task<IResult> CreateAsync(
        CreateBomRequest request,
        IBomAppService bomService,
        CancellationToken ct)
    {
        var bom = await bomService.CreateBomAsync(request, ct);
        return TypedResults.Created($"/api/v1/bom/{bom.Id}", bom);
    }

    private static async Task<IResult> ExplodeAsync(
        string id,
        IBomAppService bomService,
        CancellationToken ct,
        decimal quantity = 1)
    {
        var result = await bomService.ExplodeBomAsync(id, quantity, ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> KittingAsync(
        string id,
        IBomAppService bomService,
        CancellationToken ct,
        decimal quantity = 1)
    {
        var result = await bomService.CheckKittingAsync(id, quantity, ct);
        return TypedResults.Ok(result);
    }
}
