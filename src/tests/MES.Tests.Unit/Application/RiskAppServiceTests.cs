using FluentAssertions;
using MES.Application.DTOs;
using MES.Application.Services;

namespace MES.Tests.Unit.Application;

public class RiskAppServiceTests
{
    private readonly RiskAppService _sut = new();

    [Fact]
    public async Task GetRiskDashboardAsync_ShouldReturnDemoFlagAndUtcGeneratedAt()
    {
        var before = DateTime.UtcNow;

        var result = await _sut.GetRiskDashboardAsync(CancellationToken.None);

        var after = DateTime.UtcNow;
        result.IsDemoData.Should().BeTrue("风险面板当前仍是演示数据，前端必须能明确提示");
        result.GeneratedAt.Kind.Should().Be(DateTimeKind.Utc);
        result.GeneratedAt.Should().BeOnOrAfter(before);
        result.GeneratedAt.Should().BeOnOrBefore(after);
    }

    [Fact]
    public async Task GetRiskDashboardAsync_ShouldComputeCountsFromAllRiskCategories()
    {
        var result = await _sut.GetRiskDashboardAsync(CancellationToken.None);
        var levels = GetAllLevels(result).ToList();

        result.Counts.Total.Should().Be(levels.Count, "总数必须覆盖订单、设备、物料、瓶颈四类风险");
        result.Counts.Critical.Should().Be(levels.Count(level => level == "critical"));
        result.Counts.Warning.Should().Be(levels.Count(level => level == "warning"));
        result.Counts.Healthy.Should().Be(levels.Count(level => level == "healthy"));
    }

    [Fact]
    public async Task GetRiskDashboardAsync_ShouldReturnFrontendConsumableRiskRows()
    {
        var result = await _sut.GetRiskDashboardAsync(CancellationToken.None);
        var expectedLevels = new[] { "critical", "warning", "healthy" };

        result.OrderRisks.Should().NotBeEmpty();
        result.EquipmentRisks.Should().NotBeEmpty();
        result.MaterialRisks.Should().NotBeEmpty();
        result.BottleneckRisks.Should().NotBeEmpty();
        GetAllLevels(result).Should().OnlyContain(level => expectedLevels.Contains(level));
        result.OrderRisks.Should().OnlyContain(r =>
            !string.IsNullOrWhiteSpace(r.Id) &&
            !string.IsNullOrWhiteSpace(r.OrderNumber) &&
            !string.IsNullOrWhiteSpace(r.ProductName) &&
            !string.IsNullOrWhiteSpace(r.RiskDetail));
        result.EquipmentRisks.Should().OnlyContain(r =>
            !string.IsNullOrWhiteSpace(r.Id) &&
            !string.IsNullOrWhiteSpace(r.EquipmentName) &&
            !string.IsNullOrWhiteSpace(r.Type) &&
            !string.IsNullOrWhiteSpace(r.RiskDetail));
        result.MaterialRisks.Should().OnlyContain(r =>
            !string.IsNullOrWhiteSpace(r.Code) &&
            r.Code == r.MaterialCode &&
            !string.IsNullOrWhiteSpace(r.MaterialName) &&
            !string.IsNullOrWhiteSpace(r.RiskDetail));
        result.BottleneckRisks.Should().OnlyContain(r =>
            !string.IsNullOrWhiteSpace(r.Id) &&
            !string.IsNullOrWhiteSpace(r.EquipmentName) &&
            !string.IsNullOrWhiteSpace(r.Type) &&
            !string.IsNullOrWhiteSpace(r.RiskDetail));
    }

    private static IEnumerable<string> GetAllLevels(RiskDashboardDto dashboard)
    {
        return dashboard.OrderRisks.Select(r => r.Level)
            .Concat(dashboard.EquipmentRisks.Select(r => r.Level))
            .Concat(dashboard.MaterialRisks.Select(r => r.Level))
            .Concat(dashboard.BottleneckRisks.Select(r => r.Level));
    }
}
