namespace MES.Domain.Interfaces.Services;

public class LlmStatusDto
{
    public string Provider { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public bool Reachable { get; set; }
    public string? Version { get; set; }
    public string? Error { get; set; }
}

public interface ILlmGateway
{
    Task<string> GenerateTextAsync(string prompt, CancellationToken ct = default);
    Task<string> GenerateTextAsync(string systemPrompt, string userPrompt, CancellationToken ct = default);
    Task<T> GenerateJsonAsync<T>(string prompt, CancellationToken ct = default) where T : class;
    Task<float[]> GenerateEmbeddingAsync(string text, CancellationToken ct = default);
    Task<LlmStatusDto> GetStatusAsync(CancellationToken ct = default);
}
