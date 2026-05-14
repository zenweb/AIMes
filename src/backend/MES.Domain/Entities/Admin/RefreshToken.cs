namespace MES.Domain.Entities.Admin;

public class RefreshToken
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string Token { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
