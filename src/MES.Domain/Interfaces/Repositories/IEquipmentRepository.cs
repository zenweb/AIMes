using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Quality;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Enums;

namespace MES.Domain.Interfaces.Repositories;

/// <summary>
/// 设备仓储接口
/// </summary>
public interface IEquipmentRepository
{
    Task<List<Equipment>> GetAllAsync();
    Task<Equipment?> GetByIdAsync(string id);
    Task<Equipment> CreateAsync(Equipment equipment);
    Task<Equipment> UpdateAsync(Equipment equipment);
    Task DeleteAsync(string id);
    Task<List<Equipment>> GetByWorkshopAsync(string workshopId);
    Task<List<Equipment>> GetByStatusAsync(EquipmentStatus status);
    Task<Equipment> GetStateAsync(string equipmentId);
    Task<List<MaintenanceRecord>> GetFailureHistoryAsync(string equipmentId);
}