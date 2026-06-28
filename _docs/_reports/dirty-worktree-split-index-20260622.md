# Dirty worktree split index - 2026-06-22

## Purpose

Provide a current-state split index for the dirty worktree so CC plan execution can continue through small reviewable packages instead of broad staging.

## Current Inventory

Command:

```powershell
git diff --name-only -- src/frontend src/backend src/tests scripts _docs
```

Result:

- Total changed files in this scoped inventory: 230.
- Frontend: 163.
- Backend: 28.
- .NET tests under `src/tests`: 20.
- Scripts: 7.
- Docs: 12.

Category breakdown:

- `frontend-unit`: 74.
- `frontend-components`: 29.
- `frontend-utils`: 29.
- `backend`: 28.
- `dotnet-tests`: 20.
- `frontend-e2e`: 13.
- `docs`: 12.
- `frontend-api`: 12.
- `scripts`: 7.
- `frontend-other`: 6.

## Frontend E2E Files

- `src/frontend/tests/e2e/admin.spec.ts`
- `src/frontend/tests/e2e/anomaly.spec.ts`
- `src/frontend/tests/e2e/audit.spec.ts`
- `src/frontend/tests/e2e/chat.spec.ts`
- `src/frontend/tests/e2e/dashboard.spec.ts`
- `src/frontend/tests/e2e/employee.spec.ts`
- `src/frontend/tests/e2e/engineering-data.spec.ts`
- `src/frontend/tests/e2e/knowledge.spec.ts`
- `src/frontend/tests/e2e/modules.spec.ts`
- `src/frontend/tests/e2e/production.spec.ts`
- `src/frontend/tests/e2e/purchase.spec.ts`
- `src/frontend/tests/e2e/quality.spec.ts`
- `src/frontend/tests/e2e/report.spec.ts`

## Frontend Component Concentration

Top component directories by changed file count:

- `quality`: 3.
- `schedule`: 2.
- `auditLog`: 2.
- `layout`: 2.
- `knowledge`: 2.
- Single-file component areas: `routing`, `risk`, `report`, `purchase`, `production`, `monitoring`, `inventory`, `gantt`, `equipment`, `employee`, `dashboard`, `chat`, `bom`, `barcode`, `auth`, `anomaly`, `scanner`, `admin`.

## Backend / .NET Concentration

Top backend/test areas:

- `src/backend/MES.Infrastructure/Data`: 7.
- `src/tests/MES.Tests.Unit/Domain`: 5.
- `src/backend/MES.Infrastructure/Repositories`: 3.
- `src/backend/MES.Application/DTOs`: 3.
- `src/tests/MES.Tests.Integration/Controllers`: 3.

## Recommended Split Order

1. Keep the current staged 87-file multi-slice package frozen unless intentionally rebuilt.
2. Next small candidate: `employee.spec.ts` personnel capability E2E split, already supported by 11 focused Chromium tests and 14 full-file Chromium tests.
3. Then split frontend module packs by user-critical path and existing evidence, not by broad directory:
   - quality evidence and CAPA flows;
   - production execution and operation handoff;
   - purchase / shortage / outsourcing flows;
   - audit replay and report evidence flows.
4. Split backend operation/data packages separately from frontend packs, especially operation code sequencing, repository ordering, PostgreSQL persistence, and architecture tests.
5. Keep release-gate scripts/docs as a separate B-track package.

## Non-Claims

- This index is not a full review of all dirty files.
- This index does not prove the dirty worktree is safe to commit.
- This index does not claim v1.0.0 completion.
