using MES.Domain.Interfaces.Integration;
using Microsoft.Extensions.Logging;

namespace MES.Infrastructure.Services;

public class WmsServiceStub : IWmsService
{
    private readonly ILogger<WmsServiceStub> _logger;

    public WmsServiceStub(ILogger<WmsServiceStub> logger)
    {
        _logger = logger;
    }

    public Task<MaterialAvailabilityDto?> CheckMaterialAvailabilityAsync(string materialCode, decimal quantity, CancellationToken ct = default)
    {
        // STUB: Replace with WMS inventory check.
        _logger.LogInformation("WMS stub CheckMaterialAvailabilityAsync called for {MaterialCode}", materialCode);
        return Task.FromResult<MaterialAvailabilityDto?>(new MaterialAvailabilityDto(materialCode, quantity, quantity + 500, true, "WH-STUB-01"));
    }

    public Task<MaterialReservationDto?> ReserveMaterialAsync(string materialCode, decimal quantity, string workOrderNumber, CancellationToken ct = default)
    {
        // STUB: Replace with WMS reservation call.
        _logger.LogInformation("WMS stub ReserveMaterialAsync called for {MaterialCode} and {WorkOrderNumber}", materialCode, workOrderNumber);
        return Task.FromResult<MaterialReservationDto?>(new MaterialReservationDto(Guid.NewGuid().ToString(), materialCode, quantity, "Reserved", DateTime.UtcNow));
    }

    public Task<CommandResult?> ReleaseReservationAsync(string reservationId, CancellationToken ct = default)
    {
        // STUB: Replace with WMS reservation release call.
        _logger.LogInformation("WMS stub ReleaseReservationAsync called for {ReservationId}", reservationId);
        return Task.FromResult<CommandResult?>(new CommandResult(Guid.NewGuid().ToString(), "Released", "Reservation released by WMS stub.", false));
    }
}
