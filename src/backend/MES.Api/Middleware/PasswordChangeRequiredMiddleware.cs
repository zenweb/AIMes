namespace MES.Api.Middleware;

public sealed class PasswordChangeRequiredMiddleware
{
    private static readonly PathString ChangePasswordPath = new("/api/v1/auth/change-password");
    private static readonly PathString LogoutPath = new("/api/v1/auth/logout");

    private readonly RequestDelegate _next;

    public PasswordChangeRequiredMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (RequiresPasswordChange(context) && !IsAllowedPath(context.Request.Path))
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsJsonAsync(new { message = "必须先修改初始密码" }, context.RequestAborted);
            return;
        }

        await _next(context);
    }

    private static bool RequiresPasswordChange(HttpContext context)
    {
        return context.User.Identity?.IsAuthenticated == true
            && string.Equals(context.User.FindFirst("must_change_password")?.Value, "true", StringComparison.OrdinalIgnoreCase);
    }

    private static bool IsAllowedPath(PathString path)
    {
        return path.StartsWithSegments(ChangePasswordPath)
            || path.StartsWithSegments(LogoutPath)
            || path.StartsWithSegments("/health");
    }
}
