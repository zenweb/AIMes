using MES.Domain.Entities.Knowledge;
using MES.Domain.Interfaces.Services;

namespace MES.AI.Pro.Services;

/// <summary>
/// 向量存储服务实现
/// </summary>
public class VectorStoreService : IVectorStoreService
{
    private readonly ILlmGateway? _llmGateway;
    private readonly Dictionary<string, List<DocumentChunk>> _collections = new();

    public VectorStoreService()
    {
    }

    public VectorStoreService(ILlmGateway llmGateway)
    {
        _llmGateway = llmGateway;
    }

    public Task UpsertAsync(string collectionName, IEnumerable<DocumentChunk> chunks)
    {
        if (!_collections.ContainsKey(collectionName))
        {
            _collections[collectionName] = new List<DocumentChunk>();
        }

        foreach (var chunk in chunks)
        {
            var existing = _collections[collectionName].FirstOrDefault(c => c.Id == chunk.Id);
            if (existing != null)
            {
                _collections[collectionName].Remove(existing);
            }
            _collections[collectionName].Add(chunk);
        }

        return Task.CompletedTask;
    }

    public Task<List<DocumentChunk>> SearchAsync(string collectionName, float[] embedding, int top = 5)
    {
        if (!_collections.ContainsKey(collectionName))
        {
            return Task.FromResult(new List<DocumentChunk>());
        }

        var results = _collections[collectionName]
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
        return await SearchAsync(collectionName, embedding, top);
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

    public Task DeleteCollectionAsync(string collectionName)
    {
        if (_collections.ContainsKey(collectionName))
        {
            _collections.Remove(collectionName);
        }
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
        if (!_collections.TryGetValue(collectionName, out var chunks))
        {
            return new List<DocumentChunk>();
        }

        var terms = query.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        return chunks
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
