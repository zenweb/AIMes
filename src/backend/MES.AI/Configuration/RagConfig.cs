namespace MES.AI.Pro.Configuration;

/// <summary>
/// RAG配置
/// </summary>
public class RagConfig
{
    public int ChunkSize { get; set; } = 1000;
    public int ChunkOverlap { get; set; } = 200;
    public int TopK { get; set; } = 5;
    public double SimilarityThreshold { get; set; } = 0.7;
}
