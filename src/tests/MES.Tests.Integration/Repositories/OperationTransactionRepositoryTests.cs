using FluentAssertions;
using MES.Application.DTOs;
using MES.Application.Services;
using MES.Domain.Entities.Production;
using MES.Domain.Enums;
using MES.Domain.Interfaces.Repositories;
using MES.Infrastructure.Data;
using MES.Infrastructure.Persistence;
using MES.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace MES.Tests.Integration.Repositories;

[Collection("IntegrationSerial")]
public class OperationTransactionRepositoryTests
{
    [Fact]
    public async Task CompleteAsync_WhenReportWriteFails_ShouldRollbackExecutionAndWorkOrderUpdates()
    {
        await using var scope = await PostgreSqlIntegrationTestScope.CreateAsync();

        string executionId;
        string workOrderId;
        await using (var setupContext = scope.CreateContext())
        {
            var workOrder = WorkOrder.Create(
                "WO-OP-TX-ROLLBACK",
                "PROD-OP",
                "Operation Transaction Product",
                10,
                new DateTime(2026, 5, 31, 8, 0, 0, DateTimeKind.Utc),
                new DateTime(2026, 6, 1, 8, 0, 0, DateTimeKind.Utc),
                "WS-001",
                routeCode: "OP-TX");
            workOrder.Start();

            var execution = new OperationExecution(workOrder.Id, "OP-TX", "Transaction Test Operation");
            execution.BindOperatorAndStation("operator-tx", "ST-TX");
            execution.Start();

            setupContext.WorkOrders.Add(workOrder);
            setupContext.OperationExecutions.Add(execution);
            await setupContext.SaveChangesAsync();

            executionId = execution.Id;
            workOrderId = workOrder.Id;
        }

        await using (var actContext = scope.CreateContext())
        {
            var realOperationRepository = new OperationRepository(actContext);
            var failingOperationRepository = new FailingReportOperationRepository(realOperationRepository);
            var service = new OperationService(
                failingOperationRepository,
                new WorkOrderRepository(actContext),
                new EfUnitOfWork(actContext));

            var act = () => service.CompleteAsync(executionId, new CompleteOperationRequest
            {
                Quantity = 4,
                DefectQuantity = 0,
                Parameters = new Dictionary<string, string> { ["pressure"] = "8" },
                Materials = [new MaterialConsumedDto { MaterialCode = "MAT-TX", Quantity = 1, Unit = "pcs" }],
                InspectionResult = InspectionResult.Pass,
                ReportedBy = "operator-tx"
            });

            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("operation report write failed");
            failingOperationRepository.ExecutionUpdateWasCalled.Should().BeTrue();
        }

        await using var verifyContext = scope.CreateContext();
        var executionAfterFailure = await verifyContext.OperationExecutions
            .AsNoTracking()
            .SingleAsync(e => e.Id == executionId);
        var workOrderAfterFailure = await verifyContext.WorkOrders
            .AsNoTracking()
            .SingleAsync(w => w.Id == workOrderId);
        var reportCount = await verifyContext.OperationReports
            .AsNoTracking()
            .CountAsync(r => r.OperationId == executionId);

        executionAfterFailure.Status.Should().Be(OperationExecutionStatus.Running, "completion cannot persist without its operation report");
        executionAfterFailure.CompletedQuantity.Should().Be(0);
        workOrderAfterFailure.Status.Should().Be(WorkOrderStatus.InProgress);
        workOrderAfterFailure.CompletedQuantity.Should().Be(0, "work-order progress must rollback with the failed report");
        reportCount.Should().Be(0);
    }

    private sealed class FailingReportOperationRepository : IOperationRepository
    {
        private readonly IOperationRepository _inner;

        public FailingReportOperationRepository(IOperationRepository inner)
        {
            _inner = inner;
        }

        public bool ExecutionUpdateWasCalled { get; private set; }

        public Task<OperationExecution?> GetExecutionByIdAsync(string id, CancellationToken ct = default)
        {
            return _inner.GetExecutionByIdAsync(id, ct);
        }

        public Task<OperationExecution?> GetExecutionByCodeAsync(string operationCode, CancellationToken ct = default)
        {
            return _inner.GetExecutionByCodeAsync(operationCode, ct);
        }

        public Task<OperationExecution> AddExecutionAsync(OperationExecution execution, CancellationToken ct = default)
        {
            return _inner.AddExecutionAsync(execution, ct);
        }

        public async Task<OperationExecution> UpdateExecutionAsync(OperationExecution execution, CancellationToken ct = default)
        {
            ExecutionUpdateWasCalled = true;
            return await _inner.UpdateExecutionAsync(execution, ct);
        }

        public Task<OperationReport> AddReportAsync(OperationReport report, CancellationToken ct = default)
        {
            throw new InvalidOperationException("operation report write failed");
        }
    }
}
