using FluentAssertions;
using MES.Domain.Entities.Admin;
using Xunit;

namespace MES.Tests.Unit.Domain;

public class SystemUserTests
{
    [Fact]
    public void Create_ShouldRequirePasswordChange()
    {
        var user = SystemUser.Create("newuser", "New User", "hash", "Operator");

        user.MustChangePassword.Should().BeTrue("newly created accounts must rotate their initial password on first use");
    }

    [Fact]
    public void Create_WhenPasswordHashIsEmpty_ShouldReject()
    {
        var act = () => SystemUser.Create("newuser", "New User", "", "Operator");

        act.Should().Throw<ArgumentException>("seeded or admin-created accounts must never be persisted with an empty password hash");
    }

    [Fact]
    public void ChangePassword_ShouldClearPasswordChangeRequirement()
    {
        var user = SystemUser.Create("newuser", "New User", "old-hash", "Operator");

        user.ChangePassword("new-hash");

        user.MustChangePassword.Should().BeFalse("the user has supplied a replacement password");
    }
}
