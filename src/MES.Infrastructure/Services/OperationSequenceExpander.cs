namespace MES.Infrastructure.Services;

using MES.Domain.Entities.Scheduling;
using MES.Domain.Interfaces.Repositories;
using Microsoft.Extensions.Logging;

/// <summary>工序路由展开服务 — RouteCode → 工序序列</summary>
public class OperationSequenceExpander
{
    private readonly IRoutingRepository _routingRepository;
    private readonly ILogger<OperationSequenceExpander> _logger;

    public OperationSequenceExpander(
        IRoutingRepository routingRepository,
        ILogger<OperationSequenceExpander> logger)
    {
        _routingRepository = routingRepository;
        _logger = logger;
    }

    /// <summary>根据 RouteCode 展开完整工序序列</summary>
    public async Task<RoutingSummary?> ExpandAsync(string routeCode, CancellationToken ct = default)
    {
        var route = await _routingRepository.GetByRouteCodeAsync(routeCode, ct);
        if (route is null)
        {
            _logger.LogWarning("Route not found: {RouteCode}", routeCode);
            return null;
        }

        var orderedSteps = route.Steps.OrderBy(s => s.StepSequence).ToList();
        return new RoutingSummary(
            route.RouteCode,
            route.RouteName,
            orderedSteps.Count,
            orderedSteps.Select(s => s.OperationCode.Value).ToList(),
            route.TotalLeadTimeMinutes ?? orderedSteps.Sum(s => s.StandardSetupMinutes + s.StandardRunMinutesPerUnit));
    }

    /// <summary>批量展开多个路由</summary>
    public async Task<List<RoutingSummary>> ExpandBatchAsync(
        IEnumerable<string> routeCodes, CancellationToken ct = default)
    {
        var result = new List<RoutingSummary>();
        foreach (var code in routeCodes.Distinct())
        {
            var summary = await ExpandAsync(code, ct);
            if (summary is not null)
                result.Add(summary);
        }
        return result;
    }
}
