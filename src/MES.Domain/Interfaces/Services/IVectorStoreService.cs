using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Quality;
using MES.Domain.Entities.Scheduling;

namespace MES.Domain.Interfaces.Services;

/// <summary>
/// 向量存储服务接口
/// </summary>
public interface IVectorStoreService
{
    Task UpsertAsync(string collectionName, IEnumerable<DocumentChunk> chunks);
    Task<List<DocumentChunk>> SearchAsync(string collectionName, float[] embedding, int top = 5);
    Task DeleteCollectionAsync(string collectionName);
}