using System.Collections.Concurrent;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Interfaces.Services;

namespace MES.AI.Pro.Services;

/// <summary>
/// 向量存储服务实现（内存 InMemory provider）。
/// 注册为 Singleton，所有可变状态用 ConcurrentDictionary + per-collection lock 保护。
/// </summary>
public class VectorStoreService : IVectorStoreService
{
    private readonly ILlmGateway? _llmGateway;
    private readonly ConcurrentDictionary<string, List<DocumentChunk>> _collections = new();
    private readonly ConcurrentDictionary<string, object> _collectionLocks = new();

    public VectorStoreService()
    {
    }

    public VectorStoreService(ILlmGateway llmGateway)
    {
        _llmGateway = llmGateway;
    }

    private object GetLock(string collectionName) =>
        _collectionLocks.GetOrAdd(collectionName, _ => new object());

    public Task UpsertAsync(string collectionName, IEnumerable<DocumentChunk> chunks, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();
        var list = _collections.GetOrAdd(collectionName, _ => new List<DocumentChunk>());
        lock (GetLock(collectionName))
        {
            foreach (var chunk in chunks)
            {
                list.RemoveAll(c => c.Id == chunk.Id);
                list.Add(chunk);
            }
        }
        return Task.CompletedTask;
    }

    public Task<List<DocumentChunk>> SearchAsync(string collectionName, float[] embedding, int top = 5, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();
        if (!_collections.TryGetValue(collectionName, out var list))
        {
            return Task.FromResult(new List<DocumentChunk>());
        }

        // 在锁内拷贝快照，避免遍历过程中被并发 upsert 修改
        DocumentChunk[] snapshot;
        lock (GetLock(collectionName))
        {
            snapshot = list.ToArray();
        }

        var results = snapshot
            .Select(chunk => new
            {
                Chunk = chunk,
                Score = CalculateCosineSimilarity(embedding, chunk.Vector)
            })
            .OrderByDescending(x => x.Score)
            .Take(top)
            .Select(x => x.Chunk)
            .ToList();

        return Task.FromResult(results);
    }

    public async Task<List<DocumentChunk>> SearchAsync(string collectionName, string query, int top = 5, CancellationToken ct = default)
    {
        if (_llmGateway == null)
        {
            return TextSearch(collectionName, query, top);
        }

        var embedding = await _llmGateway.GenerateEmbeddingAsync(query, ct);
        return await SearchAsync(collectionName, embedding, top, ct);
    }

    public Task StoreAsync(
        string collectionName,
        string id,
        string text,
        float[] embedding,
        Dictionary<string, string> metadata)
    {
        var chunk = new DocumentChunk
        {
            Id = id,
            Content = text,
            Metadata = metadata,
            Vector = embedding,
            Source = metadata.TryGetValue("source", out var source) ? source : collectionName,
            CreatedAt = DateTime.UtcNow
        };

        return UpsertAsync(collectionName, new[] { chunk });
    }

    public Task DeleteCollectionAsync(string collectionName, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();
        _collections.TryRemove(collectionName, out _);
        _collectionLocks.TryRemove(collectionName, out _);
        return Task.CompletedTask;
    }

    private static double CalculateCosineSimilarity(float[] a, float[] b)
    {
        if (a.Length != b.Length || a.Length == 0)
            return 0;

        double dotProduct = 0;
        double normA = 0;
        double normB = 0;

        for (int i = 0; i < a.Length; i++)
        {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        var denominator = Math.Sqrt(normA) * Math.Sqrt(normB);
        return denominator == 0 ? 0 : dotProduct / denominator;
    }

    private List<DocumentChunk> TextSearch(string collectionName, string query, int top)
    {
        if (!_collections.TryGetValue(collectionName, out var list))
        {
            return new List<DocumentChunk>();
        }

        DocumentChunk[] snapshot;
        lock (GetLock(collectionName))
        {
            snapshot = list.ToArray();
        }

        var terms = query.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        return snapshot
            .Select(chunk => new
            {
                Chunk = chunk,
                Score = terms.Count(term => chunk.Content.Contains(term, StringComparison.OrdinalIgnoreCase)
                    || chunk.Metadata.Values.Any(value => value.Contains(term, StringComparison.OrdinalIgnoreCase)))
            })
            .OrderByDescending(x => x.Score)
            .ThenByDescending(x => x.Chunk.CreatedAt)
            .Take(top)
            .Select(x => x.Chunk)
            .ToList();
    }
}
