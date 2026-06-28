# 2026-06-21 Plan - Production WO-013 Backend Scan Seed

## Objective
Remove the remaining frontend fallback dependency for `WO-013` production scan evidence.

## Steps
1. Reproduce the backend `WO-013` scan failure against the current Docker API.
2. Add a failing integration test proving `DemoDataSeeder.SeedAsync` must preserve `WO-013 / OP-10 / 淬火` even when other work orders already exist.
3. Add idempotent seeding and scan reuse of existing work-order executions.
4. Add startup-gated demo seeding for the docker compose demo stack.
5. Verify with unit tests, integration tests, REST, database query, and real browser evidence.

## Status
- Completed for this slice.

## 2026-06-21 Current-State Recheck
- Done: backend integration recheck passed, `ProductionControllerTests` 6/6.
- Done: real-browser production personnel handoff recheck passed, 1/1.
- No further implementation work is planned for this slice unless a wider chain audit finds contradictory evidence.
