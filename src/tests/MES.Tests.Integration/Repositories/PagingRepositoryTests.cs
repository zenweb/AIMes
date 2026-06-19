using FluentAssertions;
using MES.Domain.Entities.Admin;
using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Routing;
using MES.Domain.Enums;
using MES.Infrastructure.Repositories;

namespace MES.Tests.Integration.Repositories;

[Collection("IntegrationSerial")]
public class PagingRepositoryTests
{
    [Fact]
    public async Task EquipmentRepository_GetPagedAsync_FiltersCountsAndUsesStableDatabasePaging()
    {
        var commands = new List<string>();
        await using var scope = await PostgreSqlIntegrationTestScope.CreateAsync(commands);

        await using (var setupContext = scope.CreateContext())
        {
            setupContext.Equipment.AddRange(
                CreateEquipment("eq-a", "ZZZ-CNC-001", "WS-001", EquipmentStatus.Running),
                CreateEquipment("eq-b", "ZZZ-CNC-002", "WS-001", EquipmentStatus.Running),
                CreateEquipment("eq-c", "ZZZ-CNC-003", "WS-001", EquipmentStatus.Running),
                CreateEquipment("eq-other-workshop", "ZZZ-CNC-004", "WS-002", EquipmentStatus.Running),
                CreateEquipment("eq-other-status", "ZZZ-CNC-005", "WS-001", EquipmentStatus.Available));
            await setupContext.SaveChangesAsync();
        }

        commands.Clear();

        await using var queryContext = scope.CreateContext();
        var repository = new EquipmentRepository(queryContext);

        var totalCount = await repository.CountAsync("WS-001", EquipmentStatus.Running);
        var firstPage = await repository.GetPagedAsync("WS-001", EquipmentStatus.Running, page: 1, pageSize: 2);
        var secondPage = await repository.GetPagedAsync("WS-001", EquipmentStatus.Running, page: 2, pageSize: 2);

        totalCount.Should().Be(3);
        firstPage.Select(e => e.Id).Should().Equal("eq-a", "eq-b");
        secondPage.Select(e => e.Id).Should().Equal("eq-c");
        firstPage.Concat(secondPage).Select(e => e.Id).Should().OnlyHaveUniqueItems();

        var equipmentSelects = commands
            .Where(command => command.Contains("Equipment", StringComparison.OrdinalIgnoreCase))
            .ToList();

        equipmentSelects.Should().Contain(
            command => command.Contains("COUNT", StringComparison.OrdinalIgnoreCase),
            "the total must be counted by the database with the same equipment filters");
        equipmentSelects.Should().Contain(
            command => command.Contains("ORDER BY", StringComparison.OrdinalIgnoreCase)
                && command.Contains("workshop_id", StringComparison.OrdinalIgnoreCase)
                && command.Contains("equipment_code", StringComparison.OrdinalIgnoreCase)
                && command.Contains("id", StringComparison.OrdinalIgnoreCase)
                && command.Contains("LIMIT", StringComparison.OrdinalIgnoreCase),
            "equipment paging must be deterministic and limited by SQL");
    }

