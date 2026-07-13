using MES.Application.DTOs;
using MES.Application.Services;

namespace MES.Api.Endpoints;

public static class AuditLogEndpoints
{
    public static RouteGroupBuilder MapAuditLogEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/", GetAuditLogsAsync).WithTags("审计日志");
        group.MapGet("/{id}", GetAuditLogByIdAsync).WithTags("审计日志");
        return group;
    }

    private static async Task<IResult> GetAuditLogsAsync(
        string? action,
        string? traceId,
        IAuditLogAppService auditLogService,
        CancellationToken ct,
        int page = 1,
        int pageSize = 20)
    {
        if (page < 1 || pageSize is < 1 or > 200)
            return TypedResults.BadRequest(new { message = "page 必须大于等于 1，pageSize 必须在 1 到 200 之间" });

        var result = await auditLogService.GetAuditLogsAsync(action, traceId, page, pageSize, ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> GetAuditLogByIdAsync(
        string id,
        IAuditLogAppService auditLogService,
        CancellationToken ct)
    {
        var log = await auditLogService.GetAuditLogByIdAsync(id, ct);
        if (log is null)
            return TypedResults.NotFound(new { message = $"审计日志 {id} 不存在" });
        return TypedResults.Ok(log);
    }
}
