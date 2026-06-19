using FluentAssertions;
using MES.Domain.Entities.Production;
using MES.Domain.Enums;
using MES.Infrastructure.Repositories;

namespace MES.Tests.Integration.Repositories;

[Collection("IntegrationSerial")]
public class WorkOrderRepositoryTests
{
    [Fact]
    public async Task GetPagedAsync_FiltersAndUsesStableDatabasePaging()
    {
        var commands = new List<string>();
        await using var scope = await PostgreSqlIntegrationTestScope.CreateAsync(commands);

        await using (var setupContext = scope.CreateContext())
        {
            setupContext.WorkOrders.AddRange(
                CreateWorkOrder("wo-a", "WO-A", "PROD-A", "WS-001", 10, WorkOrderStatus.Created),
                CreateWorkOrder("wo-b", "WO-B", "PROD-A", "WS-001", 10, WorkOrderStatus.Created),
                CreateWorkOrder("wo-c", "WO-C", "PROD-A", "WS-001", 9, WorkOrderStatus.Created),
                CreateWorkOrder("wo-other-product", "WO-D", "PROD-B", "WS-001", 10, WorkOrderStatus.Created),
                CreateWorkOrder("wo-other-status", "WO-E", "PROD-A", "WS-001", 10, WorkOrderStatus.Scheduled),
                CreateWorkOrder("wo-other-workshop", "WO-F", "PROD-A", "WS-002", 10, WorkOrderStatus.Created));
            await setupContext.SaveChangesAsync();
        }

        commands.Clear();

        await using var queryContext = scope.CreateContext();
        var repository = new WorkOrderRepository(queryContext);
        var startDate = new DateTime(2026, 5, 1, 8, 0, 0, DateTimeKind.Utc);
        var endDate = startDate.AddDays(7);

        var totalCount = await repository.CountAsync(
            WorkOrderStatus.Created,
            "WS-001",
            "PROD-A",
            startDate,
            endDate);
        var firstPage = await repository.GetPagedAsync(
            WorkOrderStatus.Created,
            "WS-001",
            "PROD-A",
            startDate,
            endDate,
            page: 1,
            pageSize: 2);
        var secondPage = await repository.GetPagedAsync(
            WorkOrderStatus.Created,
            "WS-001",
            "PROD-A",
            startDate,
            endDate,
            page: 2,
            pageSize: 2);

        totalCount.Should().Be(3);
        firstPage.Select(w => w.Id).Should().Equal("wo-a", "wo-b");
        secondPage.Select(w => w.Id).Should().Equal("wo-c");
        firstPage.Concat(secondPage).Select(w => w.Id).Should().OnlyHaveUniqueItems();

        var workOrderSelects = commands
            .Where(command => command.Contains("work_orders", StringComparison.OrdinalIgnoreCase))
            .ToList();

        workOrderSelects.Should().Contain(
            command => command.Contains("COUNT", StringComparison.OrdinalIgnoreCase),
            "the total must be counted by the database with the same filters");
        workOrderSelects.Should().Contain(
            command => command.Contains("ORDER BY", StringComparison.OrdinalIgnoreCase)
                && command.Contains("priority", StringComparison.OrdinalIgnoreCase)
                && command.Contains("planned_start_date", StringComparison.OrdinalIgnoreCase)
                && command.Contains("id", StringComparison.OrdinalIgnoreCase)
                && command.Contains("LIMIT", StringComparison.OrdinalIgnoreCase),
            "paged work-order results must be deterministic and limited by SQL");
    }

    private static WorkOrder CreateWorkOrder(
        string id,
        string orderNumber,
        string productCode,
        string workshopId,
        int priority,
        WorkOrderStatus status)
    {
        var startDate = new DateTime(2026, 5, 1, 8, 0, 0, DateTimeKind.Utc);
        var workOrder = WorkOrder.Create(
            orderNumber,
            productCode,
            $"Product {productCode}",
            10,
            startDate,
            startDate.AddDays(7),
            workshopId,
            priority);
        SetPrivateProperty(workOrder, nameof(WorkOrder.Id), id);
        SetPrivateProperty(workOrder, nameof(WorkOrder.Status), status);

        return workOrder;
    }

    private static void SetPrivateProperty<T>(object target, string propertyName, T value)
    {
        var property = target.GetType().GetProperty(propertyName);
        if (property is null)
        {
            throw new InvalidOperationException($"Property '{propertyName}' was not found.");
        }

        property.SetValue(target, value);
    }
}
