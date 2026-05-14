namespace MES.Application.DTOs;

public class DashboardDto
{
    public KpiCardDto Kpi { get; set; } = new();
    public List<EquipmentStatusDto> Equipment { get; set; } = new();
    public List<TodayScheduleDto> TodaySchedule { get; set; } = new();
    public List<MaterialAlertDto> MaterialAlerts { get; set; } = new();
    public QualityStatsDto QualityStats { get; set; } = new();
}

public class KpiCardDto
{
    public double ScheduleAdherence { get; set; }
    public double QualityPassRate { get; set; }
    public double EquipmentUtilization { get; set; }
    public int ActiveOrders { get; set; }
}

public class EquipmentStatusDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string StatusText { get; set; } = string.Empty;
}

public class TodayScheduleDto
{
    public string Id { get; set; } = string.Empty;
    public string Time { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Equip { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string StatusText { get; set; } = string.Empty;
}

public class MaterialAlertDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Level { get; set; } = string.Empty;
    public int Available { get; set; }
    public int Min { get; set; }
}

public class QualityStatsDto
{
    public int TotalInspections { get; set; }
    public int Passed { get; set; }
    public int Defects { get; set; }
    public int PendingAnomalies { get; set; }
    public double PassRate { get; set; }
}
