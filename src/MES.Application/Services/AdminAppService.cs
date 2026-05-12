using MES.Application.DTOs;
using MES.Domain.Entities.Admin;

namespace MES.Application.Services;

public interface IAdminAppService
{
    // Users
    Task<List<SystemUserDto>> GetAllUsersAsync(CancellationToken ct = default);
    Task<SystemUserDto> CreateUserAsync(CreateUserRequest request, CancellationToken ct = default);
    Task<SystemUserDto> UpdateUserAsync(string id, UpdateUserRequest request, CancellationToken ct = default);
    // Config
    Task<List<SystemConfigDto>> GetAllConfigsAsync(CancellationToken ct = default);
    Task<SystemConfigDto> UpdateConfigAsync(string id, UpdateConfigRequest request, CancellationToken ct = default);
    // Notification config
    Task<List<NotificationConfigDto>> GetNotificationConfigsAsync(CancellationToken ct = default);
    Task<NotificationConfigDto> UpdateNotificationConfigAsync(string id, UpdateNotificationConfigRequest request, CancellationToken ct = default);
}

public class AdminAppService : IAdminAppService
{
    private static readonly List<SystemUser> _users = new();
    private static readonly List<SystemConfig> _configs = new();
    private static readonly List<NotificationConfig> _notificationConfigs = new();
    private static readonly object _lock = new();

    static AdminAppService()
    {
        _users.AddRange(new[]
        {
            new SystemUser { Id = "u1", Username = "admin", DisplayName = "管理员", Role = "Admin", IsActive = true, LastLoginAt = DateTime.UtcNow.AddHours(-2) },
            new SystemUser { Id = "u2", Username = "operator1", DisplayName = "张三", Role = "Operator", IsActive = true, LastLoginAt = DateTime.UtcNow.AddHours(-1) },
            new SystemUser { Id = "u3", Username = "engineer1", DisplayName = "赵六", Role = "Engineer", IsActive = true },
            new SystemUser { Id = "u4", Username = "lead1", DisplayName = "孙八", Role = "Lead", IsActive = true, LastLoginAt = DateTime.UtcNow.AddMinutes(-30) },
            new SystemUser { Id = "u5", Username = "qc1", DisplayName = "钱七", Role = "QC", IsActive = true },
        });

        _configs.AddRange(new[]
        {
            new SystemConfig { Id = "c1", ConfigKey = "site.name", ConfigValue = "AIMes 智能工厂", Category = "general", Description = "站点名称" },
            new SystemConfig { Id = "c2", ConfigKey = "production.shift.start", ConfigValue = "08:00", Category = "production", Description = "早班开始时间" },
            new SystemConfig { Id = "c3", ConfigKey = "production.shift.end", ConfigValue = "20:00", Category = "production", Description = "晚班结束时间" },
            new SystemConfig { Id = "c4", ConfigKey = "quality.spc.ucl.sigma", ConfigValue = "3", Category = "quality", Description = "SPC 控制限西格玛倍数" },
            new SystemConfig { Id = "c5", ConfigKey = "inventory.low.stock.warning", ConfigValue = "true", Category = "inventory", Description = "低库存预警开关" },
            new SystemConfig { Id = "c6", ConfigKey = "ai.auto.analyze", ConfigValue = "true", Category = "ai", Description = "异常自动 AI 分析" },
        });

        _notificationConfigs.AddRange(new[]
        {
            new NotificationConfig { Id = "nc1", Category = "equipment", Label = "设备状态", Enabled = true, Description = "设备运行/故障/离线状态变更通知" },
            new NotificationConfig { Id = "nc2", Category = "quality", Label = "质量预警", Enabled = true, Description = "质量检验不合格/SPC 超限预警" },
            new NotificationConfig { Id = "nc3", Category = "production", Label = "生产进度", Enabled = true, Description = "工单进度更新通知" },
            new NotificationConfig { Id = "nc4", Category = "anomaly", Label = "异常告警", Enabled = true, Description = "生产异常/设备异常告警" },
            new NotificationConfig { Id = "nc5", Category = "inventory", Label = "库存变更", Enabled = true, Description = "物料入库/出库/调拨/调整通知" },
            new NotificationConfig { Id = "nc6", Category = "purchase", Label = "采购状态", Enabled = true, Description = "采购单提交/确认/收货/取消通知" },
        });
    }

