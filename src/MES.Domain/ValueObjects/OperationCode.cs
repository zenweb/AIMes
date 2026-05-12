using MES.Domain.Primitives;

namespace MES.Domain.ValueObjects;

public sealed class OperationCode : ValueObject
{
    public string Value { get; private set; } = string.Empty;

    private OperationCode() { }

    public OperationCode(string value)
    {
        Value = value;
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;
}
