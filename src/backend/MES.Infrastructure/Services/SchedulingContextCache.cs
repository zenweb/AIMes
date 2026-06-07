using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Primitives;

namespace MES.Infrastructure.Services;

public interface ISchedulingContextCache
{
    bool TryGetFullSnapshot<TSnapshot>(string workshopId, out TSnapshot? snapshot);
    void SetFullSnapshot(string workshopId, object snapshot, TimeSpan ttl);
    void SetSnapshot(string workshopId, string snapshotType, object data, TimeSpan ttl);
    void RemoveFullSnapshot(string workshopId);
    void InvalidateAll();
}

public sealed class SchedulingContextCache : ISchedulingContextCache
{
    private readonly IMemoryCache _cache;
    private CancellationTokenSource _invalidation = new();

    public SchedulingContextCache(IMemoryCache cache)
    {
        _cache = cache;
    }

    public bool TryGetFullSnapshot<TSnapshot>(string workshopId, out TSnapshot? snapshot)
    {
        return _cache.TryGetValue(GetCacheKey(workshopId, "full"), out snapshot);
    }

    public void SetFullSnapshot(string workshopId, object snapshot, TimeSpan ttl)
    {
        _cache.Set(
            GetCacheKey(workshopId, "full"),
            snapshot,
            new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = ttl
            }.AddExpirationToken(new CancellationChangeToken(_invalidation.Token)));
    }

    public void SetSnapshot(string workshopId, string snapshotType, object data, TimeSpan ttl)
    {
        _cache.Set(GetCacheKey(workshopId, snapshotType), data, ttl);
    }

    public void RemoveFullSnapshot(string workshopId)
    {
        _cache.Remove(GetCacheKey(workshopId, "full"));
    }

    public void InvalidateAll()
    {
        var previous = Interlocked.Exchange(ref _invalidation, new CancellationTokenSource());
        previous.Cancel();
        previous.Dispose();
    }

    private static string GetCacheKey(string workshopId, string snapshotType) => $"scheduling-context:{workshopId}:{snapshotType}";
}
