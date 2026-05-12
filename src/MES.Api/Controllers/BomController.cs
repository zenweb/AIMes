using MES.Application.DTOs;
using MES.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MES.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/[controller]")]
public class BomController : ControllerBase
{
    private readonly IBomAppService _bomService;

    public BomController(IBomAppService bomService)
    {
        _bomService = bomService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<BomSummaryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<BomSummaryDto>>> GetAll(CancellationToken ct)
    {
        var boms = await _bomService.GetAllBomsAsync(ct);
        return Ok(boms);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(BomDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BomDetailDto>> GetById(string id, CancellationToken ct)
    {
        var bom = await _bomService.GetBomByIdAsync(id, ct);
        if (bom == null) return NotFound($"BOM {id} 不存在");
        return Ok(bom);
    }

    [HttpPost]
    [ProducesResponseType(typeof(BomSummaryDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<BomSummaryDto>> Create([FromBody] CreateBomRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var bom = await _bomService.CreateBomAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = bom.Id }, bom);
    }

    [HttpGet("{id}/explode")]
    [ProducesResponseType(typeof(BomExplosionResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BomExplosionResultDto>> Explode(string id, [FromQuery] decimal quantity = 1, CancellationToken ct = default)
    {
        try
        {
            var result = await _bomService.ExplodeBomAsync(id, quantity, ct);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }
}
