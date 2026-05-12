using MES.Domain.Interfaces.Integration;
using Microsoft.Extensions.Logging;

namespace MES.Infrastructure.Services;

public class MaterialDeliveryTrackerStub : IMaterialDeliveryTracker
{
    private readonly ILogger<MaterialDeliveryTrackerStub> _logger;

    public MaterialDeliveryTrackerStub(ILogger<MaterialDeliveryTrackerStub> logger)
    {
        _logger = logger;
    }

    public Task<DeliveryStatusDto?> GetDeliveryStatusAsync(string callId, CancellationToken ct = default)
    {
        // STUB: Replace with AGV delivery tracking.
        _logger.LogInformation("Delivery tracker stub GetDeliveryStatusAsync called for {CallId}", callId);
        return Task.FromResult<DeliveryStatusDto?>(new DeliveryStatusDto(callId, "DLV-STUB-001", "InTransit", "Aisle-03", DateTime.UtcNow.AddMinutes(12)));
    }

    public Task<List<DeliveryStatusDto>?> GetPendingDeliveriesAsync(string workshopId, CancellationToken ct = default)
    {
        // STUB: Replace with AGV pending delivery query.
        _logger.LogInformation("Delivery tracker stub GetPendingDeliveriesAsync called for {WorkshopId}", workshopId);
        var deliveries = new List<DeliveryStatusDto>
        {
            new("CALL-STUB-001", "DLV-STUB-001", "Queued", "Warehouse Dock", DateTime.UtcNow.AddMinutes(20)),
            new("CALL-STUB-002", "DLV-STUB-002", "InTransit", "Aisle-03", DateTime.UtcNow.AddMinutes(8))
        };
        return Task.FromResult<List<DeliveryStatusDto>?>(deliveries);
    }
}
