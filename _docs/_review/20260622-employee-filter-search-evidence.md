# Review - Employee Filter Search Evidence - 2026-06-22

## Decision

Accepted as an evidence-only hardening slice.

## Review Notes

- The test exercises the real UI controls instead of computed state directly.
- It validates the inactive employee path remains explicit and read-only.
- It strengthens the existing employee feature without broadening scope.

## Verification

- `npm run test:e2e -- tests/e2e/employee.spec.ts -g "员工筛选搜索"`: PASS, 1/1.

## Follow-Up

- If server-side roster filtering is introduced, add a backend-read evidence path to keep frontend and API contracts aligned.
