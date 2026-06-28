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

    public int NumericSequence
    {
        get
        {
            var start = -1;
            for (var i = 0; i < Value.Length; i++)
            {
                if (!char.IsDigit(Value[i])) continue;
                start = i;
                break;
            }

            if (start < 0) return int.MaxValue;

            var end = start;
            while (end < Value.Length && char.IsDigit(Value[end]))
            {
                end++;
            }

            return int.TryParse(Value[start..end], out var sequence)
                ? sequence
                : int.MaxValue;
        }
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;
}
