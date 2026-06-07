using FluentAssertions;
using MES.Api.Hubs;
using Xunit;

namespace MES.Tests.Unit.Security;

public class NotificationHubChannelPolicyTests
{
    [Theory]
    [InlineData("Operator", "quality:inspection-1")]
    [InlineData("Operator", "equipment:cnc-1")]
    [InlineData("QC", "equipment:cnc-1")]
    [InlineData("Engineer", "material:mat-1")]
    public void CanSubscribe_WhenRoleDoesNotMatchChannel_ShouldReject(string role, string channel)
    {
        var allowed = NotificationHub.CanSubscribeToChannel(channel, role, out _);

        allowed.Should().BeFalse("entity channels must be scoped by the caller's role");
    }

    [Theory]
    [InlineData("Operator", "order:wo-1")]
    [InlineData("Lead", "anomaly:an-1")]
    [InlineData("QC", "quality:inspection-1")]
    [InlineData("Engineer", "equipment:cnc-1")]
    [InlineData("Admin", "material:mat-1")]
    public void CanSubscribe_WhenRoleMatchesChannel_ShouldAllow(string role, string channel)
    {
        var allowed = NotificationHub.CanSubscribeToChannel(channel, role, out _);

        allowed.Should().BeTrue();
    }
}
