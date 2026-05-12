using MES.Application.DTOs;
using MES.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MES.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/[controller]")]
public class AnomalyController : ControllerBase
{
    private readonly IAnomalyAppService _anomalyService;

    public AnomalyController(IAnomalyAppService anomalyService)
    {
        _anomalyService = anomalyService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<ProductionAnomalyDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<ProductionAnomalyDto>>> GetAll(CancellationToken ct)
    {
        var anomalies = await _anomalyService.GetOpenAnomaliesAsync(ct);
        return Ok(anomalies);
    }

    [HttpGet("critical")]
    [ProducesResponseType(typeof(List<ProductionAnomalyDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<ProductionAnomalyDto>>> GetCritical(CancellationToken ct)
    {
        var anomalies = await _anomalyService.GetCriticalOpenAsync(ct);
        return Ok(anomalies);
    }

    [HttpGet("by-workorder/{workOrderNumber}")]
    [ProducesResponseType(typeof(List<ProductionAnomalyDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<ProductionAnomalyDto>>> GetByWorkOrder(string workOrderNumber, CancellationToken ct)
    {
        var anomalies = await _anomalyService.GetByWorkOrderAsync(workOrderNumber, ct);
        return Ok(anomalies);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ProductionAnomalyDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProductionAnomalyDetailDto>> GetById(string id, CancellationToken ct)
    {
        var anomaly = await _anomalyService.GetAnomalyByIdAsync(id, ct);
        if (anomaly == null) return NotFound($"异常 {id} 不存在");
        return Ok(anomaly);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ProductionAnomalyDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ProductionAnomalyDto>> Create([FromBody] CreateAnomalyRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var anomaly = await _anomalyService.CreateAnomalyAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = anomaly.Id }, anomaly);
    }

    [HttpPost("{id}/analyze")]
    [ProducesResponseType(typeof(AnalyzeAnomalyResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AnalyzeAnomalyResultDto>> Analyze(string id, CancellationToken ct)
    {
        try
        {
            var result = await _anomalyService.AnalyzeAnomalyAsync(id, ct);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpPost("{id}/responses")]
    [ProducesResponseType(typeof(ProdAnomalyResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProdAnomalyResponseDto>> AddResponse(string id, [FromBody] AddAnomalyResponseRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            var response = await _anomalyService.AddResponseAsync(id, request, ct);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpPost("{id}/resolve")]
    [ProducesResponseType(typeof(ProductionAnomalyDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProductionAnomalyDto>> Resolve(string id, [FromBody] ResolveAnomalyRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            var anomaly = await _anomalyService.ResolveAnomalyAsync(id, request, ct);
            return Ok(anomaly);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }
}
