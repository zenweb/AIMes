using MES.Application.DTOs;
using MES.Application.Services;
using MES.Api.Hubs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MES.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/[controller]")]
public class PurchaseController : ControllerBase
{
    private readonly IPurchaseAppService _purchaseService;
    private readonly INotificationService _notificationService;

    public PurchaseController(IPurchaseAppService purchaseService, INotificationService notificationService)
    {
        _purchaseService = purchaseService;
        _notificationService = notificationService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<PurchaseOrderSummaryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<PurchaseOrderSummaryDto>>> GetAll(CancellationToken ct)
    {
        var result = await _purchaseService.GetAllAsync(ct);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(PurchaseOrderDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PurchaseOrderDetailDto>> GetById(string id, CancellationToken ct)
    {
        var order = await _purchaseService.GetByIdAsync(id, ct);
        if (order == null) return NotFound($"采购单 {id} 不存在");
        return Ok(order);
    }

    [HttpPost]
    [ProducesResponseType(typeof(PurchaseOrderDetailDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PurchaseOrderDetailDto>> Create([FromBody] CreatePurchaseOrderRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var order = await _purchaseService.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
    }

    [HttpPost("{id}/submit")]
    [ProducesResponseType(typeof(PurchaseOrderDetailDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<PurchaseOrderDetailDto>> Submit(string id, CancellationToken ct)
    {
        try
        {
            var result = await _purchaseService.SubmitAsync(id, ct);
            await _notificationService.NotifyPurchaseOrderStatusChanged(id, result.OrderNumber, "Submitted");
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id}/confirm")]
    [ProducesResponseType(typeof(PurchaseOrderDetailDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<PurchaseOrderDetailDto>> Confirm(string id, CancellationToken ct)
    {
        try
        {
            var result = await _purchaseService.ConfirmAsync(id, ct);
            await _notificationService.NotifyPurchaseOrderStatusChanged(id, result.OrderNumber, "Confirmed");
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id}/receive")]
    [ProducesResponseType(typeof(PurchaseOrderDetailDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<PurchaseOrderDetailDto>> Receive(string id, [FromBody] ReceiveRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            var result = await _purchaseService.ReceiveAsync(id, request, ct);
            await _notificationService.NotifyPurchaseOrderStatusChanged(id, result.OrderNumber, result.Status);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id}/cancel")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult> Cancel(string id, CancellationToken ct)
    {
        await _purchaseService.CancelAsync(id, ct);
        await _notificationService.NotifyPurchaseOrderStatusChanged(id, id, "Cancelled");
        return Ok();
    }
}
