using MES.Application.DTOs;
using MES.Domain.Entities.Admin;
using MES.Domain.Interfaces.Repositories;

namespace MES.Application.Services;

public interface IAdminAppService
{
    Task<PagedResult<SystemUserDto>> GetAllUsersAsync(int page = 1, int pageSize = 20, CancellationToken ct = default);
    Task<SystemUserDto> CreateUserAsync(CreateUserRequest request, string passwordHash, CancellationToken ct = default);
    Task<SystemUserDto> UpdateUserAsync(string id, UpdateUserRequest request, CancellationToken ct = default);
    Task<List<SystemConfigDto>> GetAllConfigsAsync(CancellationToken ct = default);
    Task<SystemConfigDto> UpdateConfigAsync(string id, UpdateConfigRequest request, CancellationToken ct = default);
    Task<List<NotificationConfigDto>> GetNotificationConfigsAsync(CancellationToken ct = default);
    Task<NotificationConfigDto> UpdateNotificationConfigAsync(string id, UpdateNotificationConfigRequest request, CancellationToken ct = default);
}

public class AdminAppService : IAdminAppService
{
    private readonly IUserRepository _userRepo;
    private readonly ISystemConfigRepository _configRepo;
    private readonly INotificationConfigRepository _notificationConfigRepo;

    public AdminAppService(IUserRepository userRepo, ISystemConfigRepository configRepo, INotificationConfigRepository notificationConfigRepo)
    {
        _userRepo = userRepo;
        _configRepo = configRepo;
        _notificationConfigRepo = notificationConfigRepo;
    }

    public async Task<PagedResult<SystemUserDto>> GetAllUsersAsync(int page = 1, int pageSize = 20, CancellationToken ct = default)
    {
        var users = await _userRepo.GetAllAsync(ct);
        var all = users.Select(u => new SystemUserDto
        {
            Id = u.Id,
            Username = u.Username,
            DisplayName = u.DisplayName,
            Role = u.Role,
            IsActive = u.IsActive,
            CreatedAt = u.CreatedAt,
            LastLoginAt = u.LastLoginAt,
        }).ToList();
        var total = all.Count;
        var items = all.Skip((page - 1) * pageSize).Take(pageSize).ToList();
        return new PagedResult<SystemUserDto>
        {
            Items = items,
            TotalCount = total,
            Page = page,
            PageSize = pageSize,
        };
    }

    public async Task<SystemUserDto> CreateUserAsync(CreateUserRequest request, string passwordHash, CancellationToken ct = default)
    {
        var user = SystemUser.Create(request.Username, request.DisplayName, passwordHash, request.Role);
        user = await _userRepo.CreateAsync(user, ct);
        return new SystemUserDto
        {
            Id = user.Id,
            Username = user.Username,
            DisplayName = user.DisplayName,
            Role = user.Role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
        };
    }

    public async Task<SystemUserDto> UpdateUserAsync(string id, UpdateUserRequest request, CancellationToken ct = default)
    {
        var users = await _userRepo.GetAllAsync(ct);
        var user = users.FirstOrDefault(u => u.Id == id)
            ?? throw new InvalidOperationException($"用户 {id} 不存在");
        if (request.DisplayName != null) user.UpdateProfile(request.DisplayName);
        if (request.Role != null) user.ChangeRole(request.Role);
        if (request.IsActive.HasValue)
        {
            if (request.IsActive.Value) user.Activate();
            else user.Deactivate();
        }
        user = await _userRepo.UpdateAsync(user, ct);
        return new SystemUserDto
        {
            Id = user.Id,
            Username = user.Username,
            DisplayName = user.DisplayName,
            Role = user.Role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt,
        };
    }

    public async Task<List<SystemConfigDto>> GetAllConfigsAsync(CancellationToken ct = default)
    {
        var configs = await _configRepo.GetAllAsync(ct);
        return configs.Select(c => new SystemConfigDto
        {
            Id = c.Id,
            ConfigKey = c.ConfigKey,
            ConfigValue = c.ConfigValue,
            Description = c.Description,
            Category = c.Category,
            UpdatedAt = c.UpdatedAt,
            UpdatedBy = c.UpdatedBy,
        }).ToList();
    }

    public async Task<SystemConfigDto> UpdateConfigAsync(string id, UpdateConfigRequest request, CancellationToken ct = default)
    {
        var config = await _configRepo.GetByIdAsync(id, ct)
            ?? throw new InvalidOperationException($"配置 {id} 不存在");
        config.ConfigValue = request.ConfigValue;
        config.UpdatedBy = request.UpdatedBy;
        config.UpdatedAt = DateTime.UtcNow;
        config = await _configRepo.UpdateAsync(config, ct);
        return new SystemConfigDto
        {
            Id = config.Id,
            ConfigKey = config.ConfigKey,
            ConfigValue = config.ConfigValue,
            Description = config.Description,
            Category = config.Category,
            UpdatedAt = config.UpdatedAt,
            UpdatedBy = config.UpdatedBy,
        };
    }

    public async Task<List<NotificationConfigDto>> GetNotificationConfigsAsync(CancellationToken ct = default)
    {
        var configs = await _notificationConfigRepo.GetAllAsync(ct);
        return configs.Select(c => new NotificationConfigDto
        {
            Id = c.Id,
            Category = c.Category,
            Label = c.Label,
            Enabled = c.Enabled,
            Description = c.Description,
        }).ToList();
    }

    public async Task<NotificationConfigDto> UpdateNotificationConfigAsync(string id, UpdateNotificationConfigRequest request, CancellationToken ct = default)
    {
        var config = await _notificationConfigRepo.GetByIdAsync(id, ct)
            ?? throw new InvalidOperationException($"通知配置 {id} 不存在");
        config.Enabled = request.Enabled;
        config = await _notificationConfigRepo.UpdateAsync(config, ct);
        return new NotificationConfigDto
        {
            Id = config.Id,
            Category = config.Category,
            Label = config.Label,
            Enabled = config.Enabled,
            Description = config.Description,
        };
    }
}
