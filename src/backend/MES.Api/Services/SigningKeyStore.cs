using System.Collections.Concurrent;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace MES.Api.Services;

/// <summary>
/// 签名密钥存储 — 支持密钥轮转，旧密钥保留 24h 验证缓冲期
/// </summary>
public class SigningKeyStore
{
    private readonly ConcurrentDictionary<string, KeyEntry> _keys = new();
    private readonly TimeSpan _rotationGracePeriod = TimeSpan.FromHours(24);
    private string _currentKid;
    private readonly object _rotateLock = new();

    public SigningKeyStore(string initialKeyMaterial)
    {
        var (kid, key) = CreateKeyEntry(initialKeyMaterial);
        _currentKid = kid;
        _keys[kid] = new KeyEntry(kid, key, DateTime.UtcNow);
    }

    public (string Kid, SymmetricSecurityKey Key) CurrentKey
    {
        get
        {
            var entry = _keys[_currentKid];
            return (entry.Kid, entry.Key);
        }
    }

    public IEnumerable<SecurityKey> GetAllValidKeys()
    {
        return _keys.Values.Select(e => e.Key);
    }

    public SecurityKey? GetKeyById(string kid)
    {
        return _keys.TryGetValue(kid, out var entry) ? entry.Key : null;
    }

    /// <summary>轮转密钥：生成新密钥，旧密钥保留 24h 用于验证</summary>
    public void Rotate(string newKeyMaterial)
    {
        var (kid, key) = CreateKeyEntry(newKeyMaterial);
        lock (_rotateLock)
        {
            _currentKid = kid;
            _keys[kid] = new KeyEntry(kid, key, DateTime.UtcNow);
        }
        CleanupExpired();
    }

    private static (string Kid, SymmetricSecurityKey Key) CreateKeyEntry(string keyMaterial)
    {
        var kid = Guid.NewGuid().ToString("N")[..8];
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyMaterial));
        return (kid, key);
    }

    private void CleanupExpired()
    {
        var cutoff = DateTime.UtcNow.Add(-_rotationGracePeriod);
        foreach (var kv in _keys)
        {
            if (kv.Value.CreatedAt < cutoff && kv.Key != _currentKid)
                _keys.TryRemove(kv.Key, out _);
        }
    }

    private sealed record KeyEntry(string Kid, SymmetricSecurityKey Key, DateTime CreatedAt);
}
