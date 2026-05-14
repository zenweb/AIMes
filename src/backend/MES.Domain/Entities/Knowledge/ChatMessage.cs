namespace MES.Domain.Entities.Knowledge;

/// <summary>
/// 聊天消息
/// </summary>
public class ChatMessage
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string SessionId { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty; // user, assistant
    public string Content { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public List<string> SourceDocumentIds { get; set; } = new();
}
