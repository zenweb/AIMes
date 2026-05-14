using MES.Domain.Primitives;

namespace MES.Domain.ValueObjects;

public sealed class ParameterSnapshot : ValueObject
{
    public Dictionary<string, string> Parameters { get; private set; } = new();
    public DateTime CapturedAt { get; private set; } = DateTime.UtcNow;

    private ParameterSnapshot() { }

    public ParameterSnapshot(Dictionary<string, string> parameters, DateTime? capturedAt = null)
    {
        Parameters = parameters;
        CapturedAt = capturedAt ?? DateTime.UtcNow;
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return CapturedAt;
        foreach (var parameter in Parameters.OrderBy(p => p.Key))
        {
            yield return parameter.Key;
            yield return parameter.Value;
        }
    }
}
