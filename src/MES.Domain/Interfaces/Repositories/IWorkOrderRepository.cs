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
    Task<List<WorkOrder>> GetAllAsync(WorkOrderStatus? status = null);
    Task<WorkOrder?> GetByIdAsync(string id);
    Task<WorkOrder> CreateAsync(WorkOrder workOrder);
    Task<WorkOrder> UpdateAsync(WorkOrder workOrder);
    Task DeleteAsync(string id);
    Task<List<WorkOrder>> GetByWorkshopAsync(string workshopId);
    Task<List<WorkOrder>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
}