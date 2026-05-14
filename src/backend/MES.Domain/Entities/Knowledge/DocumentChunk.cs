using System.ComponentModel.DataAnnotations.Schema;

namespace MES.Domain.Entities.Knowledge;

/// <summary>
/// 文档知识块（用于RAG）
/// </summary>
public class DocumentChunk
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Content { get; set; } = string.Empty;
    [NotMapped]
    public Dictionary<string, string> Metadata { get; set; } = new();
    [NotMapped]
    public float[] Vector { get; set; } = Array.Empty<float>();
    public string Source { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
