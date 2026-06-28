using FluentAssertions;
using MES.Domain.Entities.Production;
using MES.Infrastructure.Repositories;

namespace MES.Tests.Integration.Repositories;

[Collection("IntegrationSerial")]
public sealed class OperationRepositoryTests
{
    [Fact]
    public async Task GetExecutionsByWorkOrderIdAsync_ShouldReturnNumericOperationSequenceOrder()
    {
        await using var scope = await PostgreSqlIntegrationTestScope.CreateAsync();
        const string workOrderId = "WO-REPO-SEQUENCE";

        await using (var setupContext = scope.CreateContext())
        {
            setupContext.OperationExecutions.Add(new OperationExecution(workOrderId, "OP-10", "Final heat treatment"));
            setupContext.OperationExecutions.Add(new OperationExecution(workOrderId, "OP-2", "Initial heat treatment"));
            await setupContext.SaveChangesAsync();
        }

        await using var queryContext = scope.CreateContext();
        var repository = new OperationRepository(queryContext);

        var executions = await repository.GetExecutionsByWorkOrderIdAsync(workOrderId);

        executions
            .Select(item => item.OperationCode)
            .Should()
            .Equal(["OP-2", "OP-10"], "operation repository order is a shared read boundary for scan handoff and scheduling context evidence");
    }

    [Fact]
    public async Task GetFirstExecutionByWorkOrderIdAsync_ShouldReturnLowestNumericOperationSequence()
    {
        await using var scope = await PostgreSqlIntegrationTestScope.CreateAsync();
        const string workOrderId = "WO-REPO-FIRST-SEQUENCE";

        await using (var setupContext = scope.CreateContext())
        {
            setupContext.OperationExecutions.Add(new OperationExecution(workOrderId, "OP-10", "Final heat treatment"));
            setupContext.OperationExecutions.Add(new OperationExecution(workOrderId, "OP-2", "Initial heat treatment"));
            await setupContext.SaveChangesAsync();
        }

        await using var queryContext = scope.CreateContext();
        var repository = new OperationRepository(queryContext);

        var execution = await repository.GetFirstExecutionByWorkOrderIdAsync(workOrderId);

        execution?.OperationCode.Should().Be("OP-2", "first operation lookup must not return OP-10 before OP-2 for non-padded operation codes");
    }
}
