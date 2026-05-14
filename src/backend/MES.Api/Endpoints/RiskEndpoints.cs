using MES.Application.DTOs;
using MES.Application.Services;

namespace MES.Api.Endpoints;

public static class RiskEndpoints
{
    public static RouteGroupBuilder MapRiskEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/dashboard", GetDashboardAsync).WithTags("风险预警");
        return group;
    }

    private static async Task<IResult> GetDashboardAsync(IRiskAppService riskService, CancellationToken ct)
    {
        var result = await riskService.GetRiskDashboardAsync(ct);
        return TypedResults.Ok(result);
    }
}
