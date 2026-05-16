using System.Collections.Concurrent;
using MES.AI.Pro.Configuration;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Interfaces.Services;
using Microsoft.Extensions.Logging;
using Qdrant.Client;
using Qdrant.Client.Grpc;

namespace MES.AI.Pro.Services;

public class QdrantVectorStoreService : IVectorStoreService, IAsyncDisposable
{
    private const int VectorSize = 1536;
    private readonly QdrantClient _client;
    private readonly ILogger<QdrantVectorStoreService> _logger;
    // 注册为 Singleton；用 ConcurrentDictionary 当 set 用，避免并发 EnsureCollection 的 HashSet 竞争
    private readonly ConcurrentDictionary<string, byte> _knownCollections = new();

    public QdrantVectorStoreService(QdrantConfig config, ILogger<QdrantVectorStoreService> logger)
    {
        _client = new QdrantClient(config.Host, config.Port, https: false);
        _logger = logger;
    }

    public async Task UpsertAsync(string collectionName, IEnumerable<DocumentChunk> chunks, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();
        await EnsureCollectionAsync(collectionName, ct);

        var points = chunks.Select(chunk =>
        {
            var point = new PointStruct
            {
                Id = new PointId { Uuid = chunk.Id },
                Vectors = chunk.Vector,
            };
            point.Payload["content"] = chunk.Content;
            point.Payload["source"] = chunk.Source;
            point.Payload["created_at"] = chunk.CreatedAt.ToString("O");
            foreach (var (key, value) in chunk.Metadata)
                point.Payload[$"meta_{key}"] = value;

            return point;
        });

        var pointsList = points.ToList();
        await _client.UpsertAsync(collectionName, pointsList, cancellationToken: ct);
        _logger.LogDebug("Upserted {Count} chunks to collection {Collection}", pointsList.Count, collectionName);
    }

    public async Task<List<DocumentChunk>> SearchAsync(string collectionName, float[] embedding, int top = 5, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();
        if (!_knownCollections.ContainsKey(collectionName))
        {
            try
            {
                await _client.GetCollectionInfoAsync(collectionName, cancellationToken: ct);
                _knownCollections.TryAdd(collectionName, 0);
            }
            catch
            {
                _logger.LogWarning("Collection {Name} does not exist", collectionName);
                return new List<DocumentChunk>();
            }
        }

        var results = await _client.SearchAsync(
            collectionName,
            new ReadOnlyMemory<float>(embedding),
            limit: (ulong)top,
            payloadSelector: true,
            vectorsSelector: true,
            cancellationToken: ct
        );

        return results.Select(r =>
        {
            var chunk = new DocumentChunk
            {
                Id = r.Id.Uuid,
                Content = r.Payload.TryGetValue("content", out var c) ? c.StringValue : string.Empty,
                Source = r.Payload.TryGetValue("source", out var s) ? s.StringValue : string.Empty,
                CreatedAt = r.Payload.TryGetValue("created_at", out var t)
                    && DateTime.TryParse(t.StringValue, out var dt) ? dt : DateTime.UtcNow,
                Metadata = r.Payload
                    .Where(kvp => kvp.Key.StartsWith("meta_"))
                    .ToDictionary(kvp => kvp.Key[5..], kvp => kvp.Value.StringValue ?? string.Empty)
            };
            if (r.Vectors?.Vector != null)
                chunk.Vector = r.Vectors.Vector.Data.ToArray();
            return chunk;
        }).ToList();
    }

    public Task<List<DocumentChunk>> SearchAsync(string collectionName, string query, int top = 5, CancellationToken ct = default)
    {
        // Qdrant provider 不直接支持文本搜索；上层应当先 GenerateEmbedding 再调 float[] 重载。
        // 这里返回空列表，避免接口实现缺失（与本类历史行为一致：未实现则空集）。
        ct.ThrowIfCancellationRequested();
        _logger.LogWarning("Qdrant text-search overload is not supported; call SearchAsync(float[]) instead");
        return Task.FromResult(new List<DocumentChunk>());
    }

    public async Task DeleteCollectionAsync(string collectionName, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();
        await _client.DeleteCollectionAsync(collectionName, cancellationToken: ct);
        _knownCollections.TryRemove(collectionName, out _);
    }

    private async Task EnsureCollectionAsync(string collectionName, CancellationToken ct = default)
    {
        if (_knownCollections.ContainsKey(collectionName)) return;

        var collections = await _client.ListCollectionsAsync(cancellationToken: ct);
        if (!collections.Any(c => c == collectionName))
        {
            await _client.CreateCollectionAsync(collectionName, new VectorParams
            {
                Size = VectorSize,
                Distance = Distance.Cosine
            }, cancellationToken: ct);
            _logger.LogInformation("Created Qdrant collection {Name}", collectionName);
        }

        _knownCollections.TryAdd(collectionName, 0);
    }

    public async ValueTask DisposeAsync()
    {
        _client.Dispose();
        await Task.CompletedTask;
    }
}
