using MES.Api.Filters;
using MES.Application.DTOs;
using MES.Application.Services;

namespace MES.Api.Endpoints;

public static class EmployeeEndpoints
{
    private static readonly AuditEndpointFilter Audit = new("employee");

    public static RouteGroupBuilder MapEmployeeEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/team/{team}", GetByTeamAsync).WithTags("人员管理");
        group.MapGet("/{id}", GetByIdAsync).WithTags("人员管理");
        group.MapGet("/", GetAllAsync).WithTags("人员管理");
        group.MapPost("/", CreateAsync).WithTags("人员管理").AddEndpointFilter<ValidationEndpointFilter>().AddEndpointFilter(Audit);
        group.MapPut("/{id}", UpdateAsync).WithTags("人员管理").AddEndpointFilter<ValidationEndpointFilter>().AddEndpointFilter(Audit);
        group.MapPost("/{id}/deactivate", DeactivateAsync).WithTags("人员管理").AddEndpointFilter(Audit);
        return group;
    }

    private static async Task<IResult> GetAllAsync([AsParameters] PageQueryParameters parameters, IEmployeeAppService employeeService, CancellationToken ct)
    {
        var result = await employeeService.GetAllAsync(parameters.Page, parameters.PageSize, ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> GetByIdAsync(string id, IEmployeeAppService employeeService, CancellationToken ct)
    {
        var emp = await employeeService.GetByIdAsync(id, ct);
        if (emp is null)
            return TypedResults.NotFound(new { message = $"员工 {id} 不存在" });
        return TypedResults.Ok(emp);
    }

    private static async Task<IResult> GetByTeamAsync(string team, IEmployeeAppService employeeService, CancellationToken ct)
    {
        var result = await employeeService.GetByTeamAsync(team, ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> CreateAsync(
        CreateEmployeeRequest request,
        IEmployeeAppService employeeService,
        CancellationToken ct)
    {
        var emp = await employeeService.CreateAsync(request, ct);
        return TypedResults.Created($"/api/v1/employee/{emp.Id}", emp);
    }

    private static async Task<IResult> UpdateAsync(
        string id,
        UpdateEmployeeRequest request,
        IEmployeeAppService employeeService,
        CancellationToken ct)
    {
        var emp = await employeeService.UpdateAsync(id, request, ct);
        return TypedResults.Ok(emp);
    }

    private static async Task<IResult> DeactivateAsync(
        string id,
        IEmployeeAppService employeeService,
        CancellationToken ct)
    {
        await employeeService.DeactivateAsync(id, ct);
        return TypedResults.Ok();
    }
}
