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

        var initiatedBy = context.HttpContext.Request.Headers.TryGetValue("X-Initiated-By", out var initiatedByHeader)
            && Enum.TryParse<AuditInitiatedBy>(initiatedByHeader.ToString(), ignoreCase: true, out var parsed)
            ? parsed
            : AuditInitiatedBy.User;

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
                innerCt),
            context.HttpContext.RequestAborted);

        return result;
    }

    private static bool IsAuditableMethod(string method) => method switch
    {
        "POST" or "PUT" or "PATCH" or "DELETE" => true,
        _ => false
    };
}
