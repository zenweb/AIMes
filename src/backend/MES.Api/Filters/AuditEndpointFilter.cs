using System.Security.Claims;
using System.Text.Json;
using MES.Domain.Entities;
using MES.Infrastructure.Data;

namespace MES.Api.Filters;

public sealed class AuditEndpointFilter(string resource) : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var result = await next(context);

        var request = context.HttpContext.Request;
        if (!IsAuditableMethod(request.Method))
            return result;

        var dbContext = context.HttpContext.RequestServices.GetRequiredService<MesDbContext>();
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

        dbContext.AuditLogs.Add(new AuditLog
        {
            UserId = userId,
            Action = request.Method,
            Resource = resource,
            ResourceId = idValue?.ToString(),
            NewValues = newValues,
            IpAddress = context.HttpContext.Connection.RemoteIpAddress?.ToString(),
            UserAgent = request.Headers.UserAgent.ToString(),
            CreatedAt = DateTime.UtcNow
        });

        await dbContext.SaveChangesAsync(context.HttpContext.RequestAborted);

        return result;
    }

    private static bool IsAuditableMethod(string method) => method switch
    {
        "POST" or "PUT" or "PATCH" or "DELETE" => true,
        _ => false
    };
}
