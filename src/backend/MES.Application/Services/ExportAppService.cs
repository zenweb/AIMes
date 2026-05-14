using ClosedXML.Excel;
using MES.Application.DTOs;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace MES.Application.Services;

public interface IExportAppService
{
    byte[] ExportReportToExcel(ReportDashboardDto report);
    byte[] ExportReportToPdf(ReportDashboardDto report);
}

public class ExportAppService : IExportAppService
{
    public byte[] ExportReportToExcel(ReportDashboardDto report)
    {
        using var wb = new XLWorkbook();

        var ws = wb.Worksheets.Add("生产概况");
        ws.Cell(1, 1).Value = "指标";
        ws.Cell(1, 2).Value = "值";
        ws.Cell(2, 1).Value = "工单总数";
        ws.Cell(2, 2).Value = report.Production.TotalWorkOrders;
        ws.Cell(3, 1).Value = "已完成";
        ws.Cell(3, 2).Value = report.Production.CompletedOrders;
        ws.Cell(4, 1).Value = "进行中";
        ws.Cell(4, 2).Value = report.Production.InProgressOrders;
        ws.Cell(5, 1).Value = "准时率";
        ws.Cell(5, 2).Value = $"{report.Production.OnTimeRate:P1}";

        ws = wb.Worksheets.Add("质量概况");
        ws.Cell(1, 1).Value = "指标";
        ws.Cell(1, 2).Value = "值";
        ws.Cell(2, 1).Value = "合格率";
        ws.Cell(2, 2).Value = $"{report.Quality.PassRate:P1}";
        ws.Cell(3, 1).Value = "不良率";
        ws.Cell(3, 2).Value = $"{report.Quality.DefectRate:P1}";
        ws.Cell(4, 1).Value = "检验批数";
        ws.Cell(4, 2).Value = report.Quality.TotalInspections;
        ws.Cell(5, 1).Value = "不良数";
        ws.Cell(5, 2).Value = report.Quality.DefectCount;

        ws = wb.Worksheets.Add("设备概况");
        ws.Cell(1, 1).Value = "指标";
        ws.Cell(1, 2).Value = "值";
        ws.Cell(2, 1).Value = "总数";
        ws.Cell(2, 2).Value = report.Equipment.TotalEquipment;
        ws.Cell(3, 1).Value = "运行中";
        ws.Cell(3, 2).Value = report.Equipment.RunningCount;
        ws.Cell(4, 1).Value = "利用率";
        ws.Cell(4, 2).Value = $"{report.Equipment.UtilizationRate:P1}";
        ws.Cell(5, 1).Value = "可动率";
        ws.Cell(5, 2).Value = $"{report.Equipment.AvailabilityRate:P1}";

        ws = wb.Worksheets.Add("异常概况");
        ws.Cell(1, 1).Value = "指标";
        ws.Cell(1, 2).Value = "值";
        ws.Cell(2, 1).Value = "总数";
        ws.Cell(2, 2).Value = report.Anomaly.TotalAnomalies;
        ws.Cell(3, 1).Value = "待处理";
        ws.Cell(3, 2).Value = report.Anomaly.OpenCount;
        ws.Cell(4, 1).Value = "已解决";
        ws.Cell(4, 2).Value = report.Anomaly.ResolvedCount;
        ws.Cell(5, 1).Value = "平均响应(h)";
        ws.Cell(5, 2).Value = report.Anomaly.AvgResolveHours;

        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        return ms.ToArray();
    }

