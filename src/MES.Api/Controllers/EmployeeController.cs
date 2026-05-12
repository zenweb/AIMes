using MES.Application.DTOs;
using MES.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MES.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/[controller]")]
public class EmployeeController : ControllerBase
{
    private readonly IEmployeeAppService _employeeService;

    public EmployeeController(IEmployeeAppService employeeService)
    {
        _employeeService = employeeService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<EmployeeDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<EmployeeDto>>> GetAll(CancellationToken ct)
    {
        var result = await _employeeService.GetAllAsync(ct);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(EmployeeDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EmployeeDto>> GetById(string id, CancellationToken ct)
    {
        var emp = await _employeeService.GetByIdAsync(id, ct);
        if (emp == null) return NotFound($"员工 {id} 不存在");
        return Ok(emp);
    }

    [HttpGet("team/{team}")]
    [ProducesResponseType(typeof(List<EmployeeDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<EmployeeDto>>> GetByTeam(string team, CancellationToken ct)
    {
        var result = await _employeeService.GetByTeamAsync(team, ct);
        return Ok(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(EmployeeDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<EmployeeDto>> Create([FromBody] CreateEmployeeRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var emp = await _employeeService.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = emp.Id }, emp);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(EmployeeDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<EmployeeDto>> Update(string id, [FromBody] UpdateEmployeeRequest request, CancellationToken ct)
    {
        try
        {
            var emp = await _employeeService.UpdateAsync(id, request, ct);
            return Ok(emp);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpPost("{id}/deactivate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult> Deactivate(string id, CancellationToken ct)
    {
        await _employeeService.DeactivateAsync(id, ct);
        return Ok();
    }
}
