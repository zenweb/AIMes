# Frontend Unit Coverage Full Evidence - 2026-06-21

## Result

PASS.

## Command

```powershell
cd C:\AIWorks\AIMes\v1\src\frontend
npm run test:unit:coverage -- --maxWorkers=1 --no-file-parallelism
```

## Output Summary

- Test Files: 116 passed / 116
- Tests: 1260 passed / 1260
- Duration: 110.41s
- Started at: 15:29:11 local time

## Coverage Summary

Source: `src/frontend/coverage/coverage-summary.json` generated at 2026-06-21 15:31 local time.

- Statements: 89.85% (11102 / 12356)
- Branches: 77.51% (9747 / 12574)
- Functions: 90.08% (2645 / 2936)
- Lines: 92.91% (10175 / 10951)

## Thresholds

Configured in `src/frontend/vitest.config.ts`:

- Statements: 15%
- Branches: 15%
- Functions: 15%
- Lines: 15%

All thresholds passed.

## Boundary

- This is local dirty-worktree coverage evidence.
- This report does not prove frontend e2e, visual regression, hosted CI, deployment readiness, or gray observation completion.
- Low-concurrency execution is the reliable local command shape for this workspace.
