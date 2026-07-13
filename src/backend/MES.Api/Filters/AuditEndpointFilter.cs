using System.Security.Claims;
using MES.Application.Services;
using MES.Domain.Enums;
using MES.Domain.Interfaces.Services;

namespace MES.Api.Filters;

public sealed class AuditEndpointFilter(string resource) : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var result = await next(context);

        var request = context.HttpContext.Request;
        if (!IsAuditableMethod(request.Method))
            return result;

        var auditLogService = context.HttpContext.RequestServices.GetRequiredService<IAuditLogAppService>();
        var userId = context.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? context.HttpContext.User.FindFirstValue("sub")
            ?? "anonymous";

        context.HttpContext.Request.RouteValues.TryGetValue("id", out var idValue);

        var newValuesArgs = context.Arguments
            .Where(a => a is not CancellationToken and not HttpContext
                        and not ClaimsPrincipal
                        and not IEndpointFilter
                        and not string)
            .ToList();
        var newValues = newValuesArgs.Count != 0 ? AuditRedaction.RedactAndSerialize(newValuesArgs) : null;

        // 客户端可伪造请求头；端点审计的来源只能按认证上下文视为用户操作。
        // Agent 写入由服务端受控工作流直接创建相应的 Agent 审计记录。
        var initiatedBy = AuditInitiatedBy.User;

        var unitOfWork = context.HttpContext.RequestServices.GetRequiredService<IUnitOfWork>();
        await unitOfWork.ExecuteAsync(innerCt =>
            auditLogService.WriteAuditLogAsync(
                userId,
                request.Method,
                resource,
                idValue?.ToString(),
                oldValues: null,
                newValues,
                context.HttpContext.Connection.RemoteIpAddress?.ToString(),
                request.Headers.UserAgent.ToString(),
                initiatedBy,
                ct: innerCt,
                businessKey: idValue is null ? resource : $"{resource}:{idValue}",
                traceId: context.HttpContext.TraceIdentifier),
            context.HttpContext.RequestAborted);

        return result;
    }

    private static bool IsAuditableMethod(string method) => method switch
    {
        "POST" or "PUT" or "PATCH" or "DELETE" => true,
        _ => false
    };
}