    public byte[] ExportReportToPdf(ReportDashboardDto report)
    {
        QuestPDF.Settings.License = LicenseType.Community;

        var doc = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(30);
                page.DefaultTextStyle(x => x.FontSize(11));

                page.Header().Text("MES 生产报表").FontSize(18).Bold().AlignCenter();

                page.Content().Column(col =>
                {
                    col.Item().PaddingTop(10).Text("生产概况").FontSize(14).Bold();
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(c => { c.RelativeColumn(); c.RelativeColumn(); });
                        table.Cell().Border(1).BorderColor("#ddd").Padding(4).Text("工单总数");
                        table.Cell().Border(1).BorderColor("#ddd").Padding(4).Text(report.Production.TotalWorkOrders.ToString());
                        table.Cell().Border(1).BorderColor("#ddd").Padding(4).Text("已完成");
                        table.Cell().Border(1).BorderColor("#ddd").Padding(4).Text(report.Production.CompletedOrders.ToString());
                        table.Cell().Border(1).BorderColor("#ddd").Padding(4).Text("进行中");
                        table.Cell().Border(1).BorderColor("#ddd").Padding(4).Text(report.Production.InProgressOrders.ToString());
                        table.Cell().Border(1).BorderColor("#ddd").Padding(4).Text("准时率");
                        table.Cell().Border(1).BorderColor("#ddd").Padding(4).Text($"{report.Production.OnTimeRate:P1}");
                    });

                    col.Item().PaddingTop(10).Text("质量概况").FontSize(14).Bold();
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(c => { c.RelativeColumn(); c.RelativeColumn(); });
                        table.Cell().Border(1).BorderColor("#ddd").Padding(4).Text("合格率");
                        table.Cell().Border(1).BorderColor("#ddd").Padding(4).Text($"{report.Quality.PassRate:P1}");
                        table.Cell().Border(1).BorderColor("#ddd").Padding(4).Text("不良率");
                        table.Cell().Border(1).BorderColor("#ddd").Padding(4).Text($"{report.Quality.DefectRate:P1}");
                        table.Cell().Border(1).BorderColor("#ddd").Padding(4).Text("检验批数");
                        table.Cell().Border(1).BorderColor("#ddd").Padding(4).Text(report.Quality.TotalInspections.ToString());
                        table.Cell().Border(1).BorderColor("#ddd").Padding(4).Text("不良数");
                        table.Cell().Border(1).BorderColor("#ddd").Padding(4).Text(report.Quality.DefectCount.ToString());
                    });

                    col.Item().PaddingTop(10).Text("设备概况").FontSize(14).Bold();
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(c => { c.RelativeColumn(); c.RelativeColumn(); });
                        table.Cell().Border(1).BorderColor("#ddd").Padding(4).Text("总数");
                        table.Cell().Border(1).BorderColor("#ddd").Padding(4).Text(report.Equipment.TotalEquipment.ToString());
                        table.Cell().Border(1).BorderColor("#ddd").Padding(4).Text("运行中");
                        table.Cell().Border(1).BorderColor("#ddd").Padding(4).Text(report.Equipment.RunningCount.ToString());
                        table.Cell().Border(1).BorderColor("#ddd").Padding(4).Text("利用率");
                        table.Cell().Border(1).BorderColor("#ddd").Padding(4).Text($"{report.Equipment.UtilizationRate:P1}");
                        table.Cell().Border(1).BorderColor("#ddd").Padding(4).Text("可动率");
                        table.Cell().Border(1).BorderColor("#ddd").Padding(4).Text($"{report.Equipment.AvailabilityRate:P1}");
                    });

                    col.Item().PaddingTop(10).Text("异常概况").FontSize(14).Bold();
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(c => { c.RelativeColumn(); c.RelativeColumn(); });
                        table.Cell().Border(1).BorderColor("#ddd").Padding(4).Text("总数");
                        table.Cell().Border(1).BorderColor("#ddd").Padding(4).Text(report.Anomaly.TotalAnomalies.ToString());
                        table.Cell().Border(1).BorderColor("#ddd").Padding(4).Text("待处理");
                        table.Cell().Border(1).BorderColor("#ddd").Padding(4).Text(report.Anomaly.OpenCount.ToString());
                        table.Cell().Border(1).BorderColor("#ddd").Padding(4).Text("已解决");
                        table.Cell().Border(1).BorderColor("#ddd").Padding(4).Text(report.Anomaly.ResolvedCount.ToString());
                        table.Cell().Border(1).BorderColor("#ddd").Padding(4).Text("平均响应(h)");
                        table.Cell().Border(1).BorderColor("#ddd").Padding(4).Text(report.Anomaly.AvgResolveHours.ToString("F1"));
                    });
                });
            });
        });

        return doc.GeneratePdf();
    }

}
