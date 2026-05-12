using MES.Domain.Primitives;

namespace MES.Domain.ValueObjects;

public sealed class TimeWindow : ValueObject
{
    public DateTime Start { get; private set; }
    public DateTime End { get; private set; }

    private TimeWindow() { }

    public TimeWindow(DateTime start, DateTime end)
    {
        Start = start;
        End = end;
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Start;
        yield return End;
    }
}
