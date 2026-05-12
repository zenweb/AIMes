using MES.Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MES.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/[controller]")]
public class ReportController : ControllerBase
{
    [HttpGet("dashboard")]
    [ProducesResponseType(typeof(ReportDashboardDto), StatusCodes.Status200OK)]
    public Task<ActionResult<ReportDashboardDto>> GetDashboard(CancellationToken ct)
    {
        var report = new ReportDashboardDto
        {
            Production = new ProductionSummaryDto
            {
                TotalWorkOrders = 48, CompletedOrders = 32, InProgressOrders = 12, OnTimeRate = 0.85,
                DailyOutput = Enumerable.Range(1, 14).Select(i => new ChartDataPoint
                {
                    Label = $"5/{i:D2}",
                    Value = Random.Shared.Next(18, 45)
                }).ToList(),
            },
            Quality = new QualitySummaryDto
            {
                PassRate = 0.976, DefectRate = 0.024, TotalInspections = 1250, DefectCount = 30,
                DailyDefects = Enumerable.Range(1, 14).Select(i => new ChartDataPoint
                {
                    Label = $"5/{i:D2}",
                    Value = Random.Shared.Next(0, 6)
                }).ToList(),
            },
            Equipment = new EquipmentSummaryDto
            {
                TotalEquipment = 24, RunningCount = 18, UtilizationRate = 0.78, AvailabilityRate = 0.94,
                UtilizationTrend = Enumerable.Range(1, 7).Select(i => new ChartDataPoint
                {
                    Label = $"第{i}周",
                    Value = Random.Shared.Next(65, 92)
                }).ToList(),
            },
            Anomaly = new AnomalySummaryDto
            {
                TotalAnomalies = 36, OpenCount = 5, ResolvedCount = 28, AvgResolveHours = 3.5,
                AnomalyByType = new[]
                {
                    new ChartDataPoint { Label = "设备异常", Value = 14 },
                    new ChartDataPoint { Label = "质量异常", Value = 10 },
                    new ChartDataPoint { Label = "物料异常", Value = 7 },
                    new ChartDataPoint { Label = "工艺异常", Value = 5 },
                }.ToList(),
            },
        };
        return Task.FromResult<ActionResult<ReportDashboardDto>>(Ok(report));
    }
}
