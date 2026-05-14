using System.Net;
using Microsoft.AspNetCore.Mvc;

namespace MES.Api.Middleware;

/// <summary>
/// 全局异常处理中间件 — 输出 RFC 7807 ProblemDetails
/// </summary>
public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;
    private readonly IHostEnvironment _environment;

    public ExceptionMiddleware(
        RequestDelegate next,
        ILogger<ExceptionMiddleware> logger,
        IHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred during request processing");
            await HandleExceptionAsync(context, ex);
        }
    }

    private Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var problem = new ProblemDetails
        {
            Instance = context.Request.Path,
            Extensions = { ["traceId"] = context.TraceIdentifier }
        };

        switch (exception)
        {
            case ArgumentException argEx:
                problem.Type = "https://httpstatuses.io/400";
                problem.Title = "Validation Error";
                problem.Status = (int)HttpStatusCode.BadRequest;
                problem.Detail = argEx.Message;
                break;

            case InvalidOperationException invOpEx:
                problem.Type = "https://httpstatuses.io/400";
                problem.Title = "Operation Error";
                problem.Status = (int)HttpStatusCode.BadRequest;
                problem.Detail = invOpEx.Message;
                break;

            case KeyNotFoundException notFoundEx:
                problem.Type = "https://httpstatuses.io/404";
                problem.Title = "Not Found";
                problem.Status = (int)HttpStatusCode.NotFound;
                problem.Detail = notFoundEx.Message;
                break;

            case UnauthorizedAccessException:
                problem.Type = "https://httpstatuses.io/401";
                problem.Title = "Unauthorized";
                problem.Status = (int)HttpStatusCode.Unauthorized;
                problem.Detail = "Unauthorized access";
                break;

            default:
                problem.Type = "https://httpstatuses.io/500";
                problem.Title = "Internal Server Error";
                problem.Status = (int)HttpStatusCode.InternalServerError;
                problem.Detail = _environment.IsDevelopment()
                    ? exception.Message
                    : "An unexpected error occurred";

                if (_environment.IsDevelopment())
                {
                    problem.Extensions["stackTrace"] = exception.StackTrace;
                    problem.Extensions["innerException"] = exception.InnerException?.Message;
                }
                break;
        }

        context.Response.StatusCode = problem.Status!.Value;
        context.Response.ContentType = "application/problem+json";

        return context.Response.WriteAsJsonAsync(problem);
    }
}
