using MES.Application.DTOs;
using MES.Domain.Entities.Routing;
using MES.Domain.Interfaces.Repositories;
using MES.Domain.ValueObjects;

namespace MES.Application.Services;

public interface IRoutingAppService
{
    Task<PagedResult<ProcessRouteDto>> GetAllRoutesAsync(int page = 1, int pageSize = 20, CancellationToken ct = default);
    Task<RouteDetailDto?> GetRouteByIdAsync(string id, CancellationToken ct = default);
    Task<RouteDetailDto?> GetRouteByCodeAsync(string routeCode, CancellationToken ct = default);
    Task<ProcessRouteDto> CreateRouteAsync(CreateRouteRequest request, CancellationToken ct = default);
}

public class RoutingAppService : IRoutingAppService
{
    private readonly IRoutingRepository _routingRepo;

    public RoutingAppService(IRoutingRepository routingRepo)
    {
        _routingRepo = routingRepo;
    }

    public async Task<PagedResult<ProcessRouteDto>> GetAllRoutesAsync(int page = 1, int pageSize = 20, CancellationToken ct = default)
    {
        var all = await _routingRepo.GetAllAsync(ct);
        var skip = Math.Max(0, page - 1) * pageSize;
        return new PagedResult<ProcessRouteDto>
        {
            Items = all.Skip(skip).Take(pageSize).Select(MapToSummary).ToList(),
            TotalCount = all.Count,
            Page = page,
            PageSize = pageSize,
        };
    }

    public async Task<RouteDetailDto?> GetRouteByIdAsync(string id, CancellationToken ct = default)
    {
        var route = await _routingRepo.GetByIdAsync(id, ct);
        return route != null ? MapToDetail(route) : null;
    }

    public async Task<RouteDetailDto?> GetRouteByCodeAsync(string routeCode, CancellationToken ct = default)
    {
        var route = await _routingRepo.GetByRouteCodeAsync(routeCode, ct);
        return route != null ? MapToDetail(route) : null;
    }

    public async Task<ProcessRouteDto> CreateRouteAsync(CreateRouteRequest request, CancellationToken ct = default)
    {
        var route = new ProcessRoute(
            request.RouteCode,
            request.RouteName,
            new ProductCode(request.ProductCode),
            request.ProductName,
            "V1.0");

        foreach (var stepReq in request.Steps.OrderBy(s => s.Sequence))
        {
            var step = new RoutingStep(
                stepReq.Sequence,
                new OperationCode(stepReq.OperationCode),
                stepReq.OperationName,
                stepReq.WorkstationType);

            route.AddStep(step);
        }

        var created = await _routingRepo.AddAsync(route, ct);
        return MapToSummary(created);
    }

    private ProcessRouteDto MapToSummary(ProcessRoute route) => new()
    {
        Id = route.Id,
        RouteCode = route.RouteCode,
        RouteName = route.RouteName,
        ProductCode = route.ProductCode.Value,
        ProductName = route.ProductName,
        Version = route.Version,
        Status = route.Status.ToString(),
        TotalLeadTimeMinutes = route.TotalLeadTimeMinutes,
        StepCount = route.Steps.Count
    };

    private RouteDetailDto MapToDetail(ProcessRoute route) => new()
    {
        Id = route.Id,
        RouteCode = route.RouteCode,
        RouteName = route.RouteName,
        ProductCode = route.ProductCode.Value,
        ProductName = route.ProductName,
        Version = route.Version,
        Status = route.Status.ToString(),
        TotalLeadTimeMinutes = route.TotalLeadTimeMinutes,
        Steps = route.Steps.OrderBy(s => s.StepSequence).Select(s => new RoutingStepDto
        {
            Id = s.Id,
            StepSequence = s.StepSequence,
            OperationCode = s.OperationCode.Value,
            OperationName = s.OperationName,
            WorkstationType = s.WorkstationType,
            StandardSetupMinutes = s.StandardSetupMinutes,
            StandardRunMinutesPerUnit = s.StandardRunMinutesPerUnit,
            EquipmentType = s.EquipmentType,
            InspectionRequired = s.InspectionRequired,
            Parameters = s.Parameters.Select(p => new StepParameterDto
            {
                ParameterCode = p.ParameterCode,
                ParameterName = p.ParameterName,
                DefaultValue = p.DefaultValue,
                Unit = p.Unit,
                UpperLimit = p.UpperLimit,
                LowerLimit = p.LowerLimit,
                IsMandatory = p.IsMandatory
            }).ToList()
        }).ToList()
    };
}
