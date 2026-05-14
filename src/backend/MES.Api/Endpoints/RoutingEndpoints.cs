using MES.Api.Filters;
using MES.Application.DTOs;
using MES.Application.Services;

namespace MES.Api.Endpoints;

public static class RoutingEndpoints
{
    public static RouteGroupBuilder MapRoutingEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/by-code/{routeCode}", GetByCodeAsync).WithTags("工艺路线");
        group.MapGet("/{id}", GetByIdAsync).WithTags("工艺路线");
        group.MapGet("/", GetAllAsync).WithTags("工艺路线");
        group.MapPost("/", CreateAsync).WithTags("工艺路线").AddEndpointFilter<ValidationEndpointFilter>();
        return group;
    }

    private static async Task<IResult> GetAllAsync([AsParameters] PageQueryParameters parameters, IRoutingAppService routingService, CancellationToken ct)
    {
        var routes = await routingService.GetAllRoutesAsync(parameters.Page, parameters.PageSize, ct);
        return TypedResults.Ok(routes);
    }

    private static async Task<IResult> GetByIdAsync(string id, IRoutingAppService routingService, CancellationToken ct)
    {
        var route = await routingService.GetRouteByIdAsync(id, ct);
        if (route is null)
            return TypedResults.NotFound(new { message = $"工艺路线 {id} 不存在" });
        return TypedResults.Ok(route);
    }

    private static async Task<IResult> GetByCodeAsync(string routeCode, IRoutingAppService routingService, CancellationToken ct)
    {
        var route = await routingService.GetRouteByCodeAsync(routeCode, ct);
        if (route is null)
            return TypedResults.NotFound(new { message = $"工艺路线 {routeCode} 不存在" });
        return TypedResults.Ok(route);
    }

    private static async Task<IResult> CreateAsync(
        CreateRouteRequest request,
        IRoutingAppService routingService,
        CancellationToken ct)
    {
        var route = await routingService.CreateRouteAsync(request, ct);
        return TypedResults.Created($"/api/v1/routing/{route.Id}", route);
    }
}
