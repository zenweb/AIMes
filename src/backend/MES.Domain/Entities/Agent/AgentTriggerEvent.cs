namespace MES.Domain.Entities.Agent;

public class AgentTriggerEvent
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string EventType { get; set; } = string.Empty;
    public string SourceModule { get; set; } = string.Empty;
    public string BusinessKeyType { get; set; } = string.Empty;
    public string BusinessKeyValue { get; set; } = string.Empty;
    public string Severity { get; set; } = "Info";
    public string PayloadJson { get; set; } = "{}";
    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
