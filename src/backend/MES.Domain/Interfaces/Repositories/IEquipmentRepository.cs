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
    Task<List<Equipment>> GetAllAsync(CancellationToken ct = default);
    Task<List<Equipment>> GetPagedAsync(string? workshopId, EquipmentStatus? status, int page, int pageSize, CancellationToken ct = default);
    Task<int> CountAsync(string? workshopId, EquipmentStatus? status, CancellationToken ct = default);
    Task<Equipment?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<Equipment?> GetByCodeAsync(string equipmentCode, CancellationToken ct = default);
    Task<Equipment> CreateAsync(Equipment equipment, CancellationToken ct = default);
    Task<Equipment> UpdateAsync(Equipment equipment, CancellationToken ct = default);
    Task DeleteAsync(string id, CancellationToken ct = default);
    Task<List<Equipment>> GetByWorkshopAsync(string workshopId, CancellationToken ct = default);
    Task<List<Equipment>> GetByStatusAsync(EquipmentStatus status, CancellationToken ct = default);
    Task<Equipment> GetStateAsync(string equipmentId, CancellationToken ct = default);
    Task<List<MaintenanceRecord>> GetFailureHistoryAsync(string equipmentId, CancellationToken ct = default);
}
