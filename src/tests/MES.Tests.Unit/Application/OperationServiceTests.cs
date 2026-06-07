using FluentAssertions;
using MES.Application.DTOs;
using MES.Application.Services;
using MES.Domain.Entities.Production;
using MES.Domain.Enums;
using MES.Domain.Interfaces.Repositories;
using MES.Domain.Interfaces.Services;
using Moq;

namespace MES.Tests.Unit.Application;

public class OperationServiceTests
{
    private readonly Mock<IOperationRepository> _operationRepoMock = new();
    private readonly Mock<IWorkOrderRepository> _workOrderRepoMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly OperationService _sut;

    public OperationServiceTests()
    {
        _unitOfWorkMock
            .Setup(u => u.ExecuteAsync(It.IsAny<Func<CancellationToken, Task<OperationResultDto>>>(), It.IsAny<CancellationToken>()))
            .Returns<Func<CancellationToken, Task<OperationResultDto>>, CancellationToken>((action, ct) => action(ct));
        _unitOfWorkMock
            .Setup(u => u.ExecuteAsync(It.IsAny<Func<CancellationToken, Task<OperationExecution>>>(), It.IsAny<CancellationToken>()))
            .Returns<Func<CancellationToken, Task<OperationExecution>>, CancellationToken>((action, ct) => action(ct));

        _sut = new OperationService(
            _operationRepoMock.Object,
            _workOrderRepoMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task ScanAsync_WhenCodeMatchesWorkOrder_ShouldCreateExecutionAndBindOperatorStation()
    {
        using var cts = new CancellationTokenSource();
        var ct = cts.Token;
        var workOrder = CreateWorkOrder("WO-SCAN-001", routeCode: "OP-010");
        OperationExecution? capturedExecution = null;
        _operationRepoMock.Setup(r => r.GetExecutionByCodeAsync("WO-SCAN-001", ct))
            .ReturnsAsync((OperationExecution?)null);
        _workOrderRepoMock.Setup(r => r.GetByCodeAsync("WO-SCAN-001", ct)).ReturnsAsync(workOrder);
        _operationRepoMock
            .Setup(r => r.AddExecutionAsync(It.IsAny<OperationExecution>(), ct))
            .Callback<OperationExecution, CancellationToken>((execution, _) => capturedExecution = execution)
            .ReturnsAsync((OperationExecution execution, CancellationToken _) => execution);
        _workOrderRepoMock.Setup(r => r.GetByIdAsync(workOrder.Id, ct)).ReturnsAsync(workOrder);
        _operationRepoMock.Setup(r => r.UpdateExecutionAsync(It.IsAny<OperationExecution>(), ct))
            .ReturnsAsync((OperationExecution execution, CancellationToken _) => execution);

        var result = await _sut.ScanAsync(new ScanOperationRequest
        {
            Code = "WO-SCAN-001",
            OperatorId = "operator-001",
            StationId = "ST-01"
        }, ct);

        result.WorkOrderId.Should().Be(workOrder.Id);
        result.WorkOrderNumber.Should().Be("WO-SCAN-001");
        result.OperationCode.Should().Be("OP-010");
        capturedExecution.Should().NotBeNull();
        capturedExecution!.OperatorId.Should().Be("operator-001");
        capturedExecution.StationId.Should().Be("ST-01");
        _operationRepoMock.Verify(r => r.AddExecutionAsync(It.IsAny<OperationExecution>(), ct), Times.Once);
        _operationRepoMock.Verify(r => r.UpdateExecutionAsync(It.IsAny<OperationExecution>(), ct), Times.Once);
        _workOrderRepoMock.Verify(r => r.GetByCodeAsync("WO-SCAN-001", ct), Times.Once);
        _workOrderRepoMock.Verify(r => r.GetAllAsync(It.IsAny<WorkOrderStatus?>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task StartAsync_ShouldStartExecutionAndMoveCreatedWorkOrderToInProgress()
    {
        using var cts = new CancellationTokenSource();
        var ct = cts.Token;
        var workOrder = CreateWorkOrder("WO-START-001", routeCode: "OP-020");
        var execution = new OperationExecution(workOrder.Id, "OP-020", "CNC");
        _operationRepoMock.Setup(r => r.GetExecutionByIdAsync(execution.Id, ct)).ReturnsAsync(execution);
        _workOrderRepoMock.Setup(r => r.GetByIdAsync(workOrder.Id, ct)).ReturnsAsync(workOrder);
        _operationRepoMock.Setup(r => r.UpdateExecutionAsync(execution, ct)).ReturnsAsync(execution);
        _workOrderRepoMock.Setup(r => r.UpdateAsync(workOrder, ct)).ReturnsAsync(workOrder);

        var result = await _sut.StartAsync(execution.Id, new StartOperationRequest
        {
            OperatorId = "operator-002",
            StationId = "ST-02",
            EquipmentId = "EQ-01"
        }, ct);

        result.Status.Should().Be(OperationExecutionStatus.Running.ToString());
        execution.Status.Should().Be(OperationExecutionStatus.Running);
        execution.EquipmentId.Should().Be("EQ-01");
        workOrder.Status.Should().Be(WorkOrderStatus.InProgress, "完工上报会累加工单完成数，开工时必须同步启动关联工单");
        _workOrderRepoMock.Verify(r => r.UpdateAsync(workOrder, ct), Times.Once);
    }

    [Fact]
    public async Task CompleteAsync_ShouldUpdateExecutionWorkOrderAndReportWithinUnitOfWork()
    {
        using var cts = new CancellationTokenSource();
        var ct = cts.Token;
        var workOrder = CreateWorkOrder("WO-COMPLETE-001", routeCode: "OP-030");
        workOrder.Start();
        var execution = new OperationExecution(workOrder.Id, "OP-030", "装配");
        execution.BindOperatorAndStation("operator-003", "ST-03");
        execution.Start();
        OperationReport? capturedReport = null;
        _operationRepoMock.Setup(r => r.GetExecutionByIdAsync(execution.Id, ct)).ReturnsAsync(execution);
        _workOrderRepoMock.Setup(r => r.GetByIdAsync(workOrder.Id, ct)).ReturnsAsync(workOrder);
        _workOrderRepoMock.Setup(r => r.UpdateAsync(workOrder, ct)).ReturnsAsync(workOrder);
        _operationRepoMock.Setup(r => r.UpdateExecutionAsync(execution, ct)).ReturnsAsync(execution);
        _operationRepoMock
            .Setup(r => r.AddReportAsync(It.IsAny<OperationReport>(), ct))
            .Callback<OperationReport, CancellationToken>((report, _) => capturedReport = report)
            .ReturnsAsync((OperationReport report, CancellationToken _) => report);

        var result = await _sut.CompleteAsync(execution.Id, new CompleteOperationRequest
        {
            Quantity = 5,
            DefectQuantity = 1,
            Parameters = new Dictionary<string, string> { ["torque"] = "12" },
            Materials = [new MaterialConsumedDto { MaterialCode = "MAT-001", Quantity = 2, Unit = "pcs", BatchNumber = "B-01" }],
            InspectionResult = InspectionResult.Fail,
            ReportedBy = "operator-003"
        }, ct);

        result.Status.Should().Be(OperationExecutionStatus.Completed.ToString());
        execution.CompletedQuantity.Should().Be(5);
        workOrder.CompletedQuantity.Should().Be(5);
        capturedReport.Should().NotBeNull();
        capturedReport!.ReportedQuantity.Should().Be(5);
        capturedReport.DefectQuantity.Should().Be(1);
        capturedReport.MaterialConsumed.Should().ContainSingle().Which.MaterialCode.Should().Be("MAT-001");
        _unitOfWorkMock.Verify(u => u.ExecuteAsync(It.IsAny<Func<CancellationToken, Task<OperationResultDto>>>(), ct), Times.Once);
        _workOrderRepoMock.Verify(r => r.UpdateAsync(workOrder, ct), Times.Once);
        _operationRepoMock.Verify(r => r.UpdateExecutionAsync(execution, ct), Times.Once);
        _operationRepoMock.Verify(r => r.AddReportAsync(It.IsAny<OperationReport>(), ct), Times.Once);
    }

    private static WorkOrder CreateWorkOrder(string orderNumber, string routeCode)
    {
        return WorkOrder.Create(
            orderNumber,
            "PROD-OP",
            "Operation Product",
            10,
            new DateTime(2026, 5, 31, 8, 0, 0, DateTimeKind.Utc),
            new DateTime(2026, 6, 1, 8, 0, 0, DateTimeKind.Utc),
            "WS-001",
            routeCode: routeCode);
    }
}
