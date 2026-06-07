using System.Text.Json;
using MES.Api.Filters;
using MES.Api.Hubs;
using MES.Application.DTOs;
using MES.Application.Services;
using MES.Domain.Interfaces.Services;

namespace MES.Api.Endpoints;

public static class AnomalyEndpoints
{
    public static RouteGroupBuilder MapAnomalyEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/critical", GetCriticalAsync).WithTags("异常管理");
        group.MapGet("/by-workorder/{workOrderNumber}", GetByWorkOrderAsync).WithTags("异常管理");
        group.MapGet("/{id}", GetByIdAsync).WithTags("异常管理");
        group.MapGet("/", GetAllAsync).WithTags("异常管理");
        group.MapPost("/", CreateAsync).WithTags("异常管理").AddEndpointFilter<ValidationEndpointFilter>();
        group.MapPost("/{id}/analyze", AnalyzeAsync).WithTags("异常管理");
        group.MapPost("/{id}/responses", AddResponseAsync).WithTags("异常管理").AddEndpointFilter<ValidationEndpointFilter>();
        group.MapPost("/{id}/resolve", ResolveAsync).WithTags("异常管理").AddEndpointFilter<ValidationEndpointFilter>();
        return group;
    }

    private static string GetUserId(HttpContext http) =>
        http.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
        ?? http.User.Identity?.Name ?? "unknown";

    private static string GetIpAddress(HttpContext http) =>
        http.Connection.RemoteIpAddress?.ToString() ?? "";

    private static string GetUserAgent(HttpContext http) =>
        http.Request.Headers.UserAgent.ToString();

    private static async Task<IResult> GetAllAsync(
        [AsParameters] PageQueryParameters parameters,
        IAnomalyAppService anomalyService,
        CancellationToken ct)
    {
        var anomalies = await anomalyService.GetOpenAnomaliesAsync(parameters.Page, parameters.PageSize, ct);
        return TypedResults.Ok(anomalies);
    }

    private static async Task<IResult> GetCriticalAsync(
        IAnomalyAppService anomalyService,
        CancellationToken ct)
    {
        var anomalies = await anomalyService.GetCriticalOpenAsync(ct);
        return TypedResults.Ok(anomalies);
    }

    private static async Task<IResult> GetByWorkOrderAsync(
        string workOrderNumber,
        IAnomalyAppService anomalyService,
        CancellationToken ct)
    {
        var anomalies = await anomalyService.GetByWorkOrderAsync(workOrderNumber, ct);
        return TypedResults.Ok(anomalies);
    }

    private static async Task<IResult> GetByIdAsync(
        string id,
        IAnomalyAppService anomalyService,
        CancellationToken ct)
    {
        var anomaly = await anomalyService.GetAnomalyByIdAsync(id, ct);
        if (anomaly is null)
            return TypedResults.NotFound(new { message = $"异常 {id} 不存在" });
        return TypedResults.Ok(anomaly);
    }

    private static async Task<IResult> CreateAsync(
        CreateAnomalyRequest request,
        HttpContext httpContext,
        IAnomalyAppService anomalyService,
        IAuditLogAppService auditLog,
        INotificationService notification,
        IUnitOfWork unitOfWork,
        CancellationToken ct)
    {
        var anomaly = await unitOfWork.ExecuteAsync(async innerCt =>
        {
            var created = await anomalyService.CreateAnomalyAsync(request, innerCt);

            await auditLog.WriteAuditLogAsync(
                userId: GetUserId(httpContext),
                action: "CREATE",
                resource: "Anomaly",
                resourceId: created.Id,
                oldValues: null,
                newValues: JsonSerializer.Serialize(new
                {
                    request.WorkOrderNumber,
                    request.AnomalyType,
                    request.Severity,
                    request.Title
                }),
                ipAddress: GetIpAddress(httpContext),
                userAgent: GetUserAgent(httpContext),
                ct: innerCt);

            await notification.NotifyAnomaly(
                request.WorkOrderNumber,
                $"[{request.Severity}] {request.Title}",
                request.Severity);

            return created;
        }, ct);

        return TypedResults.Created($"/api/v1/anomaly/{anomaly.Id}", anomaly);
    }

    private static async Task<IResult> AnalyzeAsync(
        string id,
        IAnomalyAppService anomalyService,
        CancellationToken ct)
    {
        var result = await anomalyService.AnalyzeAnomalyAsync(id, ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> AddResponseAsync(
        string id,
        AddAnomalyResponseRequest request,
        HttpContext httpContext,
        IAnomalyAppService anomalyService,
        IAuditLogAppService auditLog,
        CancellationToken ct)
    {
        var response = await anomalyService.AddResponseAsync(id, request, ct);

        await auditLog.WriteAuditLogAsync(
            userId: GetUserId(httpContext),
            action: "UPDATE",
            resource: "Anomaly",
            resourceId: id,
            oldValues: null,
            newValues: JsonSerializer.Serialize(new
            {
                responseType = request.ResponseType,
                description = request.Description,
            }),
            ipAddress: GetIpAddress(httpContext),
            userAgent: GetUserAgent(httpContext),
            ct: ct);

        return TypedResults.Ok(response);
    }

    private static async Task<IResult> ResolveAsync(
        string id,
        ResolveAnomalyRequest request,
        HttpContext httpContext,
        IAnomalyAppService anomalyService,
        IAuditLogAppService auditLog,
        CancellationToken ct)
    {
        var anomaly = await anomalyService.ResolveAnomalyAsync(id, request, ct);

        await auditLog.WriteAuditLogAsync(
            userId: GetUserId(httpContext),
            action: "RESOLVE",
            resource: "Anomaly",
            resourceId: id,
            oldValues: null,
            newValues: JsonSerializer.Serialize(new
            {
                request.RootCause,
                request.Resolution,
            }),
            ipAddress: GetIpAddress(httpContext),
            userAgent: GetUserAgent(httpContext),
            ct: ct);

        return TypedResults.Ok(anomaly);
    }
}
