using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Quality;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Enums;
using MES.Domain.Interfaces.Repositories;
using Microsoft.SemanticKernel;
using System.ComponentModel;

namespace MES.AI.Pro.Skills;

/// <summary>
/// MES业务技能 - 设备相关操作
/// 让AI可以执行真实的设备管理操作
/// </summary>
public class EquipmentSkills
{
    private readonly IEquipmentRepository _equipmentRepo;

    public EquipmentSkills(IEquipmentRepository equipmentRepo)
    {
        _equipmentRepo = equipmentRepo;
    }

    [KernelFunction]
    [Description("获取设备列表")]
    public async Task<List<Equipment>> GetEquipments(
        [Description("车间ID，可选")] string? workshopId = null,
        [Description("设备状态，可选值：Available, Running, Idle, Maintenance, Fault, Offline")] string? status = null)
    {
        var equipments = string.IsNullOrEmpty(workshopId)
            ? await _equipmentRepo.GetAllAsync()
            : await _equipmentRepo.GetByWorkshopAsync(workshopId);

        if (!string.IsNullOrEmpty(status) && Enum.TryParse<EquipmentStatus>(status, out var equipmentStatus))
        {
            equipments = equipments.Where(e => e.Status == equipmentStatus).ToList();
        }

        return equipments;
    }

    [KernelFunction]
    [Description("获取设备详情")]
    public async Task<Equipment?> GetEquipmentDetail(
        [Description("设备ID")] string equipmentId)
    {
        return await _equipmentRepo.GetByIdAsync(equipmentId);
    }

    [KernelFunction]
    [Description("获取设备当前运行状态")]
    public async Task<Equipment> GetEquipmentState(
        [Description("设备ID")] string equipmentId)
    {
        return await _equipmentRepo.GetStateAsync(equipmentId);
    }

    [KernelFunction]
    [Description("获取设备故障历史")]
    public async Task<List<MaintenanceRecord>> GetEquipmentFailureHistory(
        [Description("设备ID")] string equipmentId)
    {
        return await _equipmentRepo.GetFailureHistoryAsync(equipmentId);
    }

    [KernelFunction]
    [Description("按状态获取设备")]
    public async Task<List<Equipment>> GetEquipmentsByStatus(
        [Description("设备状态")] string status)
    {
        var equipmentStatus = Enum.Parse<EquipmentStatus>(status);
        return await _equipmentRepo.GetByStatusAsync(equipmentStatus);
    }

    [KernelFunction]
    [Description("更新设备状态")]
    public async Task<Equipment> UpdateEquipmentStatus(
        [Description("设备ID")] string equipmentId,
        [Description("新状态")] string newStatus)
    {
        var equipment = await _equipmentRepo.GetByIdAsync(equipmentId);
        if (equipment == null)
        {
            throw new InvalidOperationException($"设备 {equipmentId} 不存在");
        }

        equipment.Status = Enum.Parse<EquipmentStatus>(newStatus);
        return await _equipmentRepo.UpdateAsync(equipment);
    }

    [KernelFunction]
    [Description("获取可用设备列表(运行中)")]
    public async Task<List<Equipment>> GetAvailableEquipments(
        [Description("车间ID")] string workshopId)
    {
        var equipments = await _equipmentRepo.GetByWorkshopAsync(workshopId);
        return equipments.Where(e => e.Status == EquipmentStatus.Running).ToList();
    }

    [KernelFunction]
    [Description("统计设备状态")]
    public async Task<EquipmentStatistics> GetEquipmentStatistics(
        [Description("车间ID，可选")] string? workshopId = null)
    {
        var equipments = string.IsNullOrEmpty(workshopId)
            ? await _equipmentRepo.GetAllAsync()
            : await _equipmentRepo.GetByWorkshopAsync(workshopId);

        return new EquipmentStatistics
        {
            TotalCount = equipments.Count,
            RunningCount = equipments.Count(e => e.Status == EquipmentStatus.Running),
            IdleCount = equipments.Count(e => e.Status == EquipmentStatus.Idle),
            MaintenanceCount = equipments.Count(e => e.Status == EquipmentStatus.Maintenance),
            FaultCount = equipments.Count(e => e.Status == EquipmentStatus.Fault),
            OfflineCount = equipments.Count(e => e.Status == EquipmentStatus.Offline),
            UtilizationRate = equipments.Count > 0
                ? (double)equipments.Count(e => e.Status == EquipmentStatus.Running) / equipments.Count * 100
                : 0
        };
    }
}

/// <summary>
/// 设备统计数据
/// </summary>
public class EquipmentStatistics
{
    public int TotalCount { get; set; }
    public int RunningCount { get; set; }
    public int IdleCount { get; set; }
    public int MaintenanceCount { get; set; }
    public int FaultCount { get; set; }
    public int OfflineCount { get; set; }
    public double UtilizationRate { get; set; }
}
