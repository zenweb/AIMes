using MES.Domain.Interfaces.Repositories;

namespace MES.Api.Services;

public interface IAuthService
{
    Task<(bool Success, string? Role, string? DisplayName, bool MustChangePassword)> ValidateAsync(string username, string password, CancellationToken ct = default);
    Task<bool> ChangePasswordAsync(string username, string currentPassword, string newPassword, CancellationToken ct = default);
    Task RecordLoginAsync(string username, CancellationToken ct = default);
}

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepo;
    private readonly PasswordHasher _passwordHasher;

    public AuthService(IUserRepository userRepo, PasswordHasher passwordHasher)
    {
        _userRepo = userRepo;
        _passwordHasher = passwordHasher;
    }

    public async Task<(bool Success, string? Role, string? DisplayName, bool MustChangePassword)> ValidateAsync(
        string username, string password, CancellationToken ct = default)
    {
        var user = await _userRepo.GetByUsernameAsync(username, ct);
        if (user is null || !user.IsActive)
            return (false, null, null, false);

        if (!_passwordHasher.Verify(password, user.PasswordHash))
            return (false, null, null, false);

        return (true, user.Role, user.DisplayName, user.MustChangePassword);
    }

    public async Task<bool> ChangePasswordAsync(
        string username, string currentPassword, string newPassword, CancellationToken ct = default)
    {
        var user = await _userRepo.GetByUsernameAsync(username, ct);
        if (user is null || !user.IsActive)
            return false;

        if (!_passwordHasher.Verify(currentPassword, user.PasswordHash))
            return false;

        user.ChangePassword(_passwordHasher.Hash(newPassword));
        await _userRepo.UpdateAsync(user, ct);
        return true;
    }

    public async Task RecordLoginAsync(string username, CancellationToken ct = default)
    {
        var user = await _userRepo.GetByUsernameAsync(username, ct);
        if (user is not null)
        {
            user.RecordLogin();
            await _userRepo.UpdateAsync(user, ct);
        }
    }
}
