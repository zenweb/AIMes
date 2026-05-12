using MES.Application.DTOs;
using MES.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MES.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/[controller]")]
public class RoutingController : ControllerBase
{
    private readonly IRoutingAppService _routingService;

    public RoutingController(IRoutingAppService routingService)
    {
        _routingService = routingService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<ProcessRouteDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<ProcessRouteDto>>> GetAll(CancellationToken ct)
    {
        var routes = await _routingService.GetAllRoutesAsync(ct);
        return Ok(routes);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(RouteDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<RouteDetailDto>> GetById(string id, CancellationToken ct)
    {
        var route = await _routingService.GetRouteByIdAsync(id, ct);
        if (route == null) return NotFound($"工艺路线 {id} 不存在");
        return Ok(route);
    }

    [HttpGet("by-code/{routeCode}")]
    [ProducesResponseType(typeof(RouteDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<RouteDetailDto>> GetByCode(string routeCode, CancellationToken ct)
    {
        var route = await _routingService.GetRouteByCodeAsync(routeCode, ct);
        if (route == null) return NotFound($"工艺路线 {routeCode} 不存在");
        return Ok(route);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ProcessRouteDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ProcessRouteDto>> Create([FromBody] CreateRouteRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var route = await _routingService.CreateRouteAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = route.Id }, route);
    }
}
