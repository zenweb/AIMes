using MES.Application.DTOs;
using MES.Application.Services;
using FluentAssertions;
using Xunit;

namespace MES.Tests.Unit.Application;

public class AdminAppServiceTests
{
    private readonly AdminAppService _sut = new();

    [Fact]
    public async Task GetAllUsersAsync_ShouldReturnAtLeastPresetCount()
    {
        var result = await _sut.GetAllUsersAsync();

        result.Count.Should().BeGreaterThanOrEqualTo(5);
        result.Should().Contain(u => u.Username == "admin" && u.Role == "Admin");
        result.Should().Contain(u => u.Username == "operator1");
    }

    [Fact]
    public async Task CreateUserAsync_ShouldReturnCreatedUser()
    {
        var result = await _sut.CreateUserAsync(new CreateUserRequest
        {
            Username = $"newuser_{Guid.NewGuid():N}",
            DisplayName = "新用户",
            Role = "Engineer"
        });

        result.Username.Should().Contain("newuser_");
        result.DisplayName.Should().Be("新用户");
        result.Role.Should().Be("Engineer");
        result.IsActive.Should().BeTrue();
        result.Id.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task UpdateUserAsync_ShouldModifyDisplayName()
    {
        // create dedicated user for update test
        var created = await _sut.CreateUserAsync(new CreateUserRequest
        {
            Username = $"upduser_{Guid.NewGuid():N}",
            DisplayName = "Original",
            Role = "Operator"
        });

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
        });

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
        var created = await _sut.CreateUserAsync(new CreateUserRequest
        {
            Username = $"cfgadmin_{Guid.NewGuid():N}",
            DisplayName = "Config Admin",
            Role = "Admin"
        });

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
