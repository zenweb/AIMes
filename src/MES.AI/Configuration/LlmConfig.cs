namespace MES.AI.Pro.Configuration;

/// <summary>
/// LLM配置
/// </summary>
public class LlmConfig
{
    public string Provider { get; set; } = "AzureOpenAI"; // AzureOpenAI, OpenAI, Ollama

    public AzureOpenAIConfig AzureOpenAI { get; set; } = new();
    public OpenAIConfig OpenAI { get; set; } = new();
    public OllamaConfig Ollama { get; set; } = new();
}

public class AzureOpenAIConfig
{
    public string DeploymentName { get; set; } = string.Empty;
    public string Endpoint { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string ApiVersion { get; set; } = "2024-02-15-preview";
}

public class OpenAIConfig
{
    public string ModelId { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
}

public class OllamaConfig
{
    public string BaseUrl { get; set; } = "http://localhost:11434";
    public string Model { get; set; } = "llama3.1";
    public string? ApiKey { get; set; }
}