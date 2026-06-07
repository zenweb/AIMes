using MES.Api.Filters;
using MES.Application.DTOs;
using MES.Application.Services;

namespace MES.Api.Endpoints;

public static class EquipmentEndpoints
{
    private static readonly AuditEndpointFilter Audit = new("equipment");

    public static RouteGroupBuilder MapEquipmentEndpoints(this RouteGroupBuilder group)
    {
        // 静态路由必须在 {id} 之前注册
        group.MapGet("/statistics", GetStatisticsAsync).WithTags("设备管理");
        group.MapGet("/bottlenecks", GetBottlenecksAsync).WithTags("设备管理");
        group.MapPost("/", CreateEquipmentAsync)
             .WithTags("设备管理")
             .AddEndpointFilter<ValidationEndpointFilter>()
             .AddEndpointFilter(Audit);
        group.MapGet("/", GetEquipmentsAsync).WithTags("设备管理");
        group.MapGet("/{id}", GetEquipmentByIdAsync).WithTags("设备管理");
        group.MapPatch("/{id}/status", UpdateStatusAsync)
             .WithTags("设备管理")
             .AddEndpointFilter<ValidationEndpointFilter>()
             .AddEndpointFilter(Audit);
        group.MapGet("/{id}/health", GetHealthReportAsync).WithTags("设备管理");
        group.MapPost("/{id}/diagnose", DiagnoseAsync).WithTags("设备管理").AddEndpointFilter(Audit);
        group.MapGet("/{id}/maintenance-history", GetMaintenanceHistoryAsync).WithTags("设备管理");
        return group;
    }

    private static async Task<IResult> CreateEquipmentAsync(
        CreateEquipmentRequest request,
        IEquipmentAppService equipmentService,
        CancellationToken ct)
    {
        var equipment = await equipmentService.CreateEquipmentAsync(request, ct);
        return TypedResults.Created($"/api/v1/equipment/{equipment.Id}", equipment);
    }

    private static async Task<IResult> GetEquipmentsAsync(
        [AsParameters] EquipmentQueryParameters parameters,
        IEquipmentAppService equipmentService,
        CancellationToken ct)
    {
        var equipments = await equipmentService.GetEquipmentsAsync(parameters.WorkshopId, parameters.Status, parameters.Page, parameters.PageSize, ct);
        return TypedResults.Ok(equipments);
    }

    private static async Task<IResult> GetEquipmentByIdAsync(
        string id,
        IEquipmentAppService equipmentService,
        CancellationToken ct)
    {
        var equipment = await equipmentService.GetEquipmentByIdAsync(id, ct);
        if (equipment is null)
            return TypedResults.NotFound(new { message = $"设备 {id} 不存在" });
        return TypedResults.Ok(equipment);
    }

    private static async Task<IResult> GetStatisticsAsync(
        string? workshopId,
        IEquipmentAppService equipmentService,
        CancellationToken ct)
    {
        var statistics = await equipmentService.GetStatisticsAsync(workshopId, ct);
        return TypedResults.Ok(statistics);
    }

    private static async Task<IResult> GetBottlenecksAsync(
        string? workshopId,
        IEquipmentAppService equipmentService,
        CancellationToken ct)
    {
        var ids = await equipmentService.GetBottleneckEquipmentIdsAsync(workshopId, ct);
        return TypedResults.Ok(ids);
    }

    private static async Task<IResult> UpdateStatusAsync(
        string id,
        UpdateEquipmentStatusRequest request,
        IEquipmentAppService equipmentService,
        CancellationToken ct)
    {
        var equipment = await equipmentService.UpdateStatusAsync(id, request.Status, ct);
        return TypedResults.Ok(equipment);
    }

    private static async Task<IResult> GetHealthReportAsync(
        string id,
        IEquipmentAppService equipmentService,
        CancellationToken ct)
    {
        var report = await equipmentService.GetHealthReportAsync(id, ct);
        return TypedResults.Ok(report);
    }

    private static async Task<IResult> DiagnoseAsync(
        string id,
        DiagnoseRequest? request,
        IEquipmentAppService equipmentService,
        CancellationToken ct)
    {
        var report = await equipmentService.DiagnoseAsync(id, request?.ErrorCode, ct);
        return TypedResults.Ok(report);
    }

    private static async Task<IResult> GetMaintenanceHistoryAsync(
        string id,
        IEquipmentAppService equipmentService,
        CancellationToken ct)
    {
        var history = await equipmentService.GetMaintenanceHistoryAsync(id, ct);
        return TypedResults.Ok(history);
    }
}
