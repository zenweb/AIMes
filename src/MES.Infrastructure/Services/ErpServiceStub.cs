using MES.Domain.Interfaces.Integration;
using Microsoft.Extensions.Logging;

namespace MES.Infrastructure.Services;

public class ErpServiceStub : IErpService
{
    private readonly ILogger<ErpServiceStub> _logger;

    public ErpServiceStub(ILogger<ErpServiceStub> logger)
    {
        _logger = logger;
    }

    public Task<WorkOrderDto?> GetWorkOrderAsync(string orderNumber, CancellationToken ct = default)
    {
        // STUB: Replace with ERP API call.
        _logger.LogInformation("ERP stub GetWorkOrderAsync called for {OrderNumber}", orderNumber);
        return Task.FromResult<WorkOrderDto?>(new WorkOrderDto(orderNumber, "P-1001", "Demo Product", 100, DateTime.UtcNow, DateTime.UtcNow.AddDays(1), "Scheduled"));
    }

    public Task<List<WorkOrderDto>?> GetScheduledOrdersAsync(string workshopId, DateTime start, DateTime end, CancellationToken ct = default)
    {
        // STUB: Replace with ERP schedule query.
        _logger.LogInformation("ERP stub GetScheduledOrdersAsync called for {WorkshopId} from {Start} to {End}", workshopId, start, end);
        var orders = new List<WorkOrderDto>
        {
            new("WO-STUB-001", "P-1001", "Demo Product", 100, start, start.AddHours(8), "Scheduled"),
            new("WO-STUB-002", "P-2002", "Demo Assembly", 50, start.AddHours(8), end, "Released")
        };
        return Task.FromResult<List<WorkOrderDto>?>(orders);
    }

    public Task<CommandResult?> PostProductionReportAsync(ProductionReportDto report, CancellationToken ct = default)
    {
        // STUB: Replace with ERP production report posting.
        _logger.LogInformation("ERP stub PostProductionReportAsync called for {WorkOrderNumber}", report.WorkOrderNumber);
        return Task.FromResult<CommandResult?>(new CommandResult(Guid.NewGuid().ToString(), "Accepted", "Production report accepted by ERP stub.", false));
    }
}
