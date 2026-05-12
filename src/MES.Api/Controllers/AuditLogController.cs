using MES.Application.DTOs;
using MES.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MES.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/v1/audit-logs")]
public class AuditLogController : ControllerBase
{
    private readonly IAuditLogAppService _auditLogService;

    public AuditLogController(IAuditLogAppService auditLogService)
    {
        _auditLogService = auditLogService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<AuditLogDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<AuditLogDto>>> GetAuditLogs(
        [FromQuery] string? action, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await _auditLogService.GetAuditLogsAsync(action, page, pageSize, ct);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(AuditLogDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AuditLogDetailDto>> GetAuditLogById(string id, CancellationToken ct)
    {
        var log = await _auditLogService.GetAuditLogByIdAsync(id, ct);
        if (log == null) return NotFound($"审计日志 {id} 不存在");
        return Ok(log);
    }
}
