# 2026-06-20 Review - POC Latest Seed Evidence

## Scope

- `src/tests/MES.Tests.Integration/TestDataSeedFilter.cs`
- `src/tests/MES.Tests.Integration/Controllers/SchedulingControllerTests.cs`
- `db/ensure-current-schedule-plan.sql`

## Review Result

- Result: PASS for this slice.
- Root cause: POC latest endpoints were valid backend contracts, but the Docker and integration seed data did not include current auditable POC records. Multi-page startup hydration therefore produced background 404s.
- Fix: Seeded the complete POC latest chain as `AgentEvidenceLink` records and added a recovery SQL path for existing Docker volumes.
- Test design: The new integration test verifies latest endpoints return 200 and auditable fields, while separately checking the deterministic seed keys exist in the database.

## Residual Risk

- Other optional latest evidence families still return background 404s in real browser scans: customer equipment, customer order import, quality, shortage, engineering, route capability, supplier, and supply risk.
- This slice intentionally does not change their behavior.

