using MES.AI.Services;
using MES.Domain.ValueObjects;

namespace MES.Api.Middleware;

/// <summary>
/// AI决策Trace强制校验中间件。
/// 对 /api/v1/scheduling/, /api/v1/quality/, /api/v1/knowledge/ 等AI相关端点的响应
/// 校验 AiDecisionTrace 是否完整。缺失 Trace 的AI响应将返回 500。
/// </summary>
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
        await _next(context);

        // 只对成功响应校验，避免重复报错
        if (context.Response.StatusCode < 200 || context.Response.StatusCode >= 300) return;

        var path = context.Request.Path.Value?.ToLowerInvariant() ?? string.Empty;
        var isAiEndpoint = AiPathSegments.Any(s => path.Contains($"/{s}/"));

        if (!isAiEndpoint) return;

        var validator = context.RequestServices.GetService<ITraceValidator>();
        if (validator == null) return;

        // 尝试从 Items 中读取 Trace（由 Agent 在调用后写入 HttpContext.Items）
        if (context.Items.TryGetValue("AiDecisionTrace", out var traceObj) && traceObj is AiDecisionTrace trace)
        {
            var (isValid, errors) = validator.Validate(trace);
            if (!isValid)
            {
                context.Response.StatusCode = 500;
                context.Response.ContentType = "application/json";
                var errorMsg = System.Text.Json.JsonSerializer.Serialize(new
                {
                    error = "AI_DECISION_TRACE_INCOMPLETE",
                    details = errors
                });
                await context.Response.WriteAsync(errorMsg);
            }
        }
    }
}
