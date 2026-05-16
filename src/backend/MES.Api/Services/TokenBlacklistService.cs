using Microsoft.Extensions.Caching.Distributed;

namespace MES.Api.Services;

/// <summary>
/// Token 黑名单服务 — 记录已撤销的 JWT（按 JTI），支持自动清理过期条目。
///
/// 用 IDistributedCache 抽象：
/// - 默认 IDistributedMemoryCache（单实例 MemoryCache，重启丢失）
/// - 生产场景注册 Redis（StackExchange.Redis）即可实现多实例共享 + 持久化
/// 不需要修改本类代码，只需要换 DI 注册。
///
/// 黑名单 entry 的 absoluteExpiration 设为 token 的 exp claim 时间——
/// 自动清理逻辑由 IDistributedCache 实现（MemoryCache + Redis 都内置）。
/// </summary>
public class TokenBlacklistService
{
    private const string KeyPrefix = "aimes:token-blacklist:";
    private static readonly byte[] Marker = new byte[] { 1 };
    // 与 Program.cs JwtBearer 的 ClockSkew 一致 + 1 分钟缓冲：
    // 避免「token exp 刚过但 ClockSkew 期内仍可被接受 → 此时 logout 调 BlacklistAsync 跳过写入」的窗口
    private static readonly TimeSpan MinBlacklistTtl = TimeSpan.FromMinutes(3);
    private readonly IDistributedCache _cache;

    public TokenBlacklistService(IDistributedCache cache)
    {
        _cache = cache;
    }

    /// <summary>将指定 JTI 加入黑名单，到期时间取 Token 的 expiry。</summary>
    public Task BlacklistAsync(string jti, DateTime expiry, CancellationToken ct = default)
    {
        var ttl = expiry - DateTime.UtcNow;
        // 即使 token 已过期，也至少保留 MinBlacklistTtl 在缓存里——
        // 因为 JwtBearer 验证带 ClockSkew，已过期的 token 仍可能被识别为有效，必须能被识别为已撤销。
        if (ttl < MinBlacklistTtl)
        {
            ttl = MinBlacklistTtl;
        }

        return _cache.SetAsync(
            KeyPrefix + jti,
            Marker,
            new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = ttl },
            ct);
    }

    /// <summary>检查 JTI 是否已被撤销。</summary>
    public async Task<bool> IsBlacklistedAsync(string jti, CancellationToken ct = default)
    {
        var value = await _cache.GetAsync(KeyPrefix + jti, ct);
        return value is not null;
    }
}
