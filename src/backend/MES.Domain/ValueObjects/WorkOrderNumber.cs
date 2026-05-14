using MES.Domain.Primitives;

namespace MES.Domain.ValueObjects;

public sealed class WorkOrderNumber : ValueObject
{
    public string Value { get; private set; } = string.Empty;

    private WorkOrderNumber() { }

    public WorkOrderNumber(string value)
    {
        Value = value;
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;
}
