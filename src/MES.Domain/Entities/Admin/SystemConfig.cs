namespace MES.Domain.Entities.Admin;

public class SystemConfig
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string ConfigKey { get; set; } = string.Empty;
    public string ConfigValue { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Category { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public string? UpdatedBy { get; set; }
}
