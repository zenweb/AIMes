using MES.Application.DTOs;
using MES.Application.Services;
using MES.Api.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MES.Api.Controllers;

/// <summary>
/// 设备管理控制器
/// </summary>
[ApiController]
[Authorize]
[Route("api/v1/[controller]")]
public class EquipmentController : ControllerBase
{
    private readonly IEquipmentAppService _equipmentService;

    public EquipmentController(IEquipmentAppService equipmentService)
    {
        _equipmentService = equipmentService;
    }

    /// <summary>
    /// 创建设备
    /// </summary>
    [HttpPost]
    [Audit]
    [ProducesResponseType(typeof(EquipmentDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<EquipmentDto>> CreateEquipment(
        [FromBody] CreateEquipmentRequest request,
        CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var equipment = await _equipmentService.CreateEquipmentAsync(request, ct);
        return CreatedAtAction(nameof(GetEquipmentById), new { id = equipment.Id }, equipment);
    }

    /// <summary>
    /// 获取设备列表
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType(typeof(List<EquipmentDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<EquipmentDto>>> GetEquipments(
        [FromQuery] string? workshopId,
        [FromQuery] string? status,
        CancellationToken ct)
    {
        var equipments = await _equipmentService.GetEquipmentsAsync(workshopId, status, ct);
        return Ok(equipments);
    }

    /// <summary>
    /// 获取设备详情
    /// </summary>
    [HttpGet("{id}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(EquipmentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EquipmentDto>> GetEquipmentById(string id, CancellationToken ct)
    {
        var equipment = await _equipmentService.GetEquipmentByIdAsync(id, ct);
        if (equipment == null)
            return NotFound($"设备 {id} 不存在");

        return Ok(equipment);
    }

    /// <summary>
    /// 获取设备状态统计
    /// </summary>
    [HttpGet("statistics")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(EquipmentStatisticsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<EquipmentStatisticsDto>> GetStatistics(
        [FromQuery] string? workshopId,
        CancellationToken ct)
    {
        var statistics = await _equipmentService.GetStatisticsAsync(workshopId, ct);
        return Ok(statistics);
    }

    /// <summary>
    /// 更新设备状态
    /// </summary>
    [HttpPatch("{id}/status")]
    [Audit]
    [ProducesResponseType(typeof(EquipmentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EquipmentDto>> UpdateStatus(
        string id,
        [FromBody] UpdateEquipmentStatusRequest request,
        CancellationToken ct)
    {
        try
        {
            var equipment = await _equipmentService.UpdateStatusAsync(id, request.Status, ct);
            return Ok(equipment);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    /// <summary>
    /// 获取设备健康报告
    /// </summary>
    [HttpGet("{id}/health")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(EquipmentHealthDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EquipmentHealthDto>> GetHealthReport(string id, CancellationToken ct)
    {
        try
        {
            var report = await _equipmentService.GetHealthReportAsync(id, ct);
            return Ok(report);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    /// <summary>
    /// 设备故障诊断
    /// </summary>
    [HttpPost("{id}/diagnose")]
    [Audit]
    [ProducesResponseType(typeof(DiagnosticReportDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DiagnosticReportDto>> Diagnose(
        string id,
        [FromBody] DiagnoseRequest? request,
        CancellationToken ct)
    {
        try
        {
            var report = await _equipmentService.DiagnoseAsync(id, request?.ErrorCode, ct);
            return Ok(report);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    /// <summary>
    /// 获取设备维护历史
    /// </summary>
    [HttpGet("{id}/maintenance-history")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(List<MaintenanceRecordDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<MaintenanceRecordDto>>> GetMaintenanceHistory(
        string id,
        CancellationToken ct)
    {
        var history = await _equipmentService.GetMaintenanceHistoryAsync(id, ct);
        return Ok(history);
    }
}

/// <summary>
/// 设备状态更新请求
/// </summary>
public class UpdateEquipmentStatusRequest
{
    public string Status { get; set; } = string.Empty;
}

/// <summary>
/// 诊断请求
/// </summary>
public class DiagnoseRequest
{
    public string? ErrorCode { get; set; }
}

/// <summary>
/// 维护记录DTO
/// </summary>
public class MaintenanceRecordDto
{
    public string Id { get; set; } = string.Empty;
    public string EquipmentId { get; set; } = string.Empty;
    public string MaintenanceType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public string PerformedBy { get; set; } = string.Empty;
    public string Result { get; set; } = string.Empty;
    public decimal Cost { get; set; }
    public List<string> SparePartsUsed { get; set; } = new();
}

/// <summary>
/// 诊断报告DTO
/// </summary>
public class DiagnosticReportDto
{
    public string EquipmentId { get; set; } = string.Empty;
    public string EquipmentName { get; set; } = string.Empty;
    public string ErrorCode { get; set; } = string.Empty;
    public string MostLikelyCause { get; set; } = string.Empty;
    public string DiagnosticBasis { get; set; } = string.Empty;
    public List<string> SuggestedSteps { get; set; } = new();
    public List<string> RequiredSpareParts { get; set; } = new();
    public string EstimatedRepairTime { get; set; } = string.Empty;
}
