using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Quality;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Enums;
using MES.Domain.Interfaces.Repositories;
using MES.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MES.Infrastructure.Repositories;

/// <summary>
/// 设备仓储实现
/// </summary>
public class EquipmentRepository : IEquipmentRepository
{
    private readonly MesDbContext _context;

    public EquipmentRepository(MesDbContext context)
    {
        _context = context;
    }

    public async Task<List<Equipment>> GetAllAsync()
    {
        return await _context.Equipment
            .OrderBy(e => e.WorkshopId)
            .ThenBy(e => e.EquipmentCode)
            .ToListAsync();
    }

    public async Task<Equipment?> GetByIdAsync(string id)
    {
        return await _context.Equipment
            .FirstOrDefaultAsync(e => e.Id == id);
    }

    public async Task<Equipment> CreateAsync(Equipment equipment)
    {
        equipment.CreatedAt = DateTime.UtcNow;
        equipment.Id = string.IsNullOrEmpty(equipment.Id) ? Guid.NewGuid().ToString() : equipment.Id;

        _context.Equipment.Add(equipment);
        await _context.SaveChangesAsync();
        return equipment;
    }

    public async Task<Equipment> UpdateAsync(Equipment equipment)
    {
        equipment.UpdatedAt = DateTime.UtcNow;
        _context.Equipment.Update(equipment);
        await _context.SaveChangesAsync();
        return equipment;
    }

    public async Task DeleteAsync(string id)
    {
        var equipment = await GetByIdAsync(id);
        if (equipment != null)
        {
            _context.Equipment.Remove(equipment);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<List<Equipment>> GetByWorkshopAsync(string workshopId)
    {
        return await _context.Equipment
            .Where(e => e.WorkshopId == workshopId)
            .OrderBy(e => e.EquipmentCode)
            .ToListAsync();
    }

    public async Task<List<Equipment>> GetByStatusAsync(EquipmentStatus status)
    {
        return await _context.Equipment
            .Where(e => e.Status == status)
            .OrderBy(e => e.WorkshopId)
            .ThenBy(e => e.EquipmentCode)
            .ToListAsync();
    }

    public async Task<Equipment> GetStateAsync(string equipmentId)
    {
        var equipment = await GetByIdAsync(equipmentId);
        if (equipment == null)
        {
            throw new InvalidOperationException($"设备 {equipmentId} 不存在");
        }
        return equipment;
    }

    public async Task<List<MaintenanceRecord>> GetFailureHistoryAsync(string equipmentId)
    {
        return await _context.MaintenanceRecords
            .Where(m => m.EquipmentId == equipmentId)
            .OrderByDescending(m => m.StartTime)
            .ToListAsync();
    }
}
