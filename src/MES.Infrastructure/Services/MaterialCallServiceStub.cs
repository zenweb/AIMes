using MES.Domain.Interfaces.Integration;
using Microsoft.Extensions.Logging;

namespace MES.Infrastructure.Services;

public class MaterialCallServiceStub : IMaterialCallService
{
    private readonly ILogger<MaterialCallServiceStub> _logger;

    public MaterialCallServiceStub(ILogger<MaterialCallServiceStub> logger)
    {
        _logger = logger;
    }

    public Task<MaterialCallStatusDto?> RequestMaterialAsync(MaterialCallRequest request, CancellationToken ct = default)
    {
        // STUB: Replace with AGV/material call dispatch.
        _logger.LogInformation("Material call stub RequestMaterialAsync called for {MaterialCode}", request.MaterialCode);
        return Task.FromResult<MaterialCallStatusDto?>(new MaterialCallStatusDto(Guid.NewGuid().ToString(), "Queued", "Material call queued for AGV dispatch.", DateTime.UtcNow));
    }

    public Task<MaterialCallStatusDto?> GetCallStatusAsync(string callId, CancellationToken ct = default)
    {
        // STUB: Replace with AGV/material call status query.
        _logger.LogInformation("Material call stub GetCallStatusAsync called for {CallId}", callId);
        return Task.FromResult<MaterialCallStatusDto?>(new MaterialCallStatusDto(callId, "InTransit", "AGV is moving to pickup point.", DateTime.UtcNow));
    }

    public Task<CommandResult?> CancelCallAsync(string callId, CancellationToken ct = default)
    {
        // STUB: Replace with AGV/material call cancellation.
        _logger.LogInformation("Material call stub CancelCallAsync called for {CallId}", callId);
        return Task.FromResult<CommandResult?>(new CommandResult(Guid.NewGuid().ToString(), "Cancelled", "Material call cancelled by stub.", false));
    }
}
