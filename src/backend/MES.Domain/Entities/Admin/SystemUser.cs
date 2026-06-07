using MES.Domain.Exceptions;

namespace MES.Domain.Entities.Admin;

public class SystemUser
{
    internal SystemUser() { }

    public string Id { get; private set; } = Guid.NewGuid().ToString();
    public string Username { get; private set; } = string.Empty;
    public string DisplayName { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public string Role { get; private set; } = "Operator";
    public bool IsActive { get; private set; } = true;
    public bool MustChangePassword { get; private set; } = true;
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; private set; }

    public static SystemUser Create(string username, string displayName, string passwordHash, string role,
        string? id = null, DateTime? createdAt = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(username);
        ArgumentException.ThrowIfNullOrWhiteSpace(displayName);
        if (role is not ("Admin" or "Engineer" or "Lead" or "Operator" or "QC"))
            throw new ArgumentException($"不支持的角色: {role}", nameof(role));

        return new SystemUser
        {
            Id = id ?? Guid.NewGuid().ToString(),
            Username = username,
            DisplayName = displayName,
            PasswordHash = passwordHash,
            Role = role,
            MustChangePassword = true,
            CreatedAt = createdAt ?? DateTime.UtcNow,
        };
    }

    public bool CanLogin => IsActive;

    public void RecordLogin()
    {
        LastLoginAt = DateTime.UtcNow;
    }

    public void Activate()
    {
        IsActive = true;
    }

    public void Deactivate()
    {
        if (!IsActive)
            throw new DomainRuleViolationException("用户已处于禁用状态");
        IsActive = false;
    }

    public void ChangeRole(string newRole)
    {
        if (newRole is not ("Admin" or "Engineer" or "Lead" or "Operator" or "QC"))
            throw new ArgumentException($"不支持的角色: {newRole}", nameof(newRole));
        Role = newRole;
    }

    public void UpdateProfile(string displayName)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(displayName);
        DisplayName = displayName;
    }

    public void ChangePassword(string newPasswordHash)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(newPasswordHash);
        PasswordHash = newPasswordHash;
        MustChangePassword = false;
    }
}
