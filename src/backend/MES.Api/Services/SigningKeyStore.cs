using System.Collections.Concurrent;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.IdentityModel.Tokens;

namespace MES.Api.Services;

/// <summary>
/// 签名密钥存储 — 支持密钥轮转，旧密钥保留 24h 验证缓冲期
/// </summary>
public class SigningKeyStore
{
    private const string KeyPrefix = "aimes:signing-key:";
    private const string CurrentKidKey = "aimes:signing-key:current";
    private static readonly DistributedCacheEntryOptions KeyCacheOptions = new()
    {
        SlidingExpiration = TimeSpan.FromDays(2)
    };

    private readonly ConcurrentDictionary<string, KeyEntry> _keys = new();
    private readonly TimeSpan _rotationGracePeriod = TimeSpan.FromHours(24);
    private readonly IDistributedCache? _cache;
    private string _currentKid = string.Empty;
    private readonly object _rotateLock = new();

    public SigningKeyStore(string initialKeyMaterial)
        : this(initialKeyMaterial, cache: null)
    {
    }

    public SigningKeyStore(string initialKeyMaterial, IDistributedCache? cache)
    {
        _cache = cache;
        var (kid, key) = CreateKeyEntry(initialKeyMaterial);
        _keys[kid] = new KeyEntry(kid, key, DateTime.UtcNow);
        Volatile.Write(ref _currentKid, kid);
        PublishKey(kid, initialKeyMaterial);
    }

    public (string Kid, SymmetricSecurityKey Key) CurrentKey
    {
        get
        {
            var currentKid = Volatile.Read(ref _currentKid);
            var entry = _keys[currentKid];
            return (entry.Kid, entry.Key);
        }
    }

    public IEnumerable<SecurityKey> GetAllValidKeys()
    {
        LoadCurrentKeyFromCache();
        return _keys.Values.Select(e => e.Key).ToArray();
    }

    public SecurityKey? GetKeyById(string kid)
    {
        LoadKeyFromCache(kid);
        return _keys.TryGetValue(kid, out var entry) ? entry.Key : null;
    }

    /// <summary>轮转密钥：生成新密钥，旧密钥保留 24h 用于验证</summary>
    public void Rotate(string newKeyMaterial)
    {
        var (kid, key) = CreateKeyEntry(newKeyMaterial);
        lock (_rotateLock)
        {
            _keys[kid] = new KeyEntry(kid, key, DateTime.UtcNow);
            Volatile.Write(ref _currentKid, kid);
            PublishKey(kid, newKeyMaterial);
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
        var currentKid = Volatile.Read(ref _currentKid);
        foreach (var kv in _keys)
        {
            if (kv.Value.CreatedAt < cutoff && kv.Key != currentKid)
                _keys.TryRemove(kv.Key, out _);
        }
    }

    private sealed record KeyEntry(string Kid, SymmetricSecurityKey Key, DateTime CreatedAt);

    private sealed record DistributedKeyEntry(string Kid, string KeyMaterial, DateTime CreatedAt);

    private void PublishKey(string kid, string keyMaterial)
    {
        if (_cache is null)
        {
            return;
        }

        var payload = JsonSerializer.SerializeToUtf8Bytes(new DistributedKeyEntry(kid, keyMaterial, DateTime.UtcNow));
        _cache.Set(KeyPrefix + kid, payload, KeyCacheOptions);
        _cache.SetString(CurrentKidKey, kid, KeyCacheOptions);
    }

    private void LoadCurrentKeyFromCache()
    {
        if (_cache is null)
        {
            return;
        }

        var cachedKid = _cache.GetString(CurrentKidKey);
        if (!string.IsNullOrWhiteSpace(cachedKid))
        {
            LoadKeyFromCache(cachedKid);
        }
    }

    private void LoadKeyFromCache(string kid)
    {
        if (_cache is null || _keys.ContainsKey(kid))
        {
            return;
        }

        var payload = _cache.Get(KeyPrefix + kid);
        if (payload is null)
        {
            return;
        }

        var entry = JsonSerializer.Deserialize<DistributedKeyEntry>(payload);
        if (entry is null)
        {
            return;
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(entry.KeyMaterial));
        _keys.TryAdd(entry.Kid, new KeyEntry(entry.Kid, key, entry.CreatedAt));
    }
}
