namespace MES.Application.DTOs;

public class ReportDashboardDto
{
    public ProductionSummaryDto Production { get; set; } = new();
    public QualitySummaryDto Quality { get; set; } = new();
    public EquipmentSummaryDto Equipment { get; set; } = new();
    public AnomalySummaryDto Anomaly { get; set; } = new();
}

public class ProductionSummaryDto
{
    public int TotalWorkOrders { get; set; }
    public int CompletedOrders { get; set; }
    public int InProgressOrders { get; set; }
    public double OnTimeRate { get; set; }
    public List<ChartDataPoint> DailyOutput { get; set; } = new();
}

public class QualitySummaryDto
{
    public double PassRate { get; set; }
    public double DefectRate { get; set; }
    public int TotalInspections { get; set; }
    public int DefectCount { get; set; }
    public List<ChartDataPoint> DailyDefects { get; set; } = new();
}

public class EquipmentSummaryDto
{
    public int TotalEquipment { get; set; }
    public int RunningCount { get; set; }
    public double UtilizationRate { get; set; }
    public double AvailabilityRate { get; set; }
    public List<ChartDataPoint> UtilizationTrend { get; set; } = new();
}

public class AnomalySummaryDto
{
    public int TotalAnomalies { get; set; }
    public int OpenCount { get; set; }
    public int ResolvedCount { get; set; }
    public double AvgResolveHours { get; set; }
    public List<ChartDataPoint> AnomalyByType { get; set; } = new();
}

public class ChartDataPoint
{
    public string Label { get; set; } = string.Empty;
    public double Value { get; set; }
}
