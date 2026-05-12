using MES.Application.DTOs;
using MES.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MES.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/v1/[controller]")]
public class AdminController : ControllerBase
{
    private readonly IAdminAppService _adminService;

    public AdminController(IAdminAppService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("users")]
    [ProducesResponseType(typeof(List<SystemUserDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<SystemUserDto>>> GetUsers(CancellationToken ct)
    {
        var result = await _adminService.GetAllUsersAsync(ct);
        return Ok(result);
    }

    [HttpPost("users")]
    [ProducesResponseType(typeof(SystemUserDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<SystemUserDto>> CreateUser([FromBody] CreateUserRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var user = await _adminService.CreateUserAsync(request, ct);
        return CreatedAtAction(nameof(GetUsers), new { id = user.Id }, user);
    }

    [HttpPut("users/{id}")]
    [ProducesResponseType(typeof(SystemUserDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<SystemUserDto>> UpdateUser(string id, [FromBody] UpdateUserRequest request, CancellationToken ct)
    {
        try
        {
            var user = await _adminService.UpdateUserAsync(id, request, ct);
            return Ok(user);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("configs")]
    [ProducesResponseType(typeof(List<SystemConfigDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<SystemConfigDto>>> GetConfigs(CancellationToken ct)
    {
        var result = await _adminService.GetAllConfigsAsync(ct);
        return Ok(result);
    }

    [HttpPut("configs/{id}")]
    [ProducesResponseType(typeof(SystemConfigDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<SystemConfigDto>> UpdateConfig(string id, [FromBody] UpdateConfigRequest request, CancellationToken ct)
    {
        try
        {
            var config = await _adminService.UpdateConfigAsync(id, request, ct);
            return Ok(config);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("notifications")]
    [ProducesResponseType(typeof(List<NotificationConfigDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<NotificationConfigDto>>> GetNotificationConfigs(CancellationToken ct)
    {
        var result = await _adminService.GetNotificationConfigsAsync(ct);
        return Ok(result);
    }

    [HttpPut("notifications/{id}")]
    [ProducesResponseType(typeof(NotificationConfigDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<NotificationConfigDto>> UpdateNotificationConfig(string id, [FromBody] UpdateNotificationConfigRequest request, CancellationToken ct)
    {
        try
        {
            var config = await _adminService.UpdateNotificationConfigAsync(id, request, ct);
            return Ok(config);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }
}
