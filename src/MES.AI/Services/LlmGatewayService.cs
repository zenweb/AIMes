using MES.AI.Pro.Configuration;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Embeddings;
using OpenAI;

#pragma warning disable SKEXP0001 // Type is for evaluation purposes only and is subject to change or removal in future updates.
#pragma warning disable SKEXP0010 // Type is for evaluation purposes only and is subject to change or removal in future updates.

namespace MES.AI.Pro.Services;

/// <summary>
/// LLM网关服务实现
/// </summary>
public class LlmGatewayService : ILlmGateway
{
    private readonly Kernel _kernel;
    private readonly LlmConfig _config;
    private readonly ITextEmbeddingGenerationService? _embeddingService;

    public LlmGatewayService(LlmConfig config)
    {
        _config = config;
        _kernel = BuildKernel();
        _embeddingService = _kernel.Services.GetService(typeof(ITextEmbeddingGenerationService)) as ITextEmbeddingGenerationService;
    }

    private Kernel BuildKernel()
    {
        var builder = Kernel.CreateBuilder();

        switch (_config.Provider)
        {
            case "AzureOpenAI":
                builder.AddAzureOpenAIChatCompletion(
                    _config.AzureOpenAI.DeploymentName,
                    _config.AzureOpenAI.Endpoint,
                    _config.AzureOpenAI.ApiKey,
                    _config.AzureOpenAI.ApiVersion);
                builder.AddAzureOpenAITextEmbeddingGeneration(
                    _config.AzureOpenAI.DeploymentName,
                    _config.AzureOpenAI.Endpoint,
                    _config.AzureOpenAI.ApiKey);
                break;

            case "OpenAI":
                builder.AddOpenAIChatCompletion(
                    _config.OpenAI.ModelId,
                    _config.OpenAI.ApiKey);
                builder.AddOpenAITextEmbeddingGeneration(
                    "text-embedding-3-small",
                    _config.OpenAI.ApiKey);
                break;

            case "Ollama":
                // For Ollama, use OpenAI client with custom base URL
                var ollamaClient = new OpenAIClient(
                    new System.ClientModel.ApiKeyCredential(_config.Ollama.ApiKey ?? "not-required"),
                    new OpenAIClientOptions
                    {
                        Endpoint = new Uri(_config.Ollama.BaseUrl)
                    });
                builder.AddOpenAIChatCompletion(
                    modelId: _config.Ollama.Model,
                    openAIClient: ollamaClient);
                break;

            default:
                throw new NotSupportedException($"LLM provider '{_config.Provider}' is not supported");
        }

        return builder.Build();
    }

    public async Task<string> GenerateTextAsync(string prompt, CancellationToken ct = default)
    {
        var result = await _kernel.InvokePromptAsync<string>(prompt, cancellationToken: ct);
        return result ?? string.Empty;
    }

    public async Task<string> GenerateTextAsync(string systemPrompt, string userPrompt, CancellationToken ct = default)
    {
        var prompt = $"{systemPrompt}\n\nUser: {userPrompt}";
        return await GenerateTextAsync(prompt, ct);
    }

    public async Task<T> GenerateJsonAsync<T>(string prompt, CancellationToken ct = default) where T : class
    {
        var result = await _kernel.InvokePromptAsync<T>(prompt, cancellationToken: ct);
        return result ?? throw new InvalidOperationException("Failed to generate JSON response");
    }

    public async Task<float[]> GenerateEmbeddingAsync(string text, CancellationToken ct = default)
    {
        if (_embeddingService == null)
        {
            throw new InvalidOperationException("Embedding service is not configured");
        }
        var embedding = await _embeddingService.GenerateEmbeddingAsync(text, cancellationToken: ct);
        return embedding.ToArray();
    }
}
