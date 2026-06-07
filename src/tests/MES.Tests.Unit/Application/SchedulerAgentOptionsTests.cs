using FluentAssertions;
using MES.Application.Services;
using Xunit;

namespace MES.Tests.Unit.Application;

public sealed class SchedulerAgentOptionsTests
{
    [Theory]
    [InlineData(15)]
    [InlineData(60)]
    [InlineData(3600)]
    public void SchedulingEventPollSeconds_WhenWithinAllowedRange_ShouldBeAccepted(int seconds)
    {
        var options = new SchedulerAgentOptions
        {
            SchedulingEventPollSeconds = seconds
        };

        options.SchedulingEventPollSeconds.Should().Be(seconds);
    }

    [Fact]
    public void Defaults_ShouldKeepSchedulingEventHandlerDisabled()
    {
        var options = new SchedulerAgentOptions();

        options.EnableSchedulingEventHandler.Should().BeFalse();
        options.SchedulingEventPollSeconds.Should().Be(60);
    }
}
