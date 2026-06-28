# 2026-06-20 Frontend Real Browser Employee Evidence

## Change

- Refreshed current-worktree real browser evidence for the personnel management path.
- Rebuilt and restarted local preview on `127.0.0.1:4173`.
- Verified the employee offline demo entry no longer exposes backend skip internals.

## Evidence

- `npm run test:e2e -- tests/e2e/employee.spec.ts`
  - Result: PASS
  - 11 passed / 0 failed
- Manual browser DOM check:
  - `http://127.0.0.1:4173/scheduling/employee?offlineDemo=1`
  - `员工列表加载失败`: absent
  - `Offline demo mode skipped backend request`: absent

## Report

- `_docs/_reports/frontend-real-browser-employee-evidence-20260620.md`
