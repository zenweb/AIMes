using MES.Application.DTOs;
using MES.Application.Services;
using FluentAssertions;
using Xunit;

namespace MES.Tests.Unit.Application;

public class EmployeeAppServiceTests
{
    private readonly EmployeeAppService _sut = new();
    private static int _testSeq;

    [Fact]
    public async Task GetAllAsync_ShouldReturnAtLeastPresetCount()
    {
        var result = await _sut.GetAllAsync();

        result.Count.Should().BeGreaterThanOrEqualTo(8);
        result.Should().Contain(e => e.EmployeeNumber == "EMP-001");
        result.Should().Contain(e => e.EmployeeNumber == "EMP-008");
    }

    [Fact]
    public async Task GetByIdAsync_WhenExists_ShouldReturnEmployee()
    {
        var result = await _sut.GetByIdAsync("emp1");

        result.Should().NotBeNull();
        result!.EmployeeNumber.Should().Be("EMP-001");
        result.Role.Should().Be("Operator");
    }

    [Fact]
    public async Task GetByIdAsync_WhenNotExists_ShouldReturnNull()
    {
        var result = await _sut.GetByIdAsync("non-existent");

        result.Should().BeNull();
    }

    [Fact]
    public async Task CreateAsync_ShouldReturnCreatedEmployee()
    {
        var seq = Interlocked.Increment(ref _testSeq);
        var result = await _sut.CreateAsync(new CreateEmployeeRequest
        {
            EmployeeNumber = $"EMP-TEST-{seq}",
            Name = $"测试员工{seq}",
            Phone = "13800000000",
            Role = "Engineer",
            Team = "技术组",
            Shift = "Day"
        });

        result.Name.Should().Contain("测试员工");
        result.Role.Should().Be("Engineer");
        result.IsActive.Should().BeTrue();
        result.Id.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task CreateAsync_ShouldIncreaseCount()
    {
        var before = await _sut.GetAllAsync();
        var seq = Interlocked.Increment(ref _testSeq);

        await _sut.CreateAsync(new CreateEmployeeRequest
        {
            EmployeeNumber = $"EMP-CNT-{seq}",
            Name = "CountTest",
            Role = "Operator"
        });

        var after = await _sut.GetAllAsync();
        after.Should().HaveCount(before.Count + 1);
    }

    [Fact]
    public async Task UpdateAsync_ShouldModifyFields()
    {
        // create a dedicated employee for update test to avoid affecting static state
        var seq = Interlocked.Increment(ref _testSeq);
        var created = await _sut.CreateAsync(new CreateEmployeeRequest
        {
            EmployeeNumber = $"EMP-UPD-{seq}",
            Name = "Original",
            Role = "Operator",
            Team = "原班组"
        });

        var result = await _sut.UpdateAsync(created.Id, new UpdateEmployeeRequest
        {
            Name = "更新名字",
            Phone = "13900000001",
            Role = "Lead",
            Team = "新班组"
        });

        result.Name.Should().Be("更新名字");
        result.Phone.Should().Be("13900000001");
        result.Role.Should().Be("Lead");
        result.Team.Should().Be("新班组");
    }

    [Fact]
    public async Task UpdateAsync_WhenNotExists_ShouldThrow()
    {
        var act = () => _sut.UpdateAsync("non-existent", new UpdateEmployeeRequest { Name = "test" });

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*不存在*");
    }

    [Fact]
    public async Task DeactivateAsync_ShouldSetInactive()
    {
        // create a dedicated employee for deactivate test
        var seq = Interlocked.Increment(ref _testSeq);
        var created = await _sut.CreateAsync(new CreateEmployeeRequest
        {
            EmployeeNumber = $"EMP-DEACT-{seq}",
            Name = "ToDeactivate",
            Role = "Operator"
        });

        await _sut.DeactivateAsync(created.Id);

        var after = await _sut.GetByIdAsync(created.Id);
        after!.IsActive.Should().BeFalse();
    }

    [Fact]
    public async Task GetByTeamAsync_ShouldReturnFilteredResults()
    {
        var result = await _sut.GetByTeamAsync("甲班");

        result.Should().AllSatisfy(e => e.Team.Should().Be("甲班"));
    }

    [Fact]
    public async Task GetByTeamAsync_WhenNotExists_ShouldReturnEmpty()
    {
        var result = await _sut.GetByTeamAsync("不存在班组");

        result.Should().BeEmpty();
    }
}
