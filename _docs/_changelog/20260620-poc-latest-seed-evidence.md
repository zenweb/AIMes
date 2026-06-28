# 2026-06-20 POC Latest Seed Evidence

## Changed

- Added integration seed evidence for the POC chain:
  - `PocReviewSignoff`
  - `PocRolloutPackage`
  - `PocPilotRun`
  - `PocHypercareAcceptance`
- Added Docker volume recovery SQL entries for the same POC latest evidence records.
- Added an integration test proving POC latest endpoints return auditable records after seed setup.

## Evidence

- `dotnet test src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --filter "FullyQualifiedName~SchedulingControllerTests.PocLatestEvidence_ShouldReturnSeededAuditableChain|FullyQualifiedName~SchedulingControllerTests.PocEvidenceApi_ShouldUpsertQueryAndAuditCustomerPilotAndHypercareEvidence"` PASS, 2 tests.
- Docker PostgreSQL recovery script inserted 4 POC evidence rows.
- Direct API checks on `http://127.0.0.1:5003` returned 200 for all four POC latest endpoints.
- `npm run build` PASS.
- Real browser preview showed POC latest requests returning 200 on dashboard, production, report, audit logs, admin, and scheduling routes.

