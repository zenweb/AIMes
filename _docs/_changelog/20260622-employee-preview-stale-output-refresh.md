# 2026-06-22 Changelog - Employee Preview Stale Output Refresh

- Rebuilt `src/frontend/.output` with `VITE_OFFLINE_DEMO=false npm run build`.
- Restarted the stale `127.0.0.1:4173` frontend preview process.
- Confirmed the user-facing Employee offline-demo skip message was caused by stale preview output, not a new EmployeeBoard regression.
- Added evidence report: `_docs/_reports/employee-preview-stale-output-refresh-20260622.md`.

Validation:

- `npm run test:unit -- tests/unit/employee-board.test.ts` passed: 19 tests.
- `npm run test:e2e -- tests/e2e/employee.spec.ts -g "Offline demo mode skipped backend request|offline demo" --project=chromium` passed: 2 tests.
- Real Chromium smoke against `http://127.0.0.1:4173` confirmed no visible `Offline demo mode skipped backend request` on the Employee login redirects.
- Real Chromium smoke covered 17 core `offlineDemo=1` module entries and found no visible `Offline demo mode skipped backend request`, `加载失败`, or `请求错误`.
