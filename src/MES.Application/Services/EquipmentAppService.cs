using MES.Application.DTOs;
using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Quality;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Enums;
using MES.Domain.Interfaces.Repositories;
using MES.AI.Models;

namespace MES.Application.Services;

/// <summary>
/// 设备应用服务接口
/// </summary>
public interface IEquipmentAppService
{
    Task<EquipmentDto> CreateEquipmentAsync(CreateEquipmentRequest request, CancellationToken ct = default);
    Task<EquipmentDto?> GetEquipmentByIdAsync(string id, CancellationToken ct = default);
    Task<List<EquipmentDto>> GetEquipmentsAsync(string? workshopId = null, string? status = null, CancellationToken ct = default);
    Task<EquipmentStatisticsDto> GetStatisticsAsync(string? workshopId = null, CancellationToken ct = default);
    Task<EquipmentDto> UpdateStatusAsync(string id, string status, CancellationToken ct = default);
    Task<EquipmentHealthDto> GetHealthReportAsync(string equipmentId, CancellationToken ct = default);
    Task<DiagnosticReportDto> DiagnoseAsync(string equipmentId, string? errorCode = null, CancellationToken ct = default);
    Task<List<MaintenanceRecordDto>> GetMaintenanceHistoryAsync(string equipmentId, CancellationToken ct = default);
}

/// <summary>
/// 设备应用服务实现
/// </summary>
public class EquipmentAppService : IEquipmentAppService
{
    private readonly IEquipmentRepository _equipmentRepo;

    public EquipmentAppService(IEquipmentRepository equipmentRepo)
    {
        _equipmentRepo = equipmentRepo;
    }

    public async Task<EquipmentDto> CreateEquipmentAsync(CreateEquipmentRequest request, CancellationToken ct = default)
    {
        var equipment = new Equipment
        {
            EquipmentCode = request.EquipmentCode,
            EquipmentName = request.EquipmentName,
            EquipmentType = request.EquipmentType ?? string.Empty,
            WorkshopId = request.WorkshopId,
            WorkshopName = request.WorkshopName ?? string.Empty,
            Capacity = request.Capacity,
            Status = EquipmentStatus.Available
        };

        var created = await _equipmentRepo.CreateAsync(equipment);
        return MapToEquipmentDto(created);
    }

    public async Task<EquipmentDto?> GetEquipmentByIdAsync(string id, CancellationToken ct = default)
    {
        var equipment = await _equipmentRepo.GetByIdAsync(id);
        return equipment != null ? MapToEquipmentDto(equipment) : null;
    }

    public async Task<List<EquipmentDto>> GetEquipmentsAsync(string? workshopId = null, string? status = null, CancellationToken ct = default)
    {
        List<Equipment> equipments;

        if (!string.IsNullOrEmpty(workshopId))
        {
            equipments = await _equipmentRepo.GetByWorkshopAsync(workshopId);
        }
        else
        {
            equipments = await _equipmentRepo.GetAllAsync();
        }

        if (!string.IsNullOrEmpty(status) && Enum.TryParse<EquipmentStatus>(status, out var equipmentStatus))
        {
            equipments = equipments.Where(e => e.Status == equipmentStatus).ToList();
        }

        return equipments.Select(MapToEquipmentDto).ToList();
    }

    public async Task<EquipmentStatisticsDto> GetStatisticsAsync(string? workshopId = null, CancellationToken ct = default)
    {
        var equipments = string.IsNullOrEmpty(workshopId)
            ? await _equipmentRepo.GetAllAsync()
            : await _equipmentRepo.GetByWorkshopAsync(workshopId);

        var total = equipments.Count;
        var running = equipments.Count(e => e.Status == EquipmentStatus.Running);
        var idle = equipments.Count(e => e.Status == EquipmentStatus.Idle);
        var maintenance = equipments.Count(e => e.Status == EquipmentStatus.Maintenance);
        var fault = equipments.Count(e => e.Status == EquipmentStatus.Fault);
        var offline = equipments.Count(e => e.Status == EquipmentStatus.Offline);

        return new EquipmentStatisticsDto
        {
            TotalCount = total,
            RunningCount = running,
            IdleCount = idle,
            MaintenanceCount = maintenance,
            FaultCount = fault,
            OfflineCount = offline,
            UtilizationRate = total > 0 ? (double)running / total * 100 : 0,
            AvailabilityRate = total > 0 ? (double)(running + idle) / total * 100 : 0
        };
    }

    public async Task<EquipmentDto> UpdateStatusAsync(string id, string status, CancellationToken ct = default)
    {
        var equipment = await _equipmentRepo.GetByIdAsync(id);
        if (equipment == null)
            throw new InvalidOperationException($"设备 {id} 不存在");

        equipment.Status = Enum.Parse<EquipmentStatus>(status);
        var updated = await _equipmentRepo.UpdateAsync(equipment);
        return MapToEquipmentDto(updated);
    }

    public async Task<EquipmentHealthDto> GetHealthReportAsync(string equipmentId, CancellationToken ct = default)
    {
        var equipment = await _equipmentRepo.GetByIdAsync(equipmentId);
        if (equipment == null)
            throw new InvalidOperationException($"设备 {equipmentId} 不存在");

        // 简化版本 - 实际应该调用AI预测服务
        var healthScore = CalculateHealthScore(equipment);

        return new EquipmentHealthDto
        {
            EquipmentId = equipmentId,
            EquipmentName = equipment.EquipmentName,
            HealthScore = healthScore,
            HealthStatus = GetHealthStatus(healthScore),
            RecommendedMaintenanceDate = equipment.NextMaintenanceDate ?? DateTime.UtcNow.AddDays(30),
            Anomalies = new List<AnomalyDto>(),
            PredictedFailures = new List<PredictedFailureDto>(),
            MaintenanceTasks = new List<MaintenanceTaskDto>()
        };
    }

