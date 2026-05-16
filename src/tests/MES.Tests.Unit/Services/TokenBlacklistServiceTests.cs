using FluentAssertions;
using MES.Api.Services;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using Xunit;

namespace MES.Tests.Unit.Services;

public class TokenBlacklistServiceTests
{
    private static TokenBlacklistService CreateService() =>
        new(new MemoryDistributedCache(Options.Create(new MemoryDistributedCacheOptions())));

    [Fact]
    public async Task IsBlacklisted_WithUnknownJti_ShouldReturnFalse()
    {
        var service = CreateService();

        var result = await service.IsBlacklistedAsync("unknown-jti");

        result.Should().BeFalse();
    }

    [Fact]
    public async Task Blacklist_ShouldMakeJtiBlacklisted()
    {
        var service = CreateService();

        await service.BlacklistAsync("test-jti", DateTime.UtcNow.AddHours(1));

        (await service.IsBlacklistedAsync("test-jti")).Should().BeTrue();
    }

    [Fact]
    public async Task Blacklist_MultipleTokens_ShouldTrackAll()
    {
        var service = CreateService();

        await service.BlacklistAsync("jti-1", DateTime.UtcNow.AddHours(1));
        await service.BlacklistAsync("jti-2", DateTime.UtcNow.AddHours(1));
        await service.BlacklistAsync("jti-3", DateTime.UtcNow.AddHours(1));

        (await service.IsBlacklistedAsync("jti-1")).Should().BeTrue();
        (await service.IsBlacklistedAsync("jti-2")).Should().BeTrue();
        (await service.IsBlacklistedAsync("jti-3")).Should().BeTrue();
        (await service.IsBlacklistedAsync("jti-4")).Should().BeFalse();
    }

    [Fact]
    public async Task Blacklist_ExpiredEntry_ShouldStillBeListedDuringClockSkewWindow()
    {
        var service = CreateService();

        // Token 已过期但仍在 JwtBearer ClockSkew (2 min) 窗口内时调 logout：
        // 必须保留 MinBlacklistTtl(3 min) 防止 ClockSkew 期间 token 仍被接受。
        // WHY: 旧实现直接跳过写入 → 攻击者可在 logout 后 ClockSkew 内继续用 token。
        await service.BlacklistAsync("expired-jti", DateTime.UtcNow.AddSeconds(-30));

        (await service.IsBlacklistedAsync("expired-jti")).Should().BeTrue();
    }

    [Fact]
    public async Task Blacklist_ThenOverwriteExpiry_ShouldUpdate()
    {
        var service = CreateService();

        // 两次都标记同一个 jti，第二次延长 expiry —— 仍应识别为已撤销
        await service.BlacklistAsync("jti-1", DateTime.UtcNow.AddHours(-1));
        await service.BlacklistAsync("jti-1", DateTime.UtcNow.AddHours(1));

        (await service.IsBlacklistedAsync("jti-1")).Should().BeTrue();
    }
}
