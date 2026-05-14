using MES.Domain.Interfaces.Integration;
using Microsoft.Extensions.Logging;

namespace MES.Infrastructure.Services;

public class EquipmentCommandServiceStub : IEquipmentCommandService
{
    private readonly ILogger<EquipmentCommandServiceStub> _logger;

    public EquipmentCommandServiceStub(ILogger<EquipmentCommandServiceStub> logger)
    {
        _logger = logger;
    }

    public Task<CommandResult?> SendParameterRecipeAsync(string equipmentId, string recipeName, Dictionary<string, object> parameters, CancellationToken ct = default)
    {
        // STUB: Replace with equipment recipe command.
        _logger.LogInformation("Equipment command stub SendParameterRecipeAsync called for {EquipmentId} recipe {RecipeName}", equipmentId, recipeName);
        return Task.FromResult<CommandResult?>(new CommandResult(Guid.NewGuid().ToString(), "Sent", "Recipe command sent by equipment stub.", false));
    }

    public Task<CommandResult?> StartStopDeviceAsync(string equipmentId, bool start, string? reason, CancellationToken ct = default)
    {
        // STUB: Replace with equipment start/stop command.
        _logger.LogInformation("Equipment command stub StartStopDeviceAsync called for {EquipmentId} start={Start}", equipmentId, start);
        var action = start ? "Start" : "Stop";
        return Task.FromResult<CommandResult?>(new CommandResult(Guid.NewGuid().ToString(), "Sent", $"{action} command sent by equipment stub.", !start));
    }

    public Task<CommandResult?> SetOperationModeAsync(string equipmentId, string mode, CancellationToken ct = default)
    {
        // STUB: Replace with equipment mode command.
        _logger.LogInformation("Equipment command stub SetOperationModeAsync called for {EquipmentId} mode {Mode}", equipmentId, mode);
        return Task.FromResult<CommandResult?>(new CommandResult(Guid.NewGuid().ToString(), "Sent", "Mode command sent by equipment stub.", false));
    }
}
