using MES.Domain.Entities.Equipment;
using MES.Domain.Enums;
using MES.Domain.Interfaces.Repositories;
using MES.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MES.Infrastructure.Repositories;

public class EquipmentRepository : IEquipmentRepository
{
    private readonly MesDbContext _context;

    public EquipmentRepository(MesDbContext context)
    {
        _context = context;
    }

    public async Task<List<Equipment>> GetAllAsync(CancellationToken ct = default)
    {
        return await BuildListQuery(null, null)
            .OrderBy(e => e.WorkshopId)
            .ThenBy(e => e.EquipmentCode)
            .ThenBy(e => e.Id)
            .ToListAsync(ct);
    }

    public async Task<List<Equipment>> GetPagedAsync(string? workshopId, EquipmentStatus? status, int page, int pageSize, CancellationToken ct = default)
    {
        return await BuildListQuery(workshopId, status)
            .OrderBy(e => e.WorkshopId)
            .ThenBy(e => e.EquipmentCode)
            .ThenBy(e => e.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);
    }

    public async Task<int> CountAsync(string? workshopId, EquipmentStatus? status, CancellationToken ct = default)
    {
        return await BuildListQuery(workshopId, status).CountAsync(ct);
    }

    public async Task<Equipment?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        return await _context.Equipment
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == id, ct);
    }

    public async Task<Equipment?> GetByCodeAsync(string equipmentCode, CancellationToken ct = default)
    {
        return await _context.Equipment
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.EquipmentCode == equipmentCode, ct);
    }

    public async Task<Equipment> CreateAsync(Equipment equipment, CancellationToken ct = default)
    {
        _context.Equipment.Add(equipment);
        await _context.SaveChangesAsync(ct);
        return equipment;
    }

    public async Task<Equipment> UpdateAsync(Equipment equipment, CancellationToken ct = default)
    {
        _context.Equipment.Update(equipment);
        await _context.SaveChangesAsync(ct);
        return equipment;
    }

    public async Task DeleteAsync(string id, CancellationToken ct = default)
    {
        var equipment = await GetByIdAsync(id, ct);
        if (equipment != null)
        {
            _context.Equipment.Remove(equipment);
            await _context.SaveChangesAsync(ct);
        }
    }

    public async Task<List<Equipment>> GetByWorkshopAsync(string workshopId, CancellationToken ct = default)
    {
        return await BuildListQuery(workshopId, null)
            .OrderBy(e => e.EquipmentCode)
            .ThenBy(e => e.Id)
            .ToListAsync(ct);
    }

    public async Task<List<Equipment>> GetByStatusAsync(EquipmentStatus status, CancellationToken ct = default)
    {
        return await BuildListQuery(null, status)
            .OrderBy(e => e.WorkshopId)
            .ThenBy(e => e.EquipmentCode)
            .ThenBy(e => e.Id)
            .ToListAsync(ct);
    }

    public async Task<Equipment> GetStateAsync(string equipmentId, CancellationToken ct = default)
    {
        var equipment = await GetByIdAsync(equipmentId, ct);
        if (equipment == null)
            throw new InvalidOperationException($"设备 {equipmentId} 不存在");
        return equipment;
    }

    public async Task<List<MaintenanceRecord>> GetFailureHistoryAsync(string equipmentId, CancellationToken ct = default)
    {
        return await _context.MaintenanceRecords
            .AsNoTracking()
            .Where(m => m.EquipmentId == equipmentId)
            .OrderByDescending(m => m.StartTime)
            .ToListAsync(ct);
    }

    private IQueryable<Equipment> BuildListQuery(string? workshopId, EquipmentStatus? status)
    {
        var query = _context.Equipment.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(workshopId))
        {
            query = query.Where(e => e.WorkshopId == workshopId);
        }

        if (status.HasValue)
        {
            query = query.Where(e => e.Status == status.Value);
        }

        return query;
    }
}