    public Task<List<SystemUserDto>> GetAllUsersAsync(CancellationToken ct = default)
    {
        lock (_lock)
        {
            return Task.FromResult(_users.OrderBy(u => u.Username).Select(u => new SystemUserDto
            {
                Id = u.Id,
                Username = u.Username,
                DisplayName = u.DisplayName,
                Role = u.Role,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt,
                LastLoginAt = u.LastLoginAt,
            }).ToList());
        }
    }

    public Task<SystemUserDto> CreateUserAsync(CreateUserRequest request, CancellationToken ct = default)
    {
        lock (_lock)
        {
            var user = new SystemUser
            {
                Username = request.Username,
                DisplayName = request.DisplayName,
                Role = request.Role,
            };
            _users.Add(user);
            return Task.FromResult(new SystemUserDto
            {
                Id = user.Id, Username = user.Username, DisplayName = user.DisplayName,
                Role = user.Role, IsActive = user.IsActive, CreatedAt = user.CreatedAt,
            });
        }
    }

    public Task<SystemUserDto> UpdateUserAsync(string id, UpdateUserRequest request, CancellationToken ct = default)
    {
        lock (_lock)
        {
            var user = _users.FirstOrDefault(u => u.Id == id)
                ?? throw new InvalidOperationException($"用户 {id} 不存在");
            if (request.DisplayName != null) user.DisplayName = request.DisplayName;
            if (request.Role != null) user.Role = request.Role;
            if (request.IsActive.HasValue) user.IsActive = request.IsActive.Value;
            return Task.FromResult(new SystemUserDto
            {
                Id = user.Id, Username = user.Username, DisplayName = user.DisplayName,
                Role = user.Role, IsActive = user.IsActive, CreatedAt = user.CreatedAt, LastLoginAt = user.LastLoginAt,
            });
        }
    }

    public Task<List<SystemConfigDto>> GetAllConfigsAsync(CancellationToken ct = default)
    {
        lock (_lock)
        {
            return Task.FromResult(_configs.OrderBy(c => c.Category).ThenBy(c => c.ConfigKey).Select(c => new SystemConfigDto
            {
                Id = c.Id, ConfigKey = c.ConfigKey, ConfigValue = c.ConfigValue,
                Description = c.Description, Category = c.Category,
                UpdatedAt = c.UpdatedAt, UpdatedBy = c.UpdatedBy,
            }).ToList());
        }
    }

    public Task<SystemConfigDto> UpdateConfigAsync(string id, UpdateConfigRequest request, CancellationToken ct = default)
    {
        lock (_lock)
        {
            var config = _configs.FirstOrDefault(c => c.Id == id)
                ?? throw new InvalidOperationException($"配置 {id} 不存在");
            config.ConfigValue = request.ConfigValue;
            config.UpdatedBy = request.UpdatedBy;
            config.UpdatedAt = DateTime.UtcNow;
            return Task.FromResult(new SystemConfigDto
            {
                Id = config.Id, ConfigKey = config.ConfigKey, ConfigValue = config.ConfigValue,
                Description = config.Description, Category = config.Category,
                UpdatedAt = config.UpdatedAt, UpdatedBy = config.UpdatedBy,
            });
        }
    }

    public Task<List<NotificationConfigDto>> GetNotificationConfigsAsync(CancellationToken ct = default)
    {
        lock (_lock)
        {
            return Task.FromResult(_notificationConfigs.Select(c => new NotificationConfigDto
            {
                Id = c.Id, Category = c.Category, Label = c.Label,
                Enabled = c.Enabled, Description = c.Description,
            }).ToList());
        }
    }

    public Task<NotificationConfigDto> UpdateNotificationConfigAsync(string id, UpdateNotificationConfigRequest request, CancellationToken ct = default)
    {
        lock (_lock)
        {
            var config = _notificationConfigs.FirstOrDefault(c => c.Id == id)
                ?? throw new InvalidOperationException($"通知配置 {id} 不存在");
            config.Enabled = request.Enabled;
            return Task.FromResult(new NotificationConfigDto
            {
                Id = config.Id, Category = config.Category, Label = config.Label,
                Enabled = config.Enabled, Description = config.Description,
            });
        }
    }
}
