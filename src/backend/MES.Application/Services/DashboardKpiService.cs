using MES.Application.DTOs;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Quality;
using MES.Domain.Enums;
using MES.Domain.Interfaces.Repositories;

namespace MES.Application.Services;

public interface IDashboardKpiService
{
    Task<DashboardDto> ComputeDashboardAsync(CancellationToken ct = default);
}

public class DashboardKpiService : IDashboardKpiService
{
    private readonly IWorkOrderRepository _workOrderRepo;
    private readonly IEquipmentRepository _equipmentRepo;
    private readonly IQualityInspectionRepository _qualityRepo;
    private readonly IMaterialRepository _materialRepo;
    private readonly IAnomalyRepository _anomalyRepo;

    public DashboardKpiService(
        IWorkOrderRepository workOrderRepo,
        IEquipmentRepository equipmentRepo,
        IQualityInspectionRepository qualityRepo,
        IMaterialRepository materialRepo,
        IAnomalyRepository anomalyRepo)
    {
        _workOrderRepo = workOrderRepo;
        _equipmentRepo = equipmentRepo;
        _qualityRepo = qualityRepo;
        _materialRepo = materialRepo;
        _anomalyRepo = anomalyRepo;
    }

    public async Task<DashboardDto> ComputeDashboardAsync(CancellationToken ct = default)
    {
        var workOrders = await _workOrderRepo.GetAllAsync(null, ct);
        var equipment = await _equipmentRepo.GetAllAsync(ct);
        var inspections = await _qualityRepo.GetAllAsync(ct);
        var criticalAnomalies = await _anomalyRepo.GetCriticalOpenAsync(ct);
        var materials = await _materialRepo.GetAllAsync(ct);

        var activeWo = workOrders.Count(w => w.Status is WorkOrderStatus.Created or WorkOrderStatus.Scheduled or WorkOrderStatus.InProgress);
        var scheduleAdherence = ProductionKpiCalculator.CalculateOnTimeRate(workOrders, DateTime.UtcNow) * 100;

        var runningCount = equipment.Count(e => e.Status == EquipmentStatus.Running);
        var utilizationRate = equipment.Count > 0 ? (double)runningCount / equipment.Count * 100 : 0;

        var passedInspections = inspections.Count(i => i.Result == InspectionResult.Pass);
        var totalInspections = inspections.Count;
        var qualityPassRate = totalInspections > 0 ? (double)passedInspections / totalInspections * 100 : 0;

        var statusTextMap = new Dictionary<EquipmentStatus, string>
        {
            [EquipmentStatus.Running] = "运行中",
            [EquipmentStatus.Idle] = "空闲",
            [EquipmentStatus.Maintenance] = "维护中",
            [EquipmentStatus.Fault] = "故障",
            [EquipmentStatus.Offline] = "离线",
        };

        var equipmentList = equipment.Select(e => new EquipmentStatusDto
        {
            Id = e.Id,
            Name = $"{e.EquipmentCode} {e.EquipmentName}",
            Type = e.EquipmentType,
            Status = e.Status.ToString().ToLower(),
            StatusText = statusTextMap.GetValueOrDefault(e.Status, e.Status.ToString()),
        }).ToList();

        var today = DateTime.UtcNow.Date;
        var todayTasks = workOrders
            .Where(w => w.PlannedStartDate.Date <= today && w.PlannedEndDate.Date >= today)
            .OrderBy(w => w.PlannedStartDate)
            .Take(8)
            .Select(w => new TodayScheduleDto
            {
                Id = w.Id,
                Time = $"{w.PlannedStartDate:HH:mm}-{w.PlannedEndDate:HH:mm}",
                Name = $"{w.OrderNumber} {w.ProductName}",
                Equip = w.RouteCode ?? "-",
                Status = w.Status.ToString().ToLower(),
                StatusText = w.Status switch
                {
                    WorkOrderStatus.InProgress => "生产中",
                    WorkOrderStatus.Completed => "已完成",
                    WorkOrderStatus.Scheduled => "待生产",
                    _ => w.Status.ToString(),
                },
            }).ToList();

        var materialAlerts = materials
            .Where(m => m.IsLowStock)
            .Take(5)
            .Select(m => new MaterialAlertDto
            {
                Code = m.MaterialCode,
                Name = m.MaterialName,
                Level = m.NetAvailable == 0 ? "critical" : "warning",
                Available = m.NetAvailable,
                Min = m.SafetyStock,
            }).ToList();

        var qualityStats = new QualityStatsDto
        {
            TotalInspections = totalInspections,
            Passed = passedInspections,
            Defects = inspections.Count(i => i.Result == InspectionResult.Fail),
            PendingAnomalies = criticalAnomalies.Count,
            PassRate = qualityPassRate,
        };

        return new DashboardDto
        {
            Kpi = new KpiCardDto
            {
                ScheduleAdherence = Math.Round(scheduleAdherence, 1),
                QualityPassRate = Math.Round(qualityPassRate, 1),
                EquipmentUtilization = Math.Round(utilizationRate, 1),
                ActiveOrders = activeWo,
            },
            Equipment = equipmentList,
            TodaySchedule = todayTasks,
            MaterialAlerts = materialAlerts,
            QualityStats = qualityStats,
        };
    }
}
