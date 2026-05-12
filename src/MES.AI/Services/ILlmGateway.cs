namespace MES.AI.Pro.Services;

/// <summary>
/// LLM网关接口
/// </summary>
public interface ILlmGateway
{
    Task<string> GenerateTextAsync(string prompt, CancellationToken ct = default);
    Task<string> GenerateTextAsync(string systemPrompt, string userPrompt, CancellationToken ct = default);
    Task<T> GenerateJsonAsync<T>(string prompt, CancellationToken ct = default) where T : class;
    Task<float[]> GenerateEmbeddingAsync(string text, CancellationToken ct = default);
}