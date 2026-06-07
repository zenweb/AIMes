using FluentAssertions;
using MES.Application.DTOs;
using MES.Application.Services;
using MES.Domain.Entities.Routing;
using MES.Domain.Interfaces.Repositories;
using Moq;

namespace MES.Tests.Unit.Application;

public class RoutingAppServiceTests
{
    private readonly Mock<IRoutingRepository> _routingRepoMock = new();
    private readonly RoutingAppService _sut;

    public RoutingAppServiceTests()
    {
        _sut = new RoutingAppService(_routingRepoMock.Object);
    }

    [Fact]
    public async Task CreateRouteAsync_ShouldPreserveStepTimingEquipmentInspectionAndParameters()
    {
        var request = new CreateRouteRequest
        {
            RouteCode = "ROUTE-UNIT-001",
            RouteName = "精密装配路线",
            ProductCode = "PROD-UNIT-001",
            ProductName = "精密装配件",
            Steps =
            [
                new CreateRoutingStepRequest
                {
                    Sequence = 2,
                    OperationCode = "OP-020",
                    OperationName = "终检",
                    WorkstationType = "QC",
                    StandardSetupMinutes = 8,
                    StandardRunMinutesPerUnit = 1.5,
                    EquipmentType = "CMM",
                    InspectionRequired = true,
                    Parameters =
                    [
                        new CreateStepParameterRequest
                        {
                            ParameterCode = "GAP",
                            ParameterName = "装配间隙",
                            DefaultValue = "0.03",
                            Unit = "mm",
                            UpperLimit = 0.05,
                            LowerLimit = 0.01,
                            IsMandatory = true
                        }
                    ]
                },
                new CreateRoutingStepRequest
                {
                    Sequence = 1,
                    OperationCode = "OP-010",
                    OperationName = "预装",
                    WorkstationType = "ASM",
                    StandardSetupMinutes = 20,
                    StandardRunMinutesPerUnit = 4,
                    EquipmentType = "Bench",
                    InspectionRequired = false
                }
            ]
        };
        ProcessRoute? capturedRoute = null;
        _routingRepoMock
            .Setup(r => r.AddAsync(It.IsAny<ProcessRoute>(), It.IsAny<CancellationToken>()))
            .Callback<ProcessRoute, CancellationToken>((route, _) => capturedRoute = route)
            .ReturnsAsync((ProcessRoute route, CancellationToken _) => route);

        var result = await _sut.CreateRouteAsync(request, CancellationToken.None);

        result.RouteCode.Should().Be("ROUTE-UNIT-001");
        result.StepCount.Should().Be(2);
        capturedRoute.Should().NotBeNull();
        var steps = capturedRoute!.Steps.OrderBy(s => s.StepSequence).ToList();
        steps[0].OperationCode.Value.Should().Be("OP-010");
        steps[0].StandardSetupMinutes.Should().Be(20);
        steps[0].StandardRunMinutesPerUnit.Should().Be(4);
        steps[0].EquipmentType.Should().Be("Bench");
        steps[0].InspectionRequired.Should().BeFalse();
        steps[1].OperationCode.Value.Should().Be("OP-020");
        steps[1].StandardSetupMinutes.Should().Be(8);
        steps[1].StandardRunMinutesPerUnit.Should().Be(1.5);
        steps[1].EquipmentType.Should().Be("CMM");
        steps[1].InspectionRequired.Should().BeTrue();
        steps[1].Parameters.Should().ContainSingle().Which.Should().Match<StepParameter>(p =>
            p.ParameterCode == "GAP"
            && p.ParameterName == "装配间隙"
            && p.DefaultValue == "0.03"
            && p.Unit == "mm"
            && p.UpperLimit == 0.05
            && p.LowerLimit == 0.01
            && p.IsMandatory);
    }