    [Fact]
    public async Task UserRepository_GetPagedAsync_CountsAndUsesStableDatabasePaging()
    {
        var commands = new List<string>();
        await using var scope = await PostgreSqlIntegrationTestScope.CreateAsync(commands);

        await using (var setupContext = scope.CreateContext())
        {
            setupContext.SystemUsers.AddRange(
                SystemUser.Create("admin", "Admin", "hash", "Admin", "u-a"),
                SystemUser.Create("operator1", "Operator 1", "hash", "Operator", "u-b"),
                SystemUser.Create("operator2", "Operator 2", "hash", "Operator", "u-c"));
            await setupContext.SaveChangesAsync();
        }

        commands.Clear();

        await using var queryContext = scope.CreateContext();
        var repository = new UserRepository(queryContext);

        var totalCount = await repository.CountAsync();
        var firstPage = await repository.GetPagedAsync(page: 1, pageSize: 2);
        var secondPage = await repository.GetPagedAsync(page: 2, pageSize: 2);

        totalCount.Should().Be(3);
        firstPage.Select(u => u.Id).Should().Equal("u-a", "u-b");
        secondPage.Select(u => u.Id).Should().Equal("u-c");
        firstPage.Concat(secondPage).Select(u => u.Id).Should().OnlyHaveUniqueItems();

        var userSelects = commands
            .Where(command => command.Contains("system_users", StringComparison.OrdinalIgnoreCase))
            .ToList();

        userSelects.Should().Contain(
            command => command.Contains("COUNT", StringComparison.OrdinalIgnoreCase),
            "the total must be counted by the database");
        userSelects.Should().Contain(
            command => command.Contains("ORDER BY", StringComparison.OrdinalIgnoreCase)
                && command.Contains("username", StringComparison.OrdinalIgnoreCase)
                && command.Contains("id", StringComparison.OrdinalIgnoreCase)
                && command.Contains("LIMIT", StringComparison.OrdinalIgnoreCase),
            "user paging must be deterministic and limited by SQL");
    }

    [Fact]
    public async Task RoutingRepository_GetPagedAsync_CountsAndUsesStableDatabasePaging()
    {
        var commands = new List<string>();
        await using var scope = await PostgreSqlIntegrationTestScope.CreateAsync(commands);

        await using (var setupContext = scope.CreateContext())
        {
            setupContext.ProcessRoutes.AddRange(
                CreateRoute("route-a", "ROUTE-A", "PROD-A"),
                CreateRoute("route-b", "ROUTE-B", "PROD-B"),
                CreateRoute("route-c", "ROUTE-C", "PROD-C"));
            await setupContext.SaveChangesAsync();
        }

        commands.Clear();

        await using var queryContext = scope.CreateContext();
        var repository = new RoutingRepository(queryContext);

        var totalCount = await repository.CountAsync();
        var firstPage = await repository.GetPagedAsync(page: 1, pageSize: 2);
        var secondPage = await repository.GetPagedAsync(page: 2, pageSize: 2);

        totalCount.Should().Be(3);
        firstPage.Select(r => r.RouteCode).Should().Equal("ROUTE-A", "ROUTE-B");
        secondPage.Select(r => r.RouteCode).Should().Equal("ROUTE-C");
        firstPage.Concat(secondPage).Select(r => r.RouteCode).Should().OnlyHaveUniqueItems();

        var routeSelects = commands
            .Where(command => command.Contains("process_routes", StringComparison.OrdinalIgnoreCase))
            .ToList();

        routeSelects.Should().Contain(
            command => command.Contains("COUNT", StringComparison.OrdinalIgnoreCase),
            "the total must be counted by the database");
        routeSelects.Should().Contain(
            command => command.Contains("ORDER BY", StringComparison.OrdinalIgnoreCase)
                && command.Contains("route_code", StringComparison.OrdinalIgnoreCase)
                && command.Contains("id", StringComparison.OrdinalIgnoreCase)
                && command.Contains("LIMIT", StringComparison.OrdinalIgnoreCase),
            "route paging must be deterministic and limited by SQL");
    }

    private static Equipment CreateEquipment(string id, string code, string workshopId, EquipmentStatus status)
    {
        var equipment = Equipment.Create(code, code, "CNC", workshopId, workshopId, 100);
        SetPrivateProperty(equipment, nameof(Equipment.Id), id);
        SetPrivateProperty(equipment, nameof(Equipment.Status), status);

        return equipment;
    }

    private static ProcessRoute CreateRoute(string id, string routeCode, string productCode)
    {
        var route = new ProcessRoute(routeCode, routeCode, new(productCode), productCode, "V1.0");
        SetPrivateProperty(route, nameof(ProcessRoute.Id), id);
        return route;
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
