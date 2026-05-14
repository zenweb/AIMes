namespace MES.Domain.Interfaces.Integration;

public interface IMaterialDeliveryTracker
{
    Task<DeliveryStatusDto?> GetDeliveryStatusAsync(string callId, CancellationToken ct = default);
    Task<List<DeliveryStatusDto>?> GetPendingDeliveriesAsync(string workshopId, CancellationToken ct = default);
}
