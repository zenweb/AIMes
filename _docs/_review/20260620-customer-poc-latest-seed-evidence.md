# 2026-06-20 Review - Customer POC Latest Seed Evidence

## Scope

- `src/tests/MES.Tests.Integration/TestDataSeedFilter.cs`
- `src/tests/MES.Tests.Integration/Controllers/SchedulingControllerTests.cs`
- `db/ensure-current-schedule-plan.sql`

## Review Result

- Result: PASS for this slice.
- Root cause: Customer POC import and equipment fault evidence endpoints existed, but current seed data did not provide latest records. Report, audit, admin, and equipment pages therefore produced background 404s.
- Fix: Seeded deterministic `AgentEvidenceLink` records for customer order import and customer equipment fault evidence in both integration startup and Docker recovery SQL.
- Test coverage: Added integration coverage that verifies both latest endpoints return 200, meaningful payload fields, and deterministic seed keys in the database.

## Residual Risk

- Report and audit routes still show background 404s for quality latest records, including `quality-capa-closure`, `quality-mrb-disposition`, and `quality-rework-impact`.
- This slice intentionally keeps those quality evidence families unchanged.

