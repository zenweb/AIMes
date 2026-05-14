using MES.Api.Filters;
using MES.Api.Services;
using MES.Application.DTOs;
using MES.Application.Services;

namespace MES.Api.Endpoints;

public static class AdminEndpoints
{
    public static RouteGroupBuilder MapAdminEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/users", GetUsersAsync).WithTags("系统管理");
        group.MapPost("/users", CreateUserAsync).WithTags("系统管理").AddEndpointFilter<ValidationEndpointFilter>();
        group.MapPut("/users/{id}", UpdateUserAsync).WithTags("系统管理").AddEndpointFilter<ValidationEndpointFilter>();
        group.MapGet("/configs", GetConfigsAsync).WithTags("系统管理");
        group.MapPut("/configs/{id}", UpdateConfigAsync).WithTags("系统管理").AddEndpointFilter<ValidationEndpointFilter>();
        group.MapGet("/notifications", GetNotificationConfigsAsync).WithTags("系统管理");
        group.MapPut("/notifications/{id}", UpdateNotificationConfigAsync).WithTags("系统管理").AddEndpointFilter<ValidationEndpointFilter>();
        return group;
    }

    private static async Task<IResult> GetUsersAsync([AsParameters] PageQueryParameters parameters, IAdminAppService adminService, CancellationToken ct)
    {
        var users = await adminService.GetAllUsersAsync(parameters.Page, parameters.PageSize, ct);
        return TypedResults.Ok(users);
    }

    private static async Task<IResult> CreateUserAsync(
        CreateUserRequest request,
        IAdminAppService adminService,
        PasswordHasher passwordHasher,
        CancellationToken ct)
    {
        var passwordHash = passwordHasher.Hash(request.Password ?? throw new InvalidOperationException("密码不能为空"));
        var user = await adminService.CreateUserAsync(request, passwordHash, ct);
        return TypedResults.Created($"/api/v1/admin/users/{user.Id}", user);
    }

    private static async Task<IResult> UpdateUserAsync(
        string id,
        UpdateUserRequest request,
        IAdminAppService adminService,
        CancellationToken ct)
    {
        var user = await adminService.UpdateUserAsync(id, request, ct);
        return TypedResults.Ok(user);
    }

    private static async Task<IResult> GetConfigsAsync(IAdminAppService adminService, CancellationToken ct)
    {
        var configs = await adminService.GetAllConfigsAsync(ct);
        return TypedResults.Ok(configs);
    }

    private static async Task<IResult> UpdateConfigAsync(
        string id,
        UpdateConfigRequest request,
        IAdminAppService adminService,
        CancellationToken ct)
    {
        var config = await adminService.UpdateConfigAsync(id, request, ct);
        return TypedResults.Ok(config);
    }

    private static async Task<IResult> GetNotificationConfigsAsync(IAdminAppService adminService, CancellationToken ct)
    {
        var configs = await adminService.GetNotificationConfigsAsync(ct);
        return TypedResults.Ok(configs);
    }

    private static async Task<IResult> UpdateNotificationConfigAsync(
        string id,
        UpdateNotificationConfigRequest request,
        IAdminAppService adminService,
        CancellationToken ct)
    {
        var config = await adminService.UpdateNotificationConfigAsync(id, request, ct);
        return TypedResults.Ok(config);
    }
}
