using FluentAssertions;
using MES.Domain.ValueObjects;

namespace MES.Tests.Unit.Domain;

public sealed class OperationCodeTests
{
    [Theory]
    [InlineData("OP-2", 2)]
    [InlineData("OP-10", 10)]
    [InlineData("QC-010-A", 10)]
    [InlineData("FINAL", int.MaxValue)]
    public void NumericSequence_ShouldExtractFirstNumberForOperationOrdering(string value, int expected)
    {
        var code = new OperationCode(value);

        code.NumericSequence.Should().Be(expected, "production handoff and scheduling evidence must share one operation-code ordering rule");
    }
}
