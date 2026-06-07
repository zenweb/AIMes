using System.ComponentModel.DataAnnotations;

namespace MES.AI.Pro.Configuration;

public class LlmConfig
{
    [Required(ErrorMessage = "LLM Provider is required (AzureOpenAI, OpenAI, Ollama)")]
    public string Provider { get; set; } = "AzureOpenAI";

    [Range(1, 32)]
    public int MaxConcurrency { get; set; } = 2;

    [Required]
    public AzureOpenAIConfig AzureOpenAI { get; set; } = new();

    [Required]
    public OpenAIConfig OpenAI { get; set; } = new();

    [Required]
    public OllamaConfig Ollama { get; set; } = new();
}

public class AzureOpenAIConfig
{
    public string DeploymentName { get; set; } = string.Empty;

    [Url]
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
    [Url]
    public string BaseUrl { get; set; } = "http://localhost:11434";

    public string Model { get; set; } = "llama3.1";
    public string? ApiKey { get; set; }
}
