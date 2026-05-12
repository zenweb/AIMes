using System.ComponentModel.DataAnnotations;

namespace MES.Application.DTOs;

/// <summary>
/// 知识库问答请求DTO
/// </summary>
public class KnowledgeQueryRequest
{
    [Required(ErrorMessage = "问题不能为空")]
    public string Question { get; set; } = string.Empty;

    public string? SessionId { get; set; }
    public int TopK { get; set; } = 5;
}

/// <summary>
/// 知识库问答响应DTO
/// </summary>
public class KnowledgeQueryResponse
{
    public string Answer { get; set; } = string.Empty;
    public string SessionId { get; set; } = string.Empty;
    public List<KnowledgeSourceDto> Sources { get; set; } = new();
    public double Confidence { get; set; }
    public DateTime Timestamp { get; set; }
}

/// <summary>
/// 知识来源DTO
/// </summary>
public class KnowledgeSourceDto
{
    public string SourceId { get; set; } = string.Empty;
    public string SourceName { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public double RelevanceScore { get; set; }
}

/// <summary>
/// 文档上传请求DTO
/// </summary>
public class DocumentUploadRequest
{
    [Required(ErrorMessage = "文档名称不能为空")]
    public string FileName { get; set; } = string.Empty;

    [Required(ErrorMessage = "文档内容不能为空")]
    public string ContentType { get; set; } = string.Empty;

    public string? Category { get; set; }
    public Dictionary<string, string>? Metadata { get; set; }
}

/// <summary>
/// 文档上传响应DTO
/// </summary>
public class DocumentUploadResponse
{
    public string DocumentId { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public int ChunkCount { get; set; }
    public DateTime UploadedAt { get; set; }
    public string Status { get; set; } = string.Empty;
}

/// <summary>
/// 聊天历史请求DTO
/// </summary>
public class ChatHistoryRequest
{
    public string SessionId { get; set; } = string.Empty;
    public int MaxMessages { get; set; } = 20;
}

/// <summary>
/// 聊天历史响应DTO
/// </summary>
public class ChatHistoryResponse
{
    public string SessionId { get; set; } = string.Empty;
    public List<ChatMessageDto> Messages { get; set; } = new();
    public int TotalCount { get; set; }
}

public class ChatMessageDto
{
    public string Role { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public List<string> SourceIds { get; set; } = new();
}
