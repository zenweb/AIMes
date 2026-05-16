using MES.Domain.Entities.Knowledge;

namespace MES.Domain.Interfaces.Services;

/// <summary>
/// 向量存储服务接口
/// </summary>
public interface IVectorStoreService
{
    Task UpsertAsync(string collectionName, IEnumerable<DocumentChunk> chunks, CancellationToken ct = default);
    Task<List<DocumentChunk>> SearchAsync(string collectionName, float[] embedding, int top = 5, CancellationToken ct = default);
    Task<List<DocumentChunk>> SearchAsync(string collectionName, string query, int top = 5, CancellationToken ct = default);
    Task DeleteCollectionAsync(string collectionName, CancellationToken ct = default);
}
