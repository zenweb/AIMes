using MES.Domain.Entities.Scheduling;

namespace MES.Domain.Interfaces.Services;

public record KittingCheckItem(
    string MaterialCode,
    string MaterialName,
    decimal RequiredQuantity,
    decimal AvailableQuantity,
    decimal ShortageQuantity,
    bool IsSufficient);

public class KittingCheckResult
{
    public string ProductCode { get; init; } = string.Empty;
    public int OrderQuantity { get; init; }
    public bool IsAllSufficient => Items.All(i => i.IsSufficient);
    public List<KittingCheckItem> Items { get; init; } = [];
    public int ShortageCount => Items.Count(i => !i.IsSufficient);
}

public interface IMaterialKittingChecker
{
    Task<KittingCheckResult> CheckAsync(
        string productCode,
        int orderQuantity,
        List<MaterialAvailabilitySummary> materialAvailabilities,
        CancellationToken ct = default);
}
