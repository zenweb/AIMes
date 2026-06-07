using FluentAssertions;
using MES.Infrastructure.Services;
using Microsoft.Extensions.Caching.Memory;

namespace MES.Tests.Unit.Infrastructure;

public class SchedulingContextCacheTests
{
    [Fact]
    public void InvalidateAll_ShouldMakeExistingFullSnapshotsUnreadable()
    {
        using var memoryCache = new MemoryCache(new MemoryCacheOptions());
        var cache = new SchedulingContextCache(memoryCache);
        var snapshot = new object();

        cache.SetFullSnapshot("WS-001", snapshot, TimeSpan.FromMinutes(5));
        cache.TryGetFullSnapshot<object>("WS-001", out var beforeInvalidation)
            .Should().BeTrue();

        cache.InvalidateAll();

        cache.TryGetFullSnapshot<object>("WS-001", out var afterInvalidation)
            .Should().BeFalse("domain/integration events must invalidate cached scheduling context instead of serving stale capacity, WIP, or material data");
        beforeInvalidation.Should().BeSameAs(snapshot);
        afterInvalidation.Should().BeNull();
    }
}