    [Fact]
    public async Task GetRouteByCodeAsync_WhenFound_ShouldReturnStepsOrderedBySequenceWithParameters()
    {
        var route = new ProcessRoute("ROUTE-UNIT-002", "查询路线", new("PROD-UNIT-002"), "查询产品", "V1.0");
        var second = new RoutingStep(2, new("OP-020"), "终检", "QC");
        var first = new RoutingStep(1, new("OP-010"), "预装", "ASM");
        route.AddStep(second);
        route.AddStep(first);
        _routingRepoMock.Setup(r => r.GetByRouteCodeAsync("ROUTE-UNIT-002", It.IsAny<CancellationToken>()))
            .ReturnsAsync(route);

        var result = await _sut.GetRouteByCodeAsync("ROUTE-UNIT-002", CancellationToken.None);

        result.Should().NotBeNull();
        result!.RouteCode.Should().Be("ROUTE-UNIT-002");
        result.Steps.Select(s => s.OperationCode).Should().Equal("OP-010", "OP-020");
    }

    [Fact]
    public async Task GetAllRoutesAsync_ShouldReturnRequestedPageMetadata()
    {
        var routes = Enumerable.Range(1, 5)
            .Select(i => new ProcessRoute($"ROUTE-{i}", $"路线 {i}", new($"PROD-{i}"), $"产品 {i}", "V1.0"))
            .ToList();
        _routingRepoMock.Setup(r => r.GetPagedAsync(2, 2, It.IsAny<CancellationToken>())).ReturnsAsync(routes.Skip(2).Take(2).ToList());
        _routingRepoMock.Setup(r => r.CountAsync(It.IsAny<CancellationToken>())).ReturnsAsync(routes.Count);

        var result = await _sut.GetAllRoutesAsync(page: 2, pageSize: 2, CancellationToken.None);

        result.Page.Should().Be(2);
        result.PageSize.Should().Be(2);
        result.TotalCount.Should().Be(5);
        result.Items.Select(r => r.RouteCode).Should().Equal("ROUTE-3", "ROUTE-4");
        _routingRepoMock.Verify(r => r.GetPagedAsync(2, 2, It.IsAny<CancellationToken>()), Times.Once);
        _routingRepoMock.Verify(r => r.CountAsync(It.IsAny<CancellationToken>()), Times.Once);
        _routingRepoMock.Verify(r => r.GetAllAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task GetAllRoutesAsync_ShouldUseRepositoryPagingAndCount()
    {
        var routes = new List<ProcessRoute>
        {
            new("ROUTE-3", "路线 3", new("PROD-3"), "产品 3", "V1.0"),
            new("ROUTE-4", "路线 4", new("PROD-4"), "产品 4", "V1.0"),
        };
        var ct = new CancellationTokenSource().Token;

        _routingRepoMock
            .Setup(r => r.GetPagedAsync(2, 2, ct))
            .ReturnsAsync(routes);
        _routingRepoMock
            .Setup(r => r.CountAsync(ct))
            .ReturnsAsync(5);

        var result = await _sut.GetAllRoutesAsync(2, 2, ct);

        result.Page.Should().Be(2);
        result.PageSize.Should().Be(2);
        result.TotalCount.Should().Be(5);
        result.Items.Select(r => r.RouteCode).Should().Equal("ROUTE-3", "ROUTE-4");
        _routingRepoMock.Verify(r => r.GetPagedAsync(2, 2, ct), Times.Once);
        _routingRepoMock.Verify(r => r.CountAsync(ct), Times.Once);
        _routingRepoMock.Verify(r => r.GetAllAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Theory]
    [InlineData(0, 20)]
    [InlineData(1, 0)]
    public async Task GetAllRoutesAsync_WithInvalidPaging_ShouldRejectBeforeRepository(int page, int pageSize)
    {
        var act = () => _sut.GetAllRoutesAsync(page, pageSize);

        await act.Should().ThrowAsync<ArgumentOutOfRangeException>();
        _routingRepoMock.Verify(
            r => r.GetPagedAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<CancellationToken>()),
            Times.Never);
        _routingRepoMock.Verify(r => r.CountAsync(It.IsAny<CancellationToken>()), Times.Never);
    }
}
