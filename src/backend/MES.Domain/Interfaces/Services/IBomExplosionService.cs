using MES.Domain.Entities.Scheduling;

namespace MES.Domain.Interfaces.Services;

public interface IBomExplosionService
{
    Task<List<BomRequirementSummary>> ExplodeAsync(string productCode, CancellationToken ct = default);
    Task<Dictionary<string, List<BomRequirementSummary>>> ExplodeBatchAsync(
        IEnumerable<string> productCodes, CancellationToken ct = default);
}
