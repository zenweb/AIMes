namespace MES.Domain.Interfaces.Integration;

public interface IErpService
{
    Task<WorkOrderDto?> GetWorkOrderAsync(string orderNumber, CancellationToken ct = default);
    Task<List<WorkOrderDto>?> GetScheduledOrdersAsync(string workshopId, DateTime start, DateTime end, CancellationToken ct = default);
    Task<CommandResult?> PostProductionReportAsync(ProductionReportDto report, CancellationToken ct = default);
}
