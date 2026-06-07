using FluentAssertions;
using MES.Api.Services;
using Xunit;

namespace MES.Tests.Unit.Security;

public class AuthRateLimitPartitionKeyTests
{
    [Fact]
    public void Create_ShouldIncludeRemoteIpAndUsername()
    {
        var key = AuthRateLimitPartitionKey.Create("192.0.2.10", "admin");

        key.Should().Be("192.0.2.10|admin");
    }

    [Fact]
    public void Create_ShouldNormalizeUsername()
    {
        var key = AuthRateLimitPartitionKey.Create("192.0.2.10", " Admin ");

        key.Should().Be("192.0.2.10|admin");
    }

    [Fact]
    public void Create_WhenUsernameMissing_ShouldKeepUnknownBucket()
    {
        var key = AuthRateLimitPartitionKey.Create("192.0.2.10", "");

        key.Should().Be("192.0.2.10|unknown");
    }
}
