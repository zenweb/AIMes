using System.ComponentModel.DataAnnotations;

namespace MES.Application.DTOs;

public class SystemUserDto
{
    public string Id { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public bool MustChangePassword { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
}

public class SystemConfigDto
{
    public string Id { get; set; } = string.Empty;
    public string ConfigKey { get; set; } = string.Empty;
    public string ConfigValue { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Category { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
}

public class CreateUserRequest
{
    [Required] public string Username { get; set; } = string.Empty;
    [Required] public string DisplayName { get; set; } = string.Empty;
    public string? Password { get; set; }
    public string Role { get; set; } = "Operator";
}

public class UpdateUserRequest
{
    public string? DisplayName { get; set; }
    public string? Role { get; set; }
    public bool? IsActive { get; set; }
}

public class UpdateConfigRequest
{
    [Required] public string ConfigValue { get; set; } = string.Empty;
    public string? UpdatedBy { get; set; }
}

public class NotificationConfigDto
{
    public string Id { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public bool Enabled { get; set; }
    public string? Description { get; set; }
}

public class UpdateNotificationConfigRequest
{
    [Required] public bool Enabled { get; set; }
}
