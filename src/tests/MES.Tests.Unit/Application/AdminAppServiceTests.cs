using FluentAssertions;
using MES.Application.DTOs;
using MES.Application.Services;
using MES.Domain.Entities.Admin;
using MES.Domain.Interfaces.Repositories;
using Moq;
using Xunit;

namespace MES.Tests.Unit.Application;

public class AdminAppServiceTests
{
    private readonly Mock<IUserRepository> _userRepoMock = new();
    private readonly Mock<ISystemConfigRepository> _configRepoMock = new();
    private readonly Mock<INotificationConfigRepository> _notificationConfigRepoMock = new();
    private readonly AdminAppService _sut;

    public AdminAppServiceTests()
    {
        var users = new List<SystemUser>
        {
            SystemUser.Create("admin", "管理员", "hash", "Admin", "u1", DateTime.UtcNow),
            SystemUser.Create("operator1", "操作员一", "hash", "Operator", "u2", DateTime.UtcNow),
        };

        _userRepoMock.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(() => users.ToList());
        _userRepoMock.Setup(r => r.CreateAsync(It.IsAny<SystemUser>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((SystemUser u, CancellationToken _) =>
            {
                users.Add(u);
                return u;
            });
        _userRepoMock.Setup(r => r.UpdateAsync(It.IsAny<SystemUser>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((SystemUser u, CancellationToken _) => u);

        // 预设系统配置
        var configs = new List<SystemConfig>
        {
            new() { Id = "c1", ConfigKey = "site.name", ConfigValue = "AIMes 智能工厂", Category = "general", Description = "站点名称" },
            new() { Id = "c2", ConfigKey = "production.shift.start", ConfigValue = "08:00", Category = "production", Description = "早班开始时间" },
            new() { Id = "c3", ConfigKey = "production.shift.end", ConfigValue = "20:00", Category = "production", Description = "晚班结束时间" },
            new() { Id = "c4", ConfigKey = "quality.spc.ucl.sigma", ConfigValue = "3", Category = "quality", Description = "SPC 控制限西格玛倍数" },
            new() { Id = "c5", ConfigKey = "inventory.low.stock.warning", ConfigValue = "true", Category = "inventory", Description = "低库存预警开关" },
            new() { Id = "c6", ConfigKey = "ai.auto.analyze", ConfigValue = "true", Category = "ai", Description = "异常自动 AI 分析" },
        };
        _configRepoMock.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(() => configs.ToList());
        _configRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((string id, CancellationToken _) => configs.FirstOrDefault(c => c.Id == id));
        _configRepoMock.Setup(r => r.UpdateAsync(It.IsAny<SystemConfig>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((SystemConfig c, CancellationToken _) => c);

        // 预设通知配置
        var notificationConfigs = new List<NotificationConfig>
        {
            new() { Id = "nc1", Category = "equipment", Label = "设备状态", Enabled = true, Description = "设备运行/故障/离线状态变更通知" },
        };
        _notificationConfigRepoMock.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(() => notificationConfigs.ToList());
        _notificationConfigRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((string id, CancellationToken _) => notificationConfigs.FirstOrDefault(c => c.Id == id));
        _notificationConfigRepoMock.Setup(r => r.UpdateAsync(It.IsAny<NotificationConfig>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((NotificationConfig c, CancellationToken _) => c);

        _sut = new AdminAppService(_userRepoMock.Object, _configRepoMock.Object, _notificationConfigRepoMock.Object);
    }

    [Fact]
    public async Task GetAllUsersAsync_ShouldReturnAtLeastPresetCount()
    {
        var result = await _sut.GetAllUsersAsync();

        result.TotalCount.Should().BeGreaterThanOrEqualTo(2);
        result.Items.Should().Contain(u => u.Username == "admin" && u.Role == "Admin");
        result.Items.Should().Contain(u => u.Username == "operator1");
    }

    [Fact]
    public async Task CreateUserAsync_ShouldReturnCreatedUser()
    {
        var result = await _sut.CreateUserAsync(new CreateUserRequest
        {
            Username = $"newuser_{Guid.NewGuid():N}",
            DisplayName = "新用户",
            Role = "Engineer"
        }, "passwordHash");

        result.Username.Should().Contain("newuser_");
        result.DisplayName.Should().Be("新用户");
        result.Role.Should().Be("Engineer");
        result.IsActive.Should().BeTrue();
        result.Id.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task UpdateUserAsync_ShouldModifyDisplayName()
    {
        var created = await _sut.CreateUserAsync(new CreateUserRequest
        {
            Username = $"upduser_{Guid.NewGuid():N}",
            DisplayName = "Original",
            Role = "Operator"
        }, "hash");

        var result = await _sut.UpdateUserAsync(created.Id, new UpdateUserRequest
        {
            DisplayName = "修改后名字",
            Role = "Operator"
        });

        result.DisplayName.Should().Be("修改后名字");
        result.Role.Should().Be("Operator");
    }

    [Fact]
    public async Task UpdateUserAsync_ShouldDeactivate()
    {
        var created = await _sut.CreateUserAsync(new CreateUserRequest
        {
            Username = $"deactuser_{Guid.NewGuid():N}",
            DisplayName = "ToDeactivate",
            Role = "Operator"
        }, "hash");

        var result = await _sut.UpdateUserAsync(created.Id, new UpdateUserRequest
        {
            IsActive = false
        });

        result.IsActive.Should().BeFalse();
    }

    [Fact]
    public async Task UpdateUserAsync_WhenNotExists_ShouldThrow()
    {
        var act = () => _sut.UpdateUserAsync("non-existent", new UpdateUserRequest { DisplayName = "test" });

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*不存在*");
    }

    [Fact]
    public async Task GetAllConfigsAsync_ShouldReturnAtLeastPresetCount()
    {
        var result = await _sut.GetAllConfigsAsync();

        result.Count.Should().BeGreaterThanOrEqualTo(6);
        result.Should().Contain(c => c.ConfigKey == "site.name");
    }

    [Fact]
    public async Task UpdateConfigAsync_ShouldChangeValue()
    {
        var configs = await _sut.GetAllConfigsAsync();
        var target = configs.First(c => c.ConfigKey == "site.name");

        var result = await _sut.UpdateConfigAsync(target.Id, new UpdateConfigRequest
        {
            ConfigValue = "新工厂名称",
            UpdatedBy = "admin"
        });

        result.ConfigValue.Should().Be("新工厂名称");
        result.ConfigKey.Should().Be("site.name");
    }

    [Fact]
    public async Task UpdateConfigAsync_WhenNotExists_ShouldThrow()
    {
        var act = () => _sut.UpdateConfigAsync("non-existent", new UpdateConfigRequest
        {
            ConfigValue = "value",
            UpdatedBy = "admin"
        });

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*不存在*");
    }
}
