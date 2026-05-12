using MES.Domain.Primitives;

namespace MES.Domain.ValueObjects;

public sealed class Quantity : ValueObject
{
    public decimal Value { get; private set; }
    public string Unit { get; private set; } = string.Empty;

    private Quantity() { }

    public Quantity(decimal value, string unit = "")
    {
        Value = value;
        Unit = unit;
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
        yield return Unit;
    }

    public override string ToString() => string.IsNullOrWhiteSpace(Unit) ? Value.ToString() : $"{Value} {Unit}";
}
