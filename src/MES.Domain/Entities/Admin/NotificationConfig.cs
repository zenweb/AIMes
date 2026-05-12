namespace MES.Domain.Entities.Admin;

public class NotificationConfig
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Category { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public bool Enabled { get; set; } = true;
    public string? Description { get; set; }
}
