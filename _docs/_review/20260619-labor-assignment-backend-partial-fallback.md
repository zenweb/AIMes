# 2026-06-19 Review - Labor Assignment Backend Partial Fallback

## Scope
- Reviewed execution evidence backend-first readers for labor reassignment and labor qualification blocks.
- Files changed:
  - `src/frontend/src/utils/labor-assignment-sync.ts`
  - `src/frontend/tests/unit/labor-assignment-sync.test.ts`

## Finding
- Local storage reads already removed incomplete labor records, but backend-first reads returned any non-empty backend array.
- Partial backend records could drop replacement owner, blocked certification, reviewer, audit id, trace id, and operation coverage details.

## Resolution
- Reused existing runtime guards for backend labor reassignment and qualification block arrays.
- Merged complete backend and local records by id, preserving backend precedence while keeping local complete evidence when backend data is empty or partial.

## Residual Risk
- The `executionEvidence` API adapter still exposes typed arrays even though runtime payloads can be malformed. Components should continue using guarded sync readers for evidence rendering.
