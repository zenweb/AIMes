using MES.Application.DTOs;
using MES.Application.Services;
using MES.Api.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MES.Api.Controllers;

/// <summary>
/// 质量管理控制器
/// </summary>
[ApiController]
[Authorize]
[Route("api/v1/[controller]")]
public class QualityController : ControllerBase
{
    private readonly IQualityAppService _qualityService;

    public QualityController(IQualityAppService qualityService)
    {
        _qualityService = qualityService;
    }

    /// <summary>
    /// 创建质检记录
    /// </summary>
    [HttpPost("inspections")]
    [Audit]
    [ProducesResponseType(typeof(InspectionDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<InspectionDto>> CreateInspection(
        [FromBody] CreateInspectionRequest request,
        CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var inspection = await _qualityService.CreateInspectionAsync(request, ct);
        return CreatedAtAction(nameof(GetInspectionById), new { id = inspection.Id }, inspection);
    }

    /// <summary>
    /// 获取质检记录详情
    /// </summary>
    [HttpGet("inspections/{id}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(InspectionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<InspectionDto>> GetInspectionById(string id, CancellationToken ct)
    {
        var inspection = await _qualityService.GetInspectionByIdAsync(id, ct);
        if (inspection == null)
            return NotFound($"质检记录 {id} 不存在");

        return Ok(inspection);
    }

    /// <summary>
    /// 获取工单的质检记录列表
    /// </summary>
    [HttpGet("inspections/workorder/{workOrderId}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(List<InspectionDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<InspectionDto>>> GetInspectionsByWorkOrder(
        string workOrderId,
        CancellationToken ct)
    {
        var inspections = await _qualityService.GetInspectionsByWorkOrderAsync(workOrderId, ct);
        return Ok(inspections);
    }

    /// <summary>
    /// 获取质量统计数据
    /// </summary>
    [HttpGet("statistics")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(QualityStatisticsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<QualityStatisticsDto>> GetStatistics(
        [FromQuery] string? productCode,
        CancellationToken ct)
    {
        var statistics = await _qualityService.GetStatisticsAsync(productCode, ct);
        return Ok(statistics);
    }

    /// <summary>
    /// 分析质量异常根因
    /// </summary>
    [HttpPost("inspections/{inspectionId}/analyze")]
    [Audit]
    [ProducesResponseType(typeof(RootCauseAnalysisDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<RootCauseAnalysisDto>> AnalyzeRootCause(
        string inspectionId,
        CancellationToken ct)
    {
        try
        {
            var analysis = await _qualityService.AnalyzeRootCauseAsync(inspectionId, ct);
            return Ok(analysis);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    /// <summary>
    /// 分析SPC趋势
    /// </summary>
    [HttpGet("spc/analyze")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(SpcAnalysisDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<SpcAnalysisDto>> AnalyzeSpcTrend(
        [FromQuery] string processParameter,
        [FromQuery] int windowSize = 20,
        CancellationToken ct = default)
    {
        if (string.IsNullOrEmpty(processParameter))
            return BadRequest("工序参数不能为空");

        var analysis = await _qualityService.AnalyzeSpcTrendAsync(processParameter, windowSize, ct);
        return Ok(analysis);
    }
}

/// <summary>
/// SPC分析结果DTO（从QualityAppService复用）
/// </summary>
public class SpcAnalysisDto
{
    public string ProcessParameter { get; set; } = string.Empty;
    public bool HasTrend { get; set; }
    public bool HasDrift { get; set; }
    public bool HasCycle { get; set; }
    public bool IsNearLimit { get; set; }
    public string TrendDirection { get; set; } = string.Empty;
    public string RecommendedAction { get; set; } = string.Empty;
    public List<double> DataPoints { get; set; } = new();
}
