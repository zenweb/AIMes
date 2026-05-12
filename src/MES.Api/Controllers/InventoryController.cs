using MES.Application.DTOs;
using MES.Application.Services;
using MES.Api.Hubs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MES.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/[controller]")]
public class InventoryController : ControllerBase
{
    private readonly IInventoryAppService _inventoryService;
    private readonly INotificationService _notificationService;

    public InventoryController(IInventoryAppService inventoryService, INotificationService notificationService)
    {
        _inventoryService = inventoryService;
        _notificationService = notificationService;
    }

    [HttpGet("dashboard")]
    [ProducesResponseType(typeof(InventoryDashboardDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<InventoryDashboardDto>> GetDashboard(CancellationToken ct)
    {
        var result = await _inventoryService.GetDashboardAsync(ct);
        return Ok(result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<InventoryItemDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<InventoryItemDto>>> GetAll(CancellationToken ct)
    {
        var items = await _inventoryService.GetAllItemsAsync(ct);
        return Ok(items);
    }

    [HttpGet("{materialCode}")]
    [ProducesResponseType(typeof(InventoryItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<InventoryItemDto>> GetByCode(string materialCode, CancellationToken ct)
    {
        var item = await _inventoryService.GetItemByCodeAsync(materialCode, ct);
        if (item == null) return NotFound($"物料 {materialCode} 不存在");
        return Ok(item);
    }

    [HttpGet("transactions")]
    [ProducesResponseType(typeof(List<StockTransactionDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<StockTransactionDto>>> GetTransactions(
        [FromQuery] string? materialCode, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await _inventoryService.GetTransactionsAsync(materialCode, page, pageSize, ct);
        return Ok(result);
    }

    [HttpPost("stock-in")]
    [ProducesResponseType(typeof(StockTransactionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<StockTransactionDto>> StockIn([FromBody] StockInRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            var result = await _inventoryService.StockInAsync(request, ct);
            await _notificationService.NotifyInventoryChanged(request.MaterialCode, result.MaterialName, "StockIn", request.Quantity);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("stock-out")]
    [ProducesResponseType(typeof(StockTransactionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<StockTransactionDto>> StockOut([FromBody] StockOutRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            var result = await _inventoryService.StockOutAsync(request, ct);
            await _notificationService.NotifyInventoryChanged(request.MaterialCode, result.MaterialName, "StockOut", request.Quantity);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("transfer")]
    [ProducesResponseType(typeof(StockTransactionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<StockTransactionDto>> Transfer([FromBody] TransferRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            var result = await _inventoryService.TransferAsync(request, ct);
            await _notificationService.NotifyInventoryChanged(request.MaterialCode, result.MaterialName, "Transfer", request.Quantity);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("adjust")]
    [ProducesResponseType(typeof(StockTransactionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<StockTransactionDto>> Adjust([FromBody] AdjustmentRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            var result = await _inventoryService.AdjustAsync(request, ct);
            await _notificationService.NotifyInventoryChanged(request.MaterialCode, result.MaterialName, "Adjustment", request.NewQuantity);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
