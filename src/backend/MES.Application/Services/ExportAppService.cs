using MES.Application.DTOs;

namespace MES.Application.Services;

public interface IExportAppService
{
    byte[] ExportReportToExcel(ReportDashboardDto report);
    byte[] ExportReportToPdf(ReportDashboardDto report);
}
