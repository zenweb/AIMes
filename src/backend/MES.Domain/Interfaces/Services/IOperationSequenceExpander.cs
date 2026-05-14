using MES.Domain.Entities.Scheduling;

namespace MES.Domain.Interfaces.Services;

public interface IOperationSequenceExpander
{
    Task<RoutingSummary?> ExpandAsync(string routeCode, CancellationToken ct = default);
    Task<List<RoutingSummary>> ExpandBatchAsync(IEnumerable<string> routeCodes, CancellationToken ct = default);
}
