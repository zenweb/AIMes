using FluentAssertions;
using MES.Api.Services;
using Xunit;

namespace MES.Tests.Unit.Services;

public class TokenBlacklistServiceTests
{
    [Fact]
    public void IsBlacklisted_WithUnknownJti_ShouldReturnFalse()
    {
        var service = new TokenBlacklistService();

        var result = service.IsBlacklisted("unknown-jti");

        result.Should().BeFalse();
    }

    [Fact]
    public void Blacklist_ShouldMakeJtiBlacklisted()
    {
        var service = new TokenBlacklistService();

        service.Blacklist("test-jti", DateTime.UtcNow.AddHours(1));

        service.IsBlacklisted("test-jti").Should().BeTrue();
    }

    [Fact]
    public void Blacklist_MultipleTokens_ShouldTrackAll()
    {
        var service = new TokenBlacklistService();

        service.Blacklist("jti-1", DateTime.UtcNow.AddHours(1));
        service.Blacklist("jti-2", DateTime.UtcNow.AddHours(1));
        service.Blacklist("jti-3", DateTime.UtcNow.AddHours(1));

        service.IsBlacklisted("jti-1").Should().BeTrue();
        service.IsBlacklisted("jti-2").Should().BeTrue();
        service.IsBlacklisted("jti-3").Should().BeTrue();
        service.IsBlacklisted("jti-4").Should().BeFalse();
    }

    [Fact]
    public void Blacklist_ExpiredEntry_ShouldStillBeListedUntilCleanup()
    {
        var service = new TokenBlacklistService();

        service.Blacklist("expired-jti", DateTime.UtcNow.AddHours(-1));

        // 清理有 15 分钟间隔，过期条目在下次清理前仍返回 true
        service.IsBlacklisted("expired-jti").Should().BeTrue("过期但尚未清理的 JTI 仍应被识别");
    }

    [Fact]
    public void Blacklist_ThenOverwriteExpiry_ShouldUpdate()
    {
        var service = new TokenBlacklistService();

        service.Blacklist("jti-1", DateTime.UtcNow.AddHours(-1));
        service.Blacklist("jti-1", DateTime.UtcNow.AddHours(1));

        service.IsBlacklisted("jti-1").Should().BeTrue();
    }
}
