using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Quality;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Entities;
using MES.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;
using System.Text.Json;

namespace MES.Api.Filters;

[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
public class AuditAttribute : ActionFilterAttribute
{
    public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var executedContext = await next();
        var request = context.HttpContext.Request;

        if (!IsAuditableMethod(request.Method) || executedContext.Exception != null)
        {
            return;
        }

        var dbContext = context.HttpContext.RequestServices.GetRequiredService<MesDbContext>();
        var routeValues = context.RouteData.Values;
        var controller = routeValues.TryGetValue("controller", out var controllerValue) ? controllerValue?.ToString() : null;
        var action = routeValues.TryGetValue("action", out var actionValue) ? actionValue?.ToString() : null;
        var resourceId = routeValues.TryGetValue("id", out var idValue) ? idValue?.ToString() : null;
        var newValues = JsonSerializer.Serialize(context.ActionArguments.Where(argument => argument.Value is not CancellationToken));

        dbContext.AuditLogs.Add(new AuditLog
        {
            UserId = context.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? context.HttpContext.User.FindFirstValue("sub")
                ?? "anonymous",
            Action = action ?? request.Method,
            Resource = controller ?? request.Path.Value ?? string.Empty,
            ResourceId = resourceId,
            NewValues = newValues,
            IpAddress = context.HttpContext.Connection.RemoteIpAddress?.ToString(),
            UserAgent = request.Headers.UserAgent.ToString(),
            CreatedAt = DateTime.UtcNow
        });

        await dbContext.SaveChangesAsync(context.HttpContext.RequestAborted);
    }

    private static bool IsAuditableMethod(string method)
    {
        return HttpMethods.IsPost(method)
            || HttpMethods.IsPut(method)
            || HttpMethods.IsPatch(method)
            || HttpMethods.IsDelete(method);
    }
}
