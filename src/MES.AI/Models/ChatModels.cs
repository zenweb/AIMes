namespace MES.AI.Pro.Models;

/// <summary>
/// 聊天请求
/// </summary>
public class ChatRequest
{
    public string SessionId { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

/// <summary>
/// 聊天响应
/// </summary>
public class ChatResponse
{
    public string Message { get; set; } = string.Empty;
    public List<string> Sources { get; set; } = new();
}

/// <summary>
/// SPC告警
/// </summary>
public class SpcAlert
{
    public bool HasTrend { get; set; }
    public bool HasDrift { get; set; }
    public bool HasCycle { get; set; }
    public bool IsNearLimit { get; set; }
    public string TrendDirection { get; set; } = string.Empty;
    public string RecommendedAction { get; set; } = string.Empty;
}