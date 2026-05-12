using MES.Application.DTOs;
using MES.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MES.Api.Controllers;

/// <summary>
/// 风险预警控制器
/// </summary>
[ApiController]
[Authorize]
[Route("api/v1/[controller]")]
public class RiskController : ControllerBase
{
    private readonly IRiskAppService _riskService;

    public RiskController(IRiskAppService riskService)
    {
        _riskService = riskService;
    }

    /// <summary>
    /// 获取风险预警看板数据
    /// </summary>
    [HttpGet("dashboard")]
    [ProducesResponseType(typeof(RiskDashboardDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDashboard(CancellationToken ct)
    {
        var result = await _riskService.GetRiskDashboardAsync(ct);
        return Ok(result);
    }
}
