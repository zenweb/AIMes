using MES.Application.DTOs;
using MES.Application.Services;
using MES.Api.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MES.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/production")]
public class ProductionController : ControllerBase
{
    private readonly IOperationService _operationService;

    public ProductionController(IOperationService operationService)
    {
        _operationService = operationService;
    }

    [HttpPost("scan")]
    [Audit]
    [ProducesResponseType(typeof(OperationInfoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<OperationInfoDto>> Scan([FromBody] ScanOperationRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _operationService.ScanAsync(request, ct);
        return Ok(result);
    }

    [HttpPost("operations/{id}/start")]
    [Audit]
    [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<OperationResultDto>> Start(string id, [FromBody] StartOperationRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _operationService.StartAsync(id, request, ct);
        return Ok(result);
    }

    [HttpPost("operations/{id}/complete")]
    [Audit]
    [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<OperationResultDto>> Complete(string id, [FromBody] CompleteOperationRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _operationService.CompleteAsync(id, request, ct);
        return Ok(result);
    }

    [HttpPost("operations/{id}/exception")]
    [Audit]
    [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<OperationResultDto>> ReportException(string id, [FromBody] ReportExceptionRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _operationService.ReportExceptionAsync(id, request, ct);
        return Ok(result);
    }
}
