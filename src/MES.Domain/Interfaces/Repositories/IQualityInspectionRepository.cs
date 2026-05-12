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
    Task<List<QualityInspection>> GetAllAsync();
    Task<QualityInspection?> GetByIdAsync(string id);
    Task<QualityInspection> CreateAsync(QualityInspection inspection);
    Task<List<QualityInspection>> GetByWorkOrderAsync(string workOrderId);
    Task<List<QualityInspection>> GetByProductAsync(string productCode);
    Task<List<QualityInspection>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
    Task<List<QualityInspection>> GetRecentInspectionsAsync(string processParameter, int count);
}