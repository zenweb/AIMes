using System.Collections.Concurrent;

namespace MES.Api.Services;

/// <summary>
/// Token 黑名单服务 — 记录已撤销的 JWT（按 JTI），支持自动清理过期条目
/// </summary>
public class TokenBlacklistService
{
    private readonly ConcurrentDictionary<string, DateTime> _blacklist = new();
    private DateTime _lastCleanup = DateTime.UtcNow;
    private static readonly TimeSpan CleanupInterval = TimeSpan.FromMinutes(15);

    /// <summary>将指定 JTI 加入黑名单，到期时间取 Token 的 expiry</summary>
    public void Blacklist(string jti, DateTime expiry)
    {
        _blacklist[jti] = expiry;
    }

    /// <summary>检查 JTI 是否已被撤销</summary>
    public bool IsBlacklisted(string jti)
    {
        TryCleanup();
        return _blacklist.ContainsKey(jti);
    }

    /// <summary>清理已过期的黑名单条目</summary>
    public void TryCleanup()
    {
        var now = DateTime.UtcNow;
        if (now - _lastCleanup < CleanupInterval)
            return;

        _lastCleanup = now;
        foreach (var kv in _blacklist)
        {
            if (kv.Value <= now)
                _blacklist.TryRemove(kv.Key, out _);
        }
    }
}
