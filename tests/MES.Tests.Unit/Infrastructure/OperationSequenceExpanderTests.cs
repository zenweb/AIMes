using MES.Domain.Entities.Routing;
using MES.Domain.Interfaces.Repositories;
using MES.Domain.ValueObjects;
using MES.Infrastructure.Services;
using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Xunit;

namespace MES.Tests.Unit.Infrastructure;

public class OperationSequenceExpanderTests
{
    private readonly Mock<IRoutingRepository> _routingRepoMock;
    private readonly OperationSequenceExpander _expander;

    public OperationSequenceExpanderTests()
    {
        _routingRepoMock = new Mock<IRoutingRepository>();
        _expander = new OperationSequenceExpander(_routingRepoMock.Object,
            NullLogger<OperationSequenceExpander>.Instance);
    }

    [Fact]
    public async Task ExpandAsync_ValidRoute_ReturnsOrderedSteps()
    {
        var route = CreateRoute("R001", "Test Route",
        [
            CreateStep(1, "OP-010", "Cutting", 30, 2.5, "CNC"),
            CreateStep(2, "OP-020", "Grinding", 15, 1.0, "Grinder"),
            CreateStep(3, "OP-030", "Inspection", 5, 0.5, "CMM"),
        ]);

        _routingRepoMock.Setup(r => r.GetByRouteCodeAsync("R001", It.IsAny<CancellationToken>()))
            .ReturnsAsync(route);

        var result = await _expander.ExpandAsync("R001");

        result.Should().NotBeNull();
        result!.RouteCode.Should().Be("R001");
        result.StepCount.Should().Be(3);
        result.OperationCodes.Should().HaveCount(3);
        result.OperationCodes[0].Should().Be("OP-010");
        result.OperationCodes[1].Should().Be("OP-020");
        result.OperationCodes[2].Should().Be("OP-030");
    }

    [Fact]
    public async Task ExpandAsync_NonexistentRoute_ReturnsNull()
    {
        _routingRepoMock.Setup(r => r.GetByRouteCodeAsync("NOEXIST", It.IsAny<CancellationToken>()))
            .ReturnsAsync((ProcessRoute?)null);

        var result = await _expander.ExpandAsync("NOEXIST");

        result.Should().BeNull();
    }

    [Fact]
    public async Task ExpandAsync_StepsOutOfOrder_ReturnsSortedBySequence()
    {
        // AddStep reassigns sequences based on add order, so we
        // add steps in order and then set different StepSequence values
        var steps = new List<RoutingStep>
        {
            CreateStep(1, "OP-010", "First", 30, 2.5, "CNC"),
            CreateStep(2, "OP-020", "Middle", 15, 1.0, "Grinder"),
            CreateStep(3, "OP-030", "Last", 5, 0.5, "CMM"),
        };
        var route = new ProcessRoute("R002", "Scrambled Route",
            new ProductCode("PROD-TEST"), "Product R002", "V1");
        foreach (var step in steps)
        {
            route.AddStep(step);
        }

        // Manually modify StepSequence to simulate incorrect ordering in DB
        typeof(RoutingStep).GetProperty(nameof(RoutingStep.StepSequence))
            ?.SetValue(steps[0], 3); // OP-010 was first, now set to sequence 3
        typeof(RoutingStep).GetProperty(nameof(RoutingStep.StepSequence))
            ?.SetValue(steps[1], 1); // OP-020 was second, now set to sequence 1
        typeof(RoutingStep).GetProperty(nameof(RoutingStep.StepSequence))
            ?.SetValue(steps[2], 2); // OP-030 was third, now set to sequence 2

        _routingRepoMock.Setup(r => r.GetByRouteCodeAsync("R002", It.IsAny<CancellationToken>()))
            .ReturnsAsync(route);

        var result = await _expander.ExpandAsync("R002");

        result.Should().NotBeNull();
        result!.OperationCodes[0].Should().Be("OP-020"); // sequence 1
        result.OperationCodes[1].Should().Be("OP-030"); // sequence 2
        result.OperationCodes[2].Should().Be("OP-010"); // sequence 3
    }

