using System.Diagnostics;

namespace MES.Api.Middleware;

/// <summary>
/// 请求日志中间件
/// </summary>
public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();

        // 记录请求信息
        var requestMethod = context.Request.Method;
        var requestPath = context.Request.Path;
        var requestId = Guid.NewGuid().ToString("N")[..8];

        _logger.LogInformation(
            "[{RequestId}] HTTP {Method} {Path} started",
            requestId, requestMethod, requestPath);

        try
        {
            await _next(context);
        }
        finally
        {
            stopwatch.Stop();

            var statusCode = context.Response.StatusCode;
            var logLevel = statusCode >= 400 ? LogLevel.Warning : LogLevel.Information;

            _logger.Log(logLevel,
                "[{RequestId}] HTTP {Method} {Path} completed with {StatusCode} in {ElapsedMilliseconds}ms",
                requestId, requestMethod, requestPath, statusCode, stopwatch.ElapsedMilliseconds);
        }
    }
}
