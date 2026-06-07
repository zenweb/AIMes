using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Quality;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Enums;

namespace MES.Domain.Interfaces.Repositories;

/// <summary>
/// 工单仓储接口
/// </summary>
public interface IWorkOrderRepository
{
    Task<List<WorkOrder>> GetAllAsync(WorkOrderStatus? status = null, CancellationToken ct = default);
    Task<List<WorkOrder>> GetPagedAsync(
        WorkOrderStatus? status,
        string? workshopId,
        string? productCode,
        DateTime? startDate,
        DateTime? endDate,
        int page,
        int pageSize,
        CancellationToken ct = default);
    Task<int> CountAsync(
        WorkOrderStatus? status,
        string? workshopId,
        string? productCode,
        DateTime? startDate,
        DateTime? endDate,
        CancellationToken ct = default);
    Task<WorkOrder?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<WorkOrder?> GetByCodeAsync(string code, CancellationToken ct = default);
    Task<WorkOrder> CreateAsync(WorkOrder workOrder, CancellationToken ct = default);
    Task<WorkOrder> UpdateAsync(WorkOrder workOrder, CancellationToken ct = default);
    Task DeleteAsync(string id, CancellationToken ct = default);
    Task<List<WorkOrder>> GetByWorkshopAsync(string workshopId, CancellationToken ct = default);
    Task<List<WorkOrder>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken ct = default);
}
