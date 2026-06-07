using MES.AI.Pro.Configuration;
using MES.Domain.Interfaces.Services;
using Microsoft.Extensions.Options;

namespace MES.Api.Endpoints;

public static class LlmEndpoints
{
    public static RouteGroupBuilder MapLlmEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/status", GetStatusAsync).WithTags("AI服务");
        group.MapGet("/config", GetConfigAsync).WithTags("AI服务").RequireAuthorization();
        return group;
    }

    private static async Task<IResult> GetStatusAsync(ILlmGateway llmGateway, CancellationToken ct)
    {
        var status = await llmGateway.GetStatusAsync(ct);
        return TypedResults.Ok(status);
    }

    private static IResult GetConfigAsync(IOptions<LlmConfig> options)
    {
        var config = options.Value;
        return TypedResults.Ok(new
        {
            config.Provider,
            Ollama = new
            {
                config.Ollama.BaseUrl,
                config.Ollama.Model,
            },
            AzureOpenAI = new
            {
                config.AzureOpenAI.Endpoint,
                config.AzureOpenAI.DeploymentName,
            },
            OpenAI = new
            {
                config.OpenAI.ModelId,
            },
        });
    }
}
