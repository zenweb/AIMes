namespace MES.AI.Configuration;

/// <summary>
/// 向量模型配置
/// </summary>
public class EmbeddingConfig
{
    public string Provider { get; set; } = "AzureOpenAI";
    public string DeploymentName { get; set; } = "text-embedding-3-small";
    public int Dimensions { get; set; } = 1536;
}