using MES.Domain.Interfaces.Services;
using MES.Domain.ValueObjects;
using Microsoft.AspNetCore.Mvc;

namespace MES.Api.Middleware;

public class TraceValidationMiddleware
{
    private readonly RequestDelegate _next;

    private static readonly string[] AiPathSegments = ["scheduling", "quality", "knowledge"];

    public TraceValidationMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value?.ToLowerInvariant() ?? string.Empty;
        var isAiEndpoint = AiPathSegments.Any(s => path.Contains($"/{s}/"));

        if (!isAiEndpoint)
        {
            await _next(context);
            return;
        }

        // 缓冲响应流，允许在 _next 执行后修改状态码和响应体
        var originalBody = context.Response.Body;
        using var buffer = new MemoryStream();
        context.Response.Body = buffer;

        try
        {
            await _next(context);

            var validator = context.RequestServices.GetService<ITraceValidator>();

            if (validator != null
                && context.Response.StatusCode >= 200 && context.Response.StatusCode < 300
                && context.Items.TryGetValue("AiDecisionTrace", out var traceObj)
                && traceObj is AiDecisionTrace trace)
            {
                var (isValid, errors) = validator.Validate(trace);
                if (!isValid)
                {
                    context.Response.StatusCode = 500;
                    context.Response.ContentType = "application/problem+json";
                    var problem = new ProblemDetails
                    {
                        Type = "https://httpstatuses.io/500",
                        Title = "AI Decision Trace Incomplete",
                        Status = 500,
                        Detail = "AI decision trace validation failed",
                        Instance = context.Request.Path,
                        Extensions =
                        {
                            ["traceId"] = context.TraceIdentifier,
                            ["errorCode"] = "AI_DECISION_TRACE_INCOMPLETE",
                            ["validationErrors"] = errors,
                        }
                    };
                    await context.Response.WriteAsJsonAsync(problem);
                    return;
                }
            }

            // 校验通过，将缓冲内容写回原始流
            buffer.Seek(0, SeekOrigin.Begin);
            await buffer.CopyToAsync(originalBody);
        }
        finally
        {
            context.Response.Body = originalBody;
        }
    }
}
