using MES.Application.DTOs;
using MES.Application.Services;
using MES.Domain.Entities.Anomalies;
using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Quality;
using MES.Domain.Enums;
using MES.Domain.Interfaces.Repositories;

namespace MES.Api.Endpoints;

public static class ReportEndpoints
{
    public static RouteGroupBuilder MapReportEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/dashboard", GetDashboardAsync).WithTags("报表中心");
        group.MapGet("/export/excel", ExportExcelAsync).WithTags("报表中心");
        group.MapGet("/export/pdf", ExportPdfAsync).WithTags("报表中心");
        return group;
    }

    private static async Task<IResult> GetDashboardAsync(
        IWorkOrderRepository workOrderRepo,
        IEquipmentRepository equipmentRepo,
        IQualityInspectionRepository qualityRepo,
        IAnomalyRepository anomalyRepo,
        IScheduleRepository scheduleRepo,
        CancellationToken ct)
    {
        var report = await BuildDashboardReportAsync(workOrderRepo, equipmentRepo, qualityRepo, anomalyRepo, scheduleRepo, ct);
        return TypedResults.Ok(report);
    }

    private static async Task<IResult> ExportExcelAsync(
        IExportAppService exportService,
        IWorkOrderRepository workOrderRepo,
        IEquipmentRepository equipmentRepo,
        IQualityInspectionRepository qualityRepo,
        IAnomalyRepository anomalyRepo,
        IScheduleRepository scheduleRepo,
        CancellationToken ct)
    {
        var report = await BuildDashboardReportAsync(workOrderRepo, equipmentRepo, qualityRepo, anomalyRepo, scheduleRepo, ct);
        var bytes = exportService.ExportReportToExcel(report);
        return TypedResults.File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "MES_Report.xlsx");
    }

    private static async Task<IResult> ExportPdfAsync(
        IExportAppService exportService,
        IWorkOrderRepository workOrderRepo,
        IEquipmentRepository equipmentRepo,
        IQualityInspectionRepository qualityRepo,
        IAnomalyRepository anomalyRepo,
        IScheduleRepository scheduleRepo,
        CancellationToken ct)
    {
        var report = await BuildDashboardReportAsync(workOrderRepo, equipmentRepo, qualityRepo, anomalyRepo, scheduleRepo, ct);
        var bytes = exportService.ExportReportToPdf(report);
        return TypedResults.File(bytes, "application/pdf", "MES_Report.pdf");
    }

    private static async Task<ReportDashboardDto> BuildDashboardReportAsync(
        IWorkOrderRepository workOrderRepo,
        IEquipmentRepository equipmentRepo,
        IQualityInspectionRepository qualityRepo,
        IAnomalyRepository anomalyRepo,
        IScheduleRepository scheduleRepo,
        CancellationToken ct)
    {
        var workOrders = await workOrderRepo.GetAllAsync(null, ct);
        var equipment = await equipmentRepo.GetAllAsync(ct);
        var inspections = await qualityRepo.GetAllAsync(ct);

        // Production
        var completedWo = workOrders.Count(w => w.Status == WorkOrderStatus.Completed);
        var inProgressWo = workOrders.Count(w => w.Status is WorkOrderStatus.InProgress or WorkOrderStatus.Paused);
        var onTimeRate = ProductionKpiCalculator.CalculateOnTimeRate(workOrders, DateTime.UtcNow);

        var today = DateTime.UtcNow.Date;
        var dailyOutput = workOrders
            .Where(w => w.Status == WorkOrderStatus.Completed && w.ActualEndDate.HasValue)
            .Select(w => new { Date = w.ActualEndDate.GetValueOrDefault().Date, w.CompletedQuantity })
            .GroupBy(w => w.Date)
            .OrderBy(g => g.Key)
            .TakeLast(14)
            .Select(g => new ChartDataPoint
            {
                Label = $"{g.Key.Month}/{g.Key.Day:D2}",
                Value = g.Sum(w => w.CompletedQuantity),
            }).ToList();

        // Quality
        var passedInspections = inspections.Count(i => i.Result == InspectionResult.Pass);
        var totalInspections = inspections.Count;
        var passRate = totalInspections > 0 ? (double)passedInspections / totalInspections : 0;
        var defectCount = inspections.Count(i => i.Result == InspectionResult.Fail);

        var dailyDefects = inspections
            .Where(i => i.Result == InspectionResult.Fail && i.InspectedAt != default)
            .GroupBy(i => i.InspectedAt.Date)
            .OrderBy(g => g.Key)
            .TakeLast(14)
            .Select(g => new ChartDataPoint
            {
                Label = $"{g.Key.Month}/{g.Key.Day:D2}",
                Value = g.Count(),
            }).ToList();

        // Equipment
        var runningCount = equipment.Count(e => e.Status == EquipmentStatus.Running);
        var utilizationRate = equipment.Count > 0 ? (double)runningCount / equipment.Count : 0;

        var utilizationTrend = Enumerable.Range(0, 7).Reverse().Select(i =>
        {
            var weekLabel = i switch { 0 => "本周", 1 => "上周", _ => $"前{i}周" };
            return new ChartDataPoint
            {
                Label = weekLabel,
                Value = Math.Round(utilizationRate * 100, 1),
            };
        }).ToList();

        var anomalies = await anomalyRepo.GetAllAsync(ct);
        var openAnomalies = anomalies.Count(a => a.Status is AnomalyStatus.Open or AnomalyStatus.Acknowledged);
        var resolvedAnomalies = anomalies.Count(a => a.Status == AnomalyStatus.Resolved);
        var anomalyByType = anomalies
            .GroupBy(a => a.AnomalyType)
            .OrderBy(g => g.Key)
            .Select(g => new ChartDataPoint
            {
                Label = g.Key,
                Value = g.Count(),
            }).ToList();

        return new ReportDashboardDto
        {
            Production = new ProductionSummaryDto
            {
                TotalWorkOrders = workOrders.Count,
                CompletedOrders = completedWo,
                InProgressOrders = inProgressWo,
                OnTimeRate = Math.Round(onTimeRate, 3),
                DailyOutput = dailyOutput,
            },
            Quality = new QualitySummaryDto
            {
                PassRate = Math.Round(passRate, 3),
                DefectRate = totalInspections > 0 ? Math.Round((double)defectCount / totalInspections, 3) : 0,
                TotalInspections = totalInspections,
                DefectCount = defectCount,
                DailyDefects = dailyDefects,
            },
            Equipment = new EquipmentSummaryDto
            {
                TotalEquipment = equipment.Count,
                RunningCount = runningCount,
                UtilizationRate = Math.Round(utilizationRate, 2),
                AvailabilityRate = Math.Round(equipment.Count(e => e.Status != EquipmentStatus.Fault) / (double)Math.Max(1, equipment.Count), 2),
                UtilizationTrend = utilizationTrend,
            },
            Anomaly = new AnomalySummaryDto
            {
                TotalAnomalies = anomalies.Count,
                OpenCount = openAnomalies,
                ResolvedCount = resolvedAnomalies,
                AvgResolveHours = 0,
                AnomalyByType = anomalyByType,
            },
        };
    }
}
