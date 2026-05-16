using FluentAssertions;
using MES.Domain.ValueObjects;
using Xunit;

namespace MES.Tests.Unit.Domain;

/// <summary>
/// ValueObject 等值与 Hash 行为测试。
/// 这些 VO 被广泛用作 EF Owned Type / DTO 字段，等值实现错误会导致：
///   - HashSet/Dictionary 去重失效（产生重复条目）
///   - EF Owned Type 生成错误的 SQL 比较条件
/// </summary>
public class ValueObjectTests
{
    [Fact]
    public void WorkOrderNumber_SameValue_ShouldBeEqual()
    {
        var a = new WorkOrderNumber("WO-2026-0042");
        var b = new WorkOrderNumber("WO-2026-0042");

        a.Should().Be(b);
        a.GetHashCode().Should().Be(b.GetHashCode());
    }

    [Fact]
    public void WorkOrderNumber_DifferentValue_ShouldNotBeEqual()
    {
        var a = new WorkOrderNumber("WO-001");
        var b = new WorkOrderNumber("WO-002");

        a.Should().NotBe(b);
    }

    [Fact]
    public void Quantity_SameValueAndUnit_ShouldBeEqual()
    {
        var a = new Quantity(10.5m, "kg");
        var b = new Quantity(10.5m, "kg");

        a.Should().Be(b);
        a.GetHashCode().Should().Be(b.GetHashCode());
    }

    [Fact]
    public void Quantity_SameValueDifferentUnit_ShouldNotBeEqual()
    {
        var a = new Quantity(10m, "kg");
        var b = new Quantity(10m, "g");

        a.Should().NotBe(b);
    }

    [Fact]
    public void Quantity_ToString_WithUnit_ShouldFormat()
    {
        new Quantity(5.5m, "kg").ToString().Should().Be("5.5 kg");
    }

    [Fact]
    public void Quantity_ToString_WithoutUnit_ShouldOmitSpace()
    {
        new Quantity(7m).ToString().Should().Be("7");
    }

    [Fact]
    public void TimeWindow_SameRange_ShouldBeEqual()
    {
        var start = new DateTime(2026, 5, 16, 8, 0, 0);
        var end = new DateTime(2026, 5, 16, 17, 0, 0);
        var a = new TimeWindow(start, end);
        var b = new TimeWindow(start, end);

        a.Should().Be(b);
    }

    [Fact]
    public void TimeWindow_DifferentEnd_ShouldNotBeEqual()
    {
        var start = new DateTime(2026, 5, 16);
        var a = new TimeWindow(start, start.AddHours(8));
        var b = new TimeWindow(start, start.AddHours(9));

        a.Should().NotBe(b);
    }

    [Theory]
    [InlineData("AL-6061")]
    [InlineData("BRG-6205")]
    public void MaterialCode_RoundTrip_PreservesValue(string code)
    {
        var mc = new MaterialCode(code);

        mc.Value.Should().Be(code);
        mc.ToString().Should().Be(code);
    }

    [Fact]
    public void EquipmentCode_HashSet_DedupesByValue()
    {
        var set = new HashSet<EquipmentCode>
        {
            new("CNC-001"),
            new("CNC-001"),
            new("CNC-002"),
        };

        set.Should().HaveCount(2);
    }
}
