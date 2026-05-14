namespace MES.Domain.Interfaces.Integration;

public interface IMaterialCallService
{
    Task<MaterialCallStatusDto?> RequestMaterialAsync(MaterialCallRequest request, CancellationToken ct = default);
    Task<MaterialCallStatusDto?> GetCallStatusAsync(string callId, CancellationToken ct = default);
    Task<CommandResult?> CancelCallAsync(string callId, CancellationToken ct = default);
}