    [Fact]
    public async Task ExpandAsync_CalculatesTotalLeadTime()
    {
        var route = CreateRoute("R003", "Lead Time Test",
        [
            CreateStep(1, "OP-010", "Setup", 30, 2.5, "CNC"),
            CreateStep(2, "OP-020", "Run", 15, 1.0, "CNC"),
        ], totalLeadTimeMinutes: null); // 没有预设总工时，应该从步骤计算

        _routingRepoMock.Setup(r => r.GetByRouteCodeAsync("R003", It.IsAny<CancellationToken>()))
            .ReturnsAsync(route);

        var result = await _expander.ExpandAsync("R003");

        result.Should().NotBeNull();
        // 30+2.5 + 15+1.0 = 48.5 (StandardSetupMinutes + StandardRunMinutesPerUnit)
        result!.TotalLeadTimeMinutes.Should().Be(48.5);
    }

    [Fact]
    public async Task ExpandAsync_UsesRouteTotalLeadTime_WhenAvailable()
    {
        var route = CreateRoute("R004", "Explicit Lead Time",
        [
            CreateStep(1, "OP-010", "Step1", 30, 2.5, "CNC"),
        ], totalLeadTimeMinutes: 120);

        _routingRepoMock.Setup(r => r.GetByRouteCodeAsync("R004", It.IsAny<CancellationToken>()))
            .ReturnsAsync(route);

        var result = await _expander.ExpandAsync("R004");

        result.Should().NotBeNull();
        result!.TotalLeadTimeMinutes.Should().Be(120);
    }

    [Fact]
    public async Task ExpandBatchAsync_MultipleRoutes_ReturnsAll()
    {
        var routeA = CreateRoute("R-A", "Route A", [CreateStep(1, "OP-A", "Op A", 10, 1, "CNC")]);
        var routeB = CreateRoute("R-B", "Route B", [CreateStep(1, "OP-B", "Op B", 20, 2, "Grinder")]);

        _routingRepoMock.Setup(r => r.GetByRouteCodeAsync("R-A", It.IsAny<CancellationToken>()))
            .ReturnsAsync(routeA);
        _routingRepoMock.Setup(r => r.GetByRouteCodeAsync("R-B", It.IsAny<CancellationToken>()))
            .ReturnsAsync(routeB);

        var result = await _expander.ExpandBatchAsync(["R-A", "R-B"]);

        result.Should().HaveCount(2);
        result.Should().Contain(r => r.RouteCode == "R-A");
        result.Should().Contain(r => r.RouteCode == "R-B");
    }

    #region Helpers

    private static ProcessRoute CreateRoute(string routeCode, string routeName,
        List<RoutingStep> steps, double? totalLeadTimeMinutes = null)
    {
        var route = new ProcessRoute(routeCode, routeName,
            new ProductCode("PROD-TEST"), $"Product {routeCode}", "V1");
        foreach (var step in steps)
            route.AddStep(step);
        if (totalLeadTimeMinutes.HasValue)
        {
            typeof(ProcessRoute).GetProperty(nameof(ProcessRoute.TotalLeadTimeMinutes))
                ?.SetValue(route, totalLeadTimeMinutes.Value);
        }
        return route;
    }

    private static RoutingStep CreateStep(int seq, string opCode, string opName,
        double setupMin, double runMinPerUnit, string equipType)
    {
        var step = new RoutingStep(seq, new OperationCode(opCode), opName, equipType);
        var t = typeof(RoutingStep);
        t.GetProperty(nameof(RoutingStep.StandardSetupMinutes))?.SetValue(step, setupMin);
        t.GetProperty(nameof(RoutingStep.StandardRunMinutesPerUnit))?.SetValue(step, runMinPerUnit);
        t.GetProperty(nameof(RoutingStep.EquipmentType))?.SetValue(step, equipType);
        return step;
    }

    #endregion
}
