using FluentAssertions;
using MES.Domain.Entities.Admin;
using MES.Domain.Entities.Anomalies;
using MES.Domain.Entities.Bom;
using MES.Domain.Entities.Employee;
using MES.Domain.Entities.Equipment;
using MES.Domain.Entities.Production;
using MES.Domain.Entities.Purchase;
using MES.Domain.Entities.Quality;
using MES.Domain.Entities.Scheduling;
using MES.Domain.Enums;
using MES.Domain.ValueObjects;
using MES.Infrastructure.Data;
using MES.Infrastructure.Repositories;

namespace MES.Tests.Integration.Repositories;

[Collection("IntegrationSerial")]
public sealed class RepositoryAsNoTrackingTests
{
    [Fact]
    public async Task CoreRepositoryReads_ShouldNotTrackEntitiesInQueryContext()
    {
        await using var scope = await PostgreSqlIntegrationTestScope.CreateAsync();

        await using (var setupContext = scope.CreateContext())
        {
            SeedCoreRepositoryRows(setupContext);
            await setupContext.SaveChangesAsync();
        }

        await using var queryContext = scope.CreateContext();

        await new WorkOrderRepository(queryContext).GetAllAsync();
        queryContext.ChangeTracker.Entries().Should().BeEmpty("work-order reads are list queries used by scheduling dashboards and must not leak tracked entities");

        await new AnomalyRepository(queryContext).GetAllAsync();
        queryContext.ChangeTracker.Entries().Should().BeEmpty("anomaly reads feed dashboard and report flows and must stay read-only");

        await new EquipmentRepository(queryContext).GetAllAsync();
        queryContext.ChangeTracker.Entries().Should().BeEmpty("equipment reads are reused across monitoring flows and must stay read-only");

        await new MaterialRepository(queryContext).GetAllAsync();
        queryContext.ChangeTracker.Entries().Should().BeEmpty("material reads feed inventory views and must not leave accidental tracked inventory state");

        await new BomRepository(queryContext).GetAllAsync();
        queryContext.ChangeTracker.Entries().Should().BeEmpty("BOM reads include child items but must remain no-tracking");

        await new EmployeeRepository(queryContext).GetAllAsync();
        queryContext.ChangeTracker.Entries().Should().BeEmpty("employee reads should not retain personnel entities in the query context");

        await new PurchaseOrderRepository(queryContext).GetAllAsync();
        queryContext.ChangeTracker.Entries().Should().BeEmpty("purchase reads include line items but must not track order aggregates");

        await new QualityInspectionRepository(queryContext).GetAllAsync();
        queryContext.ChangeTracker.Entries().Should().BeEmpty("quality reads should not keep inspection entities tracked after query materialization");

        await new ScheduleRepository(queryContext).GetAllAsync(page: 1, pageSize: 20);
        queryContext.ChangeTracker.Entries().Should().BeEmpty("schedule reads include items through split query and must still be no-tracking");

        await new UserRepository(queryContext).GetAllAsync();
        queryContext.ChangeTracker.Entries().Should().BeEmpty("admin user reads must not track security-sensitive user entities");
    }

    private static void SeedCoreRepositoryRows(MesDbContext context)
    {
        var now = new DateTime(2026, 6, 11, 8, 0, 0, DateTimeKind.Utc);

        context.WorkOrders.Add(WorkOrder.Create("WO-NOTRACK-001", "PROD-NOTRACK", "No Track Product", 10, now, now.AddDays(1), "WS-001"));
        context.Equipment.Add(Equipment.Create("EQ-NOTRACK-001", "No Track Equipment", "CNC", "WS-001", "Workshop A", 100));
        context.Materials.Add(Material.Create("MAT-NOTRACK-001", "No Track Material", "PCS", safetyStock: 10, availableQuantity: 100));

        var bom = new BillOfMaterial(
            "BOM-NOTRACK-001",
            "No Track BOM",
            new ProductCode("PROD-NOTRACK"),
            "No Track Product",
            BomType.Manufacturing,
            "V1");
        bom.AddItem(new BomItem(new MaterialCode("MAT-NOTRACK-001"), "No Track Material", 1, "PCS", 1));
        context.BillsOfMaterial.Add(bom);

        context.Employees.Add(Employee.Create("EMP-NOTRACK-001", "No Track Employee", "Operator", "A", "Day"));

        var purchaseOrder = new PurchaseOrder("PO-NOTRACK-001", "No Track Supplier", null, now.AddDays(5), null, "buyer");
        purchaseOrder.AddItem(new PurchaseOrderLineItem
        {
            MaterialCode = "MAT-NOTRACK-001",
            MaterialName = "No Track Material",
            Unit = "PCS",
            Quantity = 5,
            UnitPrice = 2,
        });
        context.PurchaseOrders.Add(purchaseOrder);

        context.QualityInspections.Add(QualityInspection.Create("WO-NOTRACK-001", "PROD-NOTRACK", "Assembly", "Final", 10, 10, 0, "qc"));

        var schedulePlan = SchedulePlan.Create("No Track Schedule", now, now.AddHours(8));
        schedulePlan.AddItems(new[]
        {
            ScheduleItem.Create("WO-NOTRACK-001", "EQ-NOTRACK-001", now, now.AddHours(2), 1),
        });
        context.SchedulePlans.Add(schedulePlan);

        context.SystemUsers.Add(SystemUser.Create("notrack", "No Track User", "hash", "Operator", "user-notrack"));
        context.ProductionAnomalies.Add(new ProductionAnomaly(
            new WorkOrderNumber("WO-NOTRACK-001"),
            new OperationCode("OP-NOTRACK-001"),
            "quality",
            AnomalySeverity.Low,
            "No Track Anomaly",
            "No tracking repository seed"));
    }
}
