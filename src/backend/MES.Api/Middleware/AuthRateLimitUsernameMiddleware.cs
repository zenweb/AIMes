using MES.Application.DTOs;

namespace MES.Api.Middleware;

public sealed class AuthRateLimitUsernameMiddleware
{
    public const string UsernameItemKey = "AIMes.AuthRateLimit.Username";

    private readonly RequestDelegate _next;

    public AuthRateLimitUsernameMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (IsAuthPost(context.Request))
        {
            context.Items[UsernameItemKey] = await ReadUsernameAsync(context);
        }

        await _next(context);
    }

    private static bool IsAuthPost(HttpRequest request)
    {
        return HttpMethods.IsPost(request.Method)
            && (request.Path.StartsWithSegments("/api/v1/auth/login")
                || request.Path.StartsWithSegments("/api/v1/auth/change-password"));
    }

    private static async Task<string?> ReadUsernameAsync(HttpContext context)
    {
        context.Request.EnableBuffering();
        try
        {
            var request = await context.Request.ReadFromJsonAsync<LoginRequestDto>(cancellationToken: context.RequestAborted);
            return request?.Username;
        }
        catch
        {
            return null;
        }
        finally
        {
            context.Request.Body.Position = 0;
        }
    }
}
