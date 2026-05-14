namespace MES.Domain.Interfaces.Integration;

public interface IEquipmentCommandService
{
    Task<CommandResult?> SendParameterRecipeAsync(string equipmentId, string recipeName, Dictionary<string, object> parameters, CancellationToken ct = default);
    Task<CommandResult?> StartStopDeviceAsync(string equipmentId, bool start, string? reason, CancellationToken ct = default);
    Task<CommandResult?> SetOperationModeAsync(string equipmentId, string mode, CancellationToken ct = default);
}
