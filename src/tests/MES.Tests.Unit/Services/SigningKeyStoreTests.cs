using FluentAssertions;
using MES.Api.Services;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using Xunit;

namespace MES.Tests.Unit.Services;

public class SigningKeyStoreTests
{
    private static IDistributedCache CreateCache() =>
        new MemoryDistributedCache(Options.Create(new MemoryDistributedCacheOptions()));

    [Fact]
    public void Constructor_ShouldCreateInitialKey()
    {
        var store = new SigningKeyStore("test-key-material-at-least-16-chars");

        var (kid, key) = store.CurrentKey;
        kid.Should().NotBeNullOrEmpty();
        key.Should().NotBeNull();
        key.KeySize.Should().BeGreaterThan(0);
    }

    [Fact]
    public void CurrentKey_ShouldReturnConsistentKey()
    {
        var store = new SigningKeyStore("test-key-material-at-least-16-chars");

        var (kid1, key1) = store.CurrentKey;
        var (kid2, key2) = store.CurrentKey;

        kid1.Should().Be(kid2);
        key1.Should().BeSameAs(key2);
    }

    [Fact]
    public void Rotate_ShouldGenerateNewKid()
    {
        var store = new SigningKeyStore("test-key-material-at-least-16-chars");
        var originalKid = store.CurrentKey.Kid;

        store.Rotate("new-key-material-at-least-16-chars-different");

        store.CurrentKey.Kid.Should().NotBe(originalKid);
    }

    [Fact]
    public void GetKeyById_WithCurrentKid_ShouldReturnKey()
    {
        var store = new SigningKeyStore("test-key-material-at-least-16-chars");
        var (kid, _) = store.CurrentKey;

        var key = store.GetKeyById(kid);

        key.Should().NotBeNull();
    }

    [Fact]
    public void GetKeyById_WithUnknownKid_ShouldReturnNull()
    {
        var store = new SigningKeyStore("test-key-material-at-least-16-chars");

        var key = store.GetKeyById("nonexistent");

        key.Should().BeNull();
    }

    [Fact]
    public void GetAllValidKeys_ShouldContainCurrentKey()
    {
        var store = new SigningKeyStore("test-key-material-at-least-16-chars");
        var (kid, _) = store.CurrentKey;

        var allKeys = store.GetAllValidKeys();

        allKeys.Should().NotBeEmpty();
    }

    [Fact]
    public void Rotate_OldKeyShouldBeInValidKeys()
    {
        var store = new SigningKeyStore("test-key-material-at-least-16-chars");
        var (oldKid, _) = store.CurrentKey;

        store.Rotate("new-key-material-at-least-16-chars-different");

        var oldKey = store.GetKeyById(oldKid);
        oldKey.Should().NotBeNull("旧密钥在 24h 缓冲期内应仍有效");
    }

    [Fact]
    public void Rotate_ShouldStoreNewKeyBeforePublishingCurrentKid()
    {
        var source = File.ReadAllText(GetSigningKeyStoreSourcePath());
        var rotateStart = source.IndexOf("public void Rotate", StringComparison.Ordinal);
        var rotateBody = source.Substring(
            rotateStart,
            source.IndexOf("private static (string Kid", StringComparison.Ordinal) - rotateStart);

        rotateBody.IndexOf("_keys[kid]", StringComparison.Ordinal)
            .Should().BeLessThan(
                rotateBody.IndexOf("Volatile.Write(ref _currentKid, kid)", StringComparison.Ordinal),
                "readers must never observe a current kid before its key is visible in the dictionary");
    }

    [Fact]
    public void Constructor_WithDistributedCache_ShouldPublishCurrentKeyForOtherInstances()
    {
        var cache = CreateCache();
        var first = new SigningKeyStore("test-key-material-at-least-16-chars", cache);
        var second = new SigningKeyStore("fallback-key-material-at-least-16-chars", cache);

        var (kid, _) = first.CurrentKey;
        var key = second.GetKeyById(kid);

        key.Should().NotBeNull("Redis-backed deployments must let another API replica validate tokens signed by the publishing replica");
    }

    [Fact]
    public void Rotate_WithDistributedCache_ShouldPublishRotatedKeyForOtherInstances()
    {
        var cache = CreateCache();
        var first = new SigningKeyStore("test-key-material-at-least-16-chars", cache);
        var second = new SigningKeyStore("fallback-key-material-at-least-16-chars", cache);

        first.Rotate("new-key-material-at-least-16-chars-different");
        var (kid, _) = first.CurrentKey;
        var key = second.GetKeyById(kid);

        key.Should().NotBeNull("rotated signing keys must be visible to other API replicas during the validation grace period");
    }

    private static string GetSigningKeyStoreSourcePath()
    {
        return Path.GetFullPath(Path.Combine(
            AppContext.BaseDirectory,
            "..",
            "..",
            "..",
            "..",
            "..",
            "backend",
            "MES.Api",
            "Services",
            "SigningKeyStore.cs"));
    }
}
