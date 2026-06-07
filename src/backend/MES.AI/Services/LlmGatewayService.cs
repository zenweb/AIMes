using System.ClientModel.Primitives;
using MES.AI.Pro.Configuration;
using MES.Domain.Interfaces.Services;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Options;
using Microsoft.SemanticKernel;
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
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILlmConcurrencyGate _concurrencyGate;
    private readonly IEmbeddingGenerator<string, Embedding<float>>? _embeddingGenerator;

    public LlmGatewayService(
        IOptions<LlmConfig> config,
        IHttpClientFactory httpClientFactory,
        ILlmConcurrencyGate concurrencyGate)
    {
        _config = config.Value;
        _httpClientFactory = httpClientFactory;
        _concurrencyGate = concurrencyGate;
        _kernel = BuildKernel();
        _embeddingGenerator = _kernel.Services.GetService(typeof(IEmbeddingGenerator<string, Embedding<float>>))
            as IEmbeddingGenerator<string, Embedding<float>>;
    }

    private Kernel BuildKernel()
    {
        var builder = Kernel.CreateBuilder();
        var httpClient = _httpClientFactory.CreateClient(_config.Provider switch
        {
            "AzureOpenAI" => "azure-openai",
            "OpenAI" => "openai",
            "Ollama" => "ollama",
            _ => "ollama"
        });

        switch (_config.Provider)
        {
            case "AzureOpenAI":
                builder.AddAzureOpenAIChatCompletion(
                    _config.AzureOpenAI.DeploymentName,
                    _config.AzureOpenAI.Endpoint,
                    _config.AzureOpenAI.ApiKey,
                    apiVersion: _config.AzureOpenAI.ApiVersion,
                    httpClient: httpClient);
                builder.AddAzureOpenAIEmbeddingGenerator(
                    deploymentName: _config.AzureOpenAI.DeploymentName,
                    endpoint: _config.AzureOpenAI.Endpoint,
                    apiKey: _config.AzureOpenAI.ApiKey,
                    apiVersion: _config.AzureOpenAI.ApiVersion,
                    httpClient: httpClient);
                break;

            case "OpenAI":
                builder.AddOpenAIChatCompletion(
                    _config.OpenAI.ModelId,
                    _config.OpenAI.ApiKey,
                    httpClient: httpClient);
                builder.AddOpenAIEmbeddingGenerator(
                    modelId: "text-embedding-3-small",
                    apiKey: _config.OpenAI.ApiKey,
                    httpClient: httpClient);
                break;

            case "Ollama":
                // For Ollama, use OpenAI client with custom base URL
                builder.AddOpenAIChatCompletion(
                    modelId: _config.Ollama.Model,
                    openAIClient: CreateOpenAIClient(
                        _config.Ollama.ApiKey ?? "not-required",
                        _config.Ollama.BaseUrl,
                        httpClient));
                break;

            default:
                throw new NotSupportedException($"LLM provider '{_config.Provider}' is not supported");
        }

        return builder.Build();
    }

    private static OpenAIClient CreateOpenAIClient(string apiKey, string endpoint, HttpClient httpClient)
    {
        return new OpenAIClient(
            new System.ClientModel.ApiKeyCredential(apiKey),
            new OpenAIClientOptions
            {
                Endpoint = new Uri(endpoint),
                Transport = new HttpClientPipelineTransport(httpClient)
            });
    }

    public async Task<string> GenerateTextAsync(string prompt, CancellationToken ct = default)
    {
        return await _concurrencyGate.RunAsync(async innerCt =>
        {
            var result = await _kernel.InvokePromptAsync<string>(prompt, cancellationToken: innerCt);
            return result ?? string.Empty;
        }, ct);
    }

    public async Task<string> GenerateTextAsync(string systemPrompt, string userPrompt, CancellationToken ct = default)
    {
        var prompt = $"{systemPrompt}\n\nUser: {userPrompt}";
        return await GenerateTextAsync(prompt, ct);
    }

    public async Task<T> GenerateJsonAsync<T>(string prompt, CancellationToken ct = default) where T : class
    {
        return await _concurrencyGate.RunAsync(async innerCt =>
        {
            var result = await _kernel.InvokePromptAsync<T>(prompt, cancellationToken: innerCt);
            return result ?? throw new InvalidOperationException("Failed to generate JSON response");
        }, ct);
    }

    public async Task<float[]> GenerateEmbeddingAsync(string text, CancellationToken ct = default)
    {
        if (_embeddingGenerator == null)
        {
            throw new InvalidOperationException("Embedding service is not configured");
        }

        return await _concurrencyGate.RunAsync(async innerCt =>
        {
            var embedding = await _embeddingGenerator.GenerateVectorAsync(text, cancellationToken: innerCt);
            return embedding.ToArray();
        }, ct);
    }

    public async Task<LlmStatusDto> GetStatusAsync(CancellationToken ct = default)
    {
        var status = new LlmStatusDto
        {
            Provider = _config.Provider,
            Model = _config.Provider switch
            {
                "AzureOpenAI" => _config.AzureOpenAI.DeploymentName,
                "OpenAI" => _config.OpenAI.ModelId,
                "Ollama" => _config.Ollama.Model,
                _ => "unknown",
            },
        };

        try
        {
            if (_config.Provider == "Ollama")
            {
                // Ping Ollama's /api/tags endpoint to check reachability
                var httpClient = _httpClientFactory.CreateClient("ollama");
                var baseUrl = await TryGetOllamaTags(httpClient, ct);

                if (baseUrl != null)
                {
                    status.Reachable = true;
                    status.Version = baseUrl;
                }
                else
                {
                    status.Reachable = false;
                    status.Error = "Ollama 服务未响应，请确认 Ollama 已启动 (ollama serve)";
                }
            }
            else
            {
                // For cloud providers, just report configured
                status.Reachable = true;
                status.Version = "configured";
            }
        }
        catch (Exception ex)
        {
            status.Reachable = false;
            status.Error = ex.Message;
        }

        return status;
    }

    private static async Task<string?> TryGetOllamaTags(HttpClient httpClient, CancellationToken ct)
    {
        // Try common Ollama endpoints: localhost:11434 and host.docker.internal:11434
        var urls = new[] { "http://localhost:11434", "http://host.docker.internal:11434" };
        foreach (var url in urls)
        {
            try
            {
                var response = await httpClient.GetAsync($"{url}/api/tags", ct);
                if (response.IsSuccessStatusCode)
                {
                    return url;
                }
            }
            catch
            {
                // Try next URL
            }
        }
        return null;
    }
}
