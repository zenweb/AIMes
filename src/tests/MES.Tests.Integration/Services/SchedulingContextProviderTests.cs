using FluentAssertions;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Interfaces.Repositories;
using MES.Domain.Interfaces.Services;
using MES.Infrastructure.Data;
using MES.Infrastructure.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;

namespace MES.Tests.Integration.Services;

[Collection("IntegrationSerial")]
public sealed class SchedulingContextProviderTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;

    public SchedulingContextProviderTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetContextAsync_ShouldOrderOperationExecutionsByNumericOperationSequence()
    {
        using var _ = _factory.CreateClient();
        var workshopId = $"WS-SEQUENCE-{Guid.NewGuid():N}";
        const string workOrderNumber = "WO-SEQUENCE-OP-ORDER";
        var now = new DateTime(2026, 6, 21, 8, 0, 0, DateTimeKind.Utc);

        _factory.SeedData(db =>
        {
            db.WorkOrders.Add(WorkOrder.Create(
                workOrderNumber,
                "PROD-SEQUENCE",
                "Sequence Product",
                10,
                now,
                now.AddHours(8),
                workshopId));
            db.OperationExecutions.Add(new OperationExecution(workOrderNumber, "OP-10", "Final heat treatment"));
            db.OperationExecutions.Add(new OperationExecution(workOrderNumber, "OP-2", "Initial heat treatment"));
        });

        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<MesDbContext>();
        dbContext.ChangeTracker.Clear();
        var provider = CreateProvider(dbContext);

        var snapshot = await provider.GetContextAsync(workshopId);

        snapshot.CurrentExecutions
            .Where(item => item.WorkOrderNumber == workOrderNumber)
            .Select(item => item.OperationCode)
            .Should()
            .Equal(["OP-2", "OP-10"], "AI 排产上下文必须按工序数字顺序解释 WIP，而不是按字符串顺序误把 OP-10 放到 OP-2 前");

        snapshot.WipItems
            .Where(item => item.WorkOrderNumber == workOrderNumber)
            .Select(item => item.OperationCode)
            .Should()
            .Equal(["OP-2", "OP-10"], "WIP 快照和 CurrentExecutions 要保持同一条数字工序顺序证据链");
    }

    private static SchedulingContextProvider CreateProvider(MesDbContext dbContext)
    {
        var bomExplosion = new Mock<IBomExplosionService>();
        bomExplosion
            .Setup(service => service.ExplodeBatchAsync(It.IsAny<IEnumerable<string>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Dictionary<string, List<BomRequirementSummary>>());

        var routeExpander = new Mock<IOperationSequenceExpander>();
        routeExpander
            .Setup(service => service.ExpandBatchAsync(It.IsAny<IEnumerable<string>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        return new SchedulingContextProvider(
            dbContext,
            new NoopSchedulingContextCache(),
            NullLogger<SchedulingContextProvider>.Instance,
            bomExplosion.Object,
            routeExpander.Object);
    }

    private sealed class NoopSchedulingContextCache : ISchedulingContextCache
    {
        public bool TryGetFullSnapshot<TSnapshot>(string workshopId, out TSnapshot? snapshot)
        {
            snapshot = default;
            return false;
        }

        public void SetFullSnapshot(string workshopId, object snapshot, TimeSpan ttl)
        {
        }

        public void SetSnapshot(string workshopId, string snapshotType, object data, TimeSpan ttl)
        {
        }

        public void RemoveFullSnapshot(string workshopId)
        {
        }

        public void InvalidateAll()
        {
        }
    }
}
