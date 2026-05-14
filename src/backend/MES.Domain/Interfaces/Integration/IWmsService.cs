namespace MES.Domain.Interfaces.Integration;

public interface IWmsService
{
    Task<MaterialAvailabilityDto?> CheckMaterialAvailabilityAsync(string materialCode, decimal quantity, CancellationToken ct = default);
    Task<MaterialReservationDto?> ReserveMaterialAsync(string materialCode, decimal quantity, string workOrderNumber, CancellationToken ct = default);
    Task<CommandResult?> ReleaseReservationAsync(string reservationId, CancellationToken ct = default);
}
