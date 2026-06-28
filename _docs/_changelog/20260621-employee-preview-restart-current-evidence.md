# Employee preview restart current evidence

- Rechecked the user-reported Employee page message: `员工列表加载失败，当前展示本地示例数据：Offline demo mode skipped backend request: /api/v1/employee`.
- Confirmed source behavior is already correct: `EmployeeBoard` clears the notification for `isOfflineDemoError(error)` and falls back to local demo employees.
- Rebuilt the frontend production output and restarted the stale `4173` preview process so the accessible entry serves the current bundle.

## Evidence

- Unit: `npm run test:unit -- --run tests/unit/offline-demo-mode.test.ts tests/unit/employee-board.test.ts` passed, 35/35.
- E2E: `npm run test:e2e -- tests/e2e/employee.spec.ts -g "backend skip"` passed, 2/2.
- Real browser: `http://127.0.0.1:4173/scheduling/employee?offlineDemo=1` renders EmployeeBoard with 8 employee cards, 0 alerts, and no `Offline demo mode skipped backend request`.

## Impact

- Current accessible Employee offline-demo entry is clean.
- Root cause for the repeated user-visible red bar was stale preview output/process risk, not a remaining EmployeeBoard business logic defect.
