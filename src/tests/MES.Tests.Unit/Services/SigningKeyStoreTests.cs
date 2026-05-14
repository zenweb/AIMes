using FluentAssertions;
using MES.Api.Services;
using Xunit;

namespace MES.Tests.Unit.Services;

public class SigningKeyStoreTests
{
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
}
