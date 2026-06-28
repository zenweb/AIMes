# 2026-06-20 Customer POC Latest Seed Evidence

## Changed

- Added deterministic seeded latest records for:
  - `CustomerOrderImportEvidence`
  - `CustomerEquipmentFaultEvidence`
- Added Docker recovery SQL for existing local PostgreSQL volumes.
- Added an integration test proving both customer POC latest endpoints return auditable seeded records.

## Evidence

- `dotnet test src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --filter "FullyQualifiedName~SchedulingControllerTests.CustomerPocLatestEvidence_ShouldReturnSeededImportAndEquipmentFault|FullyQualifiedName~SchedulingControllerTests.EquipmentEvidenceApi_ShouldUpsertQueryAndAuditBackendEvidence|FullyQualifiedName~SchedulingControllerTests.PocEvidenceApi_ShouldUpsertQueryAndAuditCustomerPilotAndHypercareEvidence"` PASS, 2 tests matched.
- Docker SQL inserted 2 customer POC evidence rows.
- Direct API checks on `http://127.0.0.1:5003` returned 200 for `customer-order-import/latest` and `customer-equipment-fault/latest`.
- `npm run build` PASS.
- Real browser preview returned 200 for customer import and equipment fault latest reads on report, audit logs, admin, and equipment routes.

