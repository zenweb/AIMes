using FluentAssertions;
using MES.Application.DTOs;
using MES.Application.Services;
using MES.Domain.Entities.Employee;
using MES.Domain.Interfaces.Repositories;
using Moq;
using Xunit;

namespace MES.Tests.Unit.Application;

public class EmployeeAppServiceTests
{
    private readonly Mock<IEmployeeRepository> _employeeRepoMock;
    private readonly EmployeeAppService _sut;
    private readonly List<Employee> _store;

    public EmployeeAppServiceTests()
    {
        _store = [];
        _employeeRepoMock = new Mock<IEmployeeRepository>();

        _employeeRepoMock.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(() => [.. _store]);
        _employeeRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((string id, CancellationToken _) => _store.FirstOrDefault(e => e.Id == id));
        _employeeRepoMock.Setup(r => r.GetByTeamAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((string team, CancellationToken _) => _store.Where(e => e.Team == team).ToList());
        _employeeRepoMock.Setup(r => r.AddAsync(It.IsAny<Employee>(), It.IsAny<CancellationToken>()))
            .Callback((Employee e, CancellationToken _) => _store.Add(e))
            .Returns(Task.CompletedTask);
        _employeeRepoMock.Setup(r => r.UpdateAsync(It.IsAny<Employee>(), It.IsAny<CancellationToken>()))
            .Callback((Employee e, CancellationToken _) =>
            {
                var idx = _store.FindIndex(x => x.Id == e.Id);
                if (idx >= 0) _store[idx] = e;
            })
            .Returns(Task.CompletedTask);
        _employeeRepoMock.Setup(r => r.ExistsAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((string id, CancellationToken _) => _store.Any(e => e.Id == id));

        // Seed data
        _store.AddRange(new[]
        {
            Employee.Create("EMP-001", "张三", "Operator", "甲班", "Day", "13800138001", id: "emp1"),
            Employee.Create("EMP-002", "李四", "Operator", "甲班", "Day", id: "emp2"),
            Employee.Create("EMP-003", "王五", "Operator", "乙班", "Night", id: "emp3"),
            Employee.Create("EMP-004", "赵六", "Engineer", "技术组", "Day", id: "emp4"),
            Employee.Create("EMP-005", "钱七", "QC", "质检组", "Day", id: "emp5"),
            Employee.Create("EMP-006", "孙八", "Lead", "甲班", "Day", id: "emp6"),
            Employee.Create("EMP-007", "周九", "Admin", id: "emp7"),
            Employee.Create("EMP-008", "吴十", "Operator", "乙班", "Night", id: "emp8"),
        });
        _store[7].Deactivate();

        _sut = new EmployeeAppService(_employeeRepoMock.Object);
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnAtLeastPresetCount()
    {
        var result = await _sut.GetAllAsync();

        result.TotalCount.Should().BeGreaterThanOrEqualTo(8);
        result.Items.Should().Contain(e => e.EmployeeNumber == "EMP-001");
        result.Items.Should().Contain(e => e.EmployeeNumber == "EMP-008");
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
        var result = await _sut.CreateAsync(new CreateEmployeeRequest
        {
            EmployeeNumber = "EMP-TEST-001",
            Name = "测试员工",
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

        await _sut.CreateAsync(new CreateEmployeeRequest
        {
            EmployeeNumber = "EMP-CNT-001",
            Name = "CountTest",
            Role = "Operator"
        });

        var after = await _sut.GetAllAsync();
        after.Items.Should().HaveCount(before.Items.Count + 1);
    }

    [Fact]
    public async Task UpdateAsync_ShouldModifyFields()
    {
        var created = await _sut.CreateAsync(new CreateEmployeeRequest
        {
            EmployeeNumber = "EMP-UPD-001",
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
        var created = await _sut.CreateAsync(new CreateEmployeeRequest
        {
            EmployeeNumber = "EMP-DEACT-001",
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
