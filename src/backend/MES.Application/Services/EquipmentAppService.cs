using MES.Application.DTOs;
using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Knowledge;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Quality;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Enums;
using MES.Domain.Interfaces.Repositories;

namespace MES.Application.Services;

/// <summary>
/// 设备应用服务接口
/// </summary>
public interface IEquipmentAppService
{
    Task<EquipmentDto> CreateEquipmentAsync(CreateEquipmentRequest request, CancellationToken ct = default);
    Task<EquipmentDto?> GetEquipmentByIdAsync(string id, CancellationToken ct = default);
    Task<PagedResult<EquipmentDto>> GetEquipmentsAsync(string? workshopId = null, string? status = null, int page = 1, int pageSize = 20, CancellationToken ct = default);
    Task<EquipmentStatisticsDto> GetStatisticsAsync(string? workshopId = null, CancellationToken ct = default);
    Task<EquipmentDto> UpdateStatusAsync(string id, string status, CancellationToken ct = default);
    Task<EquipmentHealthDto> GetHealthReportAsync(string equipmentId, CancellationToken ct = default);
    Task<DiagnosticReportDto> DiagnoseAsync(string equipmentId, string? errorCode = null, CancellationToken ct = default);
    Task<List<MaintenanceRecordDto>> GetMaintenanceHistoryAsync(string equipmentId, CancellationToken ct = default);
    Task<List<string>> GetBottleneckEquipmentIdsAsync(string? workshopId = null, CancellationToken ct = default);
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
        var equipment = Equipment.Create(
            request.EquipmentCode,
            request.EquipmentName,
            request.EquipmentType ?? string.Empty,
            request.WorkshopId,
            request.WorkshopName ?? string.Empty,
            request.Capacity);

        var created = await _equipmentRepo.CreateAsync(equipment, ct);
        return MapToEquipmentDto(created);
    }

    public async Task<EquipmentDto?> GetEquipmentByIdAsync(string id, CancellationToken ct = default)
    {
        var equipment = await _equipmentRepo.GetByIdAsync(id, ct);
        return equipment != null ? MapToEquipmentDto(equipment) : null;
    }

    public async Task<PagedResult<EquipmentDto>> GetEquipmentsAsync(string? workshopId = null, string? status = null, int page = 1, int pageSize = 20, CancellationToken ct = default)
    {
        ValidatePaging(page, pageSize);

        var equipmentStatus = !string.IsNullOrEmpty(status) && Enum.TryParse<EquipmentStatus>(status, out var parsedStatus)
            ? parsedStatus
            : (EquipmentStatus?)null;
        var equipments = await _equipmentRepo.GetPagedAsync(workshopId, equipmentStatus, page, pageSize, ct);
        var total = await _equipmentRepo.CountAsync(workshopId, equipmentStatus, ct);
        var items = equipments
            .Select(MapToEquipmentDto)
            .ToList();

        return new PagedResult<EquipmentDto>
        {
            Items = items,
            TotalCount = total,
            Page = page,
            PageSize = pageSize,
        };
    }

    public async Task<EquipmentStatisticsDto> GetStatisticsAsync(string? workshopId = null, CancellationToken ct = default)
    {
        var equipments = string.IsNullOrEmpty(workshopId)
            ? await _equipmentRepo.GetAllAsync(ct)
            : await _equipmentRepo.GetByWorkshopAsync(workshopId, ct);

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
        var equipment = await _equipmentRepo.GetByIdAsync(id, ct);
        if (equipment == null)
            throw new InvalidOperationException($"设备 {id} 不存在");

        equipment.TransitionTo(Enum.Parse<EquipmentStatus>(status));
        var updated = await _equipmentRepo.UpdateAsync(equipment, ct);
        return MapToEquipmentDto(updated);
    }

    public async Task<EquipmentHealthDto> GetHealthReportAsync(string equipmentId, CancellationToken ct = default)
    {
        var equipment = await _equipmentRepo.GetByIdAsync(equipmentId, ct);
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
        var equipment = await _equipmentRepo.GetByIdAsync(equipmentId, ct);
        if (equipment == null)
            throw new InvalidOperationException($"设备 {equipmentId} 不存在");

        var failureHistory = await _equipmentRepo.GetFailureHistoryAsync(equipmentId, ct);

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
        var records = await _equipmentRepo.GetFailureHistoryAsync(equipmentId, ct);
        return records.Select(MapToMaintenanceRecordDto).ToList();
    }

    public async Task<List<string>> GetBottleneckEquipmentIdsAsync(string? workshopId = null, CancellationToken ct = default)
    {
        var equipments = string.IsNullOrEmpty(workshopId)
            ? await _equipmentRepo.GetAllAsync(ct)
            : await _equipmentRepo.GetByWorkshopAsync(workshopId, ct);

        return equipments
            .Where(e => e.UtilizationRate >= 0.8
                || string.Equals(e.EquipmentType, "HeatTreatment", StringComparison.OrdinalIgnoreCase))
            .Select(e => e.Id)
            .ToList();
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
            if (daysSinceLastMaintenance > 180)
                score -= 25;
            else if (daysSinceLastMaintenance > 90)
                score -= 10;
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

    private static void ValidatePaging(int page, int pageSize)
    {
        ArgumentOutOfRangeException.ThrowIfLessThan(page, 1);
        ArgumentOutOfRangeException.ThrowIfLessThan(pageSize, 1);
    }

    #endregion
}