    public async Task<DiagnosticReportDto> DiagnoseAsync(string equipmentId, string? errorCode = null, CancellationToken ct = default)
    {
        var equipment = await _equipmentRepo.GetByIdAsync(equipmentId);
        if (equipment == null)
            throw new InvalidOperationException($"设备 {equipmentId} 不存在");

        var failureHistory = await _equipmentRepo.GetFailureHistoryAsync(equipmentId);

        // 简化版本 - 实际应该调用AI诊断Agent
        return new DiagnosticReportDto
        {
            EquipmentId = equipmentId,
            EquipmentName = equipment.EquipmentName,
            ErrorCode = errorCode ?? string.Empty,
            MostLikelyCause = errorCode switch
            {
                "E001" => "设备过热",
                "E002" => "传感器故障",
                "E003" => "电机异常",
                _ => "需要进一步诊断"
            },
            DiagnosticBasis = $"设备 {equipment.EquipmentName} 当前状态为 {equipment.Status}，历史维护记录 {failureHistory.Count} 条",
            SuggestedSteps = new List<string>
            {
                "检查设备运行状态",
                "查看传感器读数",
                "检查电机运行情况"
            },
            RequiredSpareParts = new List<string>(),
            EstimatedRepairTime = "30分钟"
        };
    }

    public async Task<List<MaintenanceRecordDto>> GetMaintenanceHistoryAsync(string equipmentId, CancellationToken ct = default)
    {
        var records = await _equipmentRepo.GetFailureHistoryAsync(equipmentId);
        return records.Select(MapToMaintenanceRecordDto).ToList();
    }

    #region Private Methods

    private EquipmentDto MapToEquipmentDto(Equipment e) => new()
    {
        Id = e.Id,
        EquipmentCode = e.EquipmentCode,
        EquipmentName = e.EquipmentName,
        EquipmentType = e.EquipmentType,
        WorkshopId = e.WorkshopId,
        WorkshopName = e.WorkshopName,
        Status = e.Status.ToString(),
        Capacity = e.Capacity,
        UtilizationRate = e.UtilizationRate,
        LastMaintenanceDate = e.LastMaintenanceDate,
        NextMaintenanceDate = e.NextMaintenanceDate,
        CurrentWorkOrderId = e.CurrentWorkOrderId,
        CreatedAt = e.CreatedAt
    };

    private MaintenanceRecordDto MapToMaintenanceRecordDto(MaintenanceRecord r) => new()
    {
        Id = r.Id,
        EquipmentId = r.EquipmentId,
        MaintenanceType = r.MaintenanceType,
        Description = r.Description,
        StartTime = r.StartTime,
        EndTime = r.EndTime,
        PerformedBy = r.PerformedBy,
        Result = r.Result,
        Cost = r.Cost,
        SparePartsUsed = r.SparePartsUsed
    };

    private double CalculateHealthScore(Equipment equipment)
    {
        double score = 100;

        // 根据设备状态调整分数
        score = equipment.Status switch
        {
            EquipmentStatus.Running => 90,
            EquipmentStatus.Available => 95,
            EquipmentStatus.Idle => 85,
            EquipmentStatus.Maintenance => 70,
            EquipmentStatus.Fault => 30,
            EquipmentStatus.Offline => 50,
            _ => 50
        };

        // 根据上次维护时间调整
        if (equipment.LastMaintenanceDate.HasValue)
        {
            var daysSinceLastMaintenance = (DateTime.UtcNow - equipment.LastMaintenanceDate.Value).Days;
            if (daysSinceLastMaintenance > 90)
                score -= 10;
            else if (daysSinceLastMaintenance > 180)
                score -= 25;
        }

        return Math.Max(0, Math.Min(100, score));
    }

    private string GetHealthStatus(double score) => score switch
    {
        >= 90 => "优秀",
        >= 70 => "良好",
        >= 50 => "一般",
        >= 30 => "较差",
        _ => "危险"
    };

    #endregion
}

/// <summary>
/// 维护记录DTO
/// </summary>
public class MaintenanceRecordDto
{
    public string Id { get; set; } = string.Empty;
    public string EquipmentId { get; set; } = string.Empty;
    public string MaintenanceType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public string PerformedBy { get; set; } = string.Empty;
    public string Result { get; set; } = string.Empty;
    public decimal Cost { get; set; }
    public List<string> SparePartsUsed { get; set; } = new();
}

/// <summary>
/// 诊断报告DTO
/// </summary>
public class DiagnosticReportDto
{
    public string EquipmentId { get; set; } = string.Empty;
    public string EquipmentName { get; set; } = string.Empty;
    public string ErrorCode { get; set; } = string.Empty;
    public string MostLikelyCause { get; set; } = string.Empty;
    public string DiagnosticBasis { get; set; } = string.Empty;
    public List<string> SuggestedSteps { get; set; } = new();
    public List<string> RequiredSpareParts { get; set; } = new();
    public string EstimatedRepairTime { get; set; } = string.Empty;
}
