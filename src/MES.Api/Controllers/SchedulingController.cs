using MES.Application.DTOs;
using MES.Application.Services;
using MES.Api.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace MES.Api.Controllers;

/// <summary>
/// 排产管理控制器
/// </summary>
[ApiController]
[Authorize]
[Route("api/v1/[controller]")]
public class SchedulingController : ControllerBase
{
    private readonly ISchedulingAppService _schedulingService;
    private readonly IMemoryCache _cache;

    public SchedulingController(ISchedulingAppService schedulingService, IMemoryCache cache)
    {
        _schedulingService = schedulingService;
        _cache = cache;
    }

    /// <summary>
    /// 执行智能排产优化
    /// </summary>
    [HttpPost("optimize")]
    [Audit]
    [ProducesResponseType(typeof(SchedulingResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<SchedulingResultDto>> OptimizeSchedule(
        [FromBody] OptimizeScheduleRequest request,
        CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _schedulingService.OptimizeScheduleAsync(request, ct);
        return Ok(result);
    }

    /// <summary>
    /// 获取当前排产计划
    /// </summary>
    [HttpGet("current")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(SchedulePlanDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SchedulePlanDto>> GetCurrentPlan(CancellationToken ct)
    {
        var cacheKey = "current_schedule_plan";
        if (_cache.TryGetValue(cacheKey, out SchedulePlanDto? cachedPlan))
        {
            return Ok(cachedPlan);
        }

        var plan = await _schedulingService.GetCurrentPlanAsync(ct);
        if (plan == null)
            return NotFound("未找到当前排产计划");

        _cache.Set(cacheKey, plan, TimeSpan.FromMinutes(5));
        return Ok(plan);
    }

    /// <summary>
    /// 获取排产计划列表
    /// </summary>
    [HttpGet("plans")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(List<SchedulePlanDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<SchedulePlanDto>>> GetAllPlans(CancellationToken ct)
    {
        var plans = await _schedulingService.GetAllPlansAsync(ct);
        return Ok(plans);
    }

    /// <summary>
    /// 获取排产计划详情
    /// </summary>
    [HttpGet("plans/{id}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(SchedulePlanDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SchedulePlanDto>> GetPlanById(string id, CancellationToken ct)
    {
        var plan = await _schedulingService.GetPlanByIdAsync(id, ct);
        if (plan == null)
            return NotFound($"排产计划 {id} 不存在");

        return Ok(plan);
    }

    /// <summary>
    /// 创建工单
    /// </summary>
    [HttpPost("workorders")]
    [Audit]
    [ProducesResponseType(typeof(WorkOrderDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<WorkOrderDto>> CreateWorkOrder(
        [FromBody] CreateWorkOrderRequest request,
        CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var workOrder = await _schedulingService.CreateWorkOrderAsync(request, ct);
        return CreatedAtAction(nameof(GetWorkOrderById), new { id = workOrder.Id }, workOrder);
    }

    /// <summary>
    /// 获取工单列表
    /// </summary>
    [HttpGet("workorders")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(PagedResult<WorkOrderDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<WorkOrderDto>>> GetWorkOrders(
        [FromQuery] WorkOrderQueryParameters parameters,
        CancellationToken ct)
    {
        var result = await _schedulingService.GetWorkOrdersAsync(parameters, ct);
        return Ok(result);
    }

    /// <summary>
    /// 获取工单详情
    /// </summary>
    [HttpGet("workorders/{id}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(WorkOrderDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<WorkOrderDto>> GetWorkOrderById(string id, CancellationToken ct)
    {
        var workOrder = await _schedulingService.GetWorkOrderByIdAsync(id, ct);
        if (workOrder == null)
            return NotFound($"工单 {id} 不存在");

        return Ok(workOrder);
    }

    /// <summary>
    /// 更新工单状态
    /// </summary>
    [HttpPatch("workorders/{id}/status")]
    [Audit]
    [ProducesResponseType(typeof(WorkOrderDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<WorkOrderDto>> UpdateWorkOrderStatus(
        string id,
        [FromBody] UpdateStatusRequest request,
        CancellationToken ct)
    {
        var workOrder = await _schedulingService.UpdateWorkOrderStatusAsync(id, request.Status, ct);
        return Ok(workOrder);
    }

    /// <summary>
    /// 删除工单
    /// </summary>
    [HttpDelete("workorders/{id}")]
    [Audit]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteWorkOrder(string id, CancellationToken ct)
    {
        var workOrder = await _schedulingService.GetWorkOrderByIdAsync(id, ct);
        if (workOrder == null)
            return NotFound();

        await _schedulingService.DeleteWorkOrderAsync(id, ct);
        return NoContent();
    }

    /// <summary>
    /// 批量优化对比（多目标并行）
    /// </summary>
    [HttpPost("optimize-compare")]
    [Audit]
    [ProducesResponseType(typeof(BatchOptimizeResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<BatchOptimizeResultDto>> BatchOptimize(
        [FromBody] BatchOptimizeRequest request,
        CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _schedulingService.BatchOptimizeAsync(request, ct);
        return Ok(result);
    }

    /// <summary>
    /// 提交排产方案采纳反馈
    /// </summary>
    [HttpPost("adoption-feedback")]
    [Audit]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SubmitAdoptionFeedback(
        [FromBody] AdoptionFeedbackRequest request,
        CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var operatorUser = User.Identity?.Name ?? "unknown";
        await _schedulingService.RecordAdoptionFeedbackAsync(request, operatorUser, ct);
        return Created();
    }
}

/// <summary>
/// 状态更新请求
/// </summary>
public class UpdateStatusRequest
{
    public string Status { get; set; } = string.Empty;
}
