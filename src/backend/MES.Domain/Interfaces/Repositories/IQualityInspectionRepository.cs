using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Quality;
using MES.Domain.Entities.Scheduling;

namespace MES.Domain.Interfaces.Repositories;

/// <summary>
/// 质量检验仓储接口
/// </summary>
public interface IQualityInspectionRepository
{
    Task<List<QualityInspection>> GetAllAsync(CancellationToken ct = default);
    Task<QualityInspection?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<QualityInspection?> GetForUpdateAsync(string id, CancellationToken ct = default);
    Task<QualityInspection> CreateAsync(QualityInspection inspection, CancellationToken ct = default);
    Task<QualityInspection> UpdateAsync(QualityInspection inspection, CancellationToken ct = default);
    Task<List<QualityInspection>> GetByWorkOrderAsync(string workOrderId, CancellationToken ct = default);
    Task<List<QualityInspection>> GetByProductAsync(string productCode, CancellationToken ct = default);
    Task<List<QualityInspection>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken ct = default);
    Task<List<QualityInspection>> GetRecentInspectionsAsync(string processParameter, int count, CancellationToken ct = default);
}
