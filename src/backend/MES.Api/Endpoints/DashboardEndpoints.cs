using MES.Application.Services;

namespace MES.Api.Endpoints;

public static class DashboardEndpoints
{
    public static RouteGroupBuilder MapDashboardEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/", GetDashboardAsync).WithTags("仪表盘");
        return group;
    }

    private static async Task<IResult> GetDashboardAsync(
        IDashboardKpiService kpiService,
        CancellationToken ct)
    {
        var dashboard = await kpiService.ComputeDashboardAsync(ct);
        return TypedResults.Ok(dashboard);
    }
}
