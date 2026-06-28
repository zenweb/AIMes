# 2026-06-19 Offline Demo Dashboard And Audit Quiet Fallback

## Summary
- Fixed remaining `offlineDemo=1` technical backend skip leaks on the dashboard and audit log routes.
- Preserved fail-loud behavior for real backend failures.
- Verified production route was already clean in real browser.

## Changed
- `src/frontend/src/components/dashboard/DashboardBoard.vue`
  - Dashboard backend skip from `/api/v1/dashboard` now keeps local dashboard defaults quiet.
- `src/frontend/src/components/auditLog/AuditLogBoard.vue`
  - Audit list backend skip from `/api/v1/audit-logs` now shows local demo audit rows without a user-facing technical error.
- `src/frontend/src/components/auditLog/AuditDecisionReplayPanel.vue`
  - Replay evidence startup errors now ignore only `OfflineDemoApiError`.
- Tests:
  - `src/frontend/tests/unit/dashboard-board.test.ts`
  - `src/frontend/tests/unit/audit-log-board.test.ts`
  - `src/frontend/tests/unit/audit-decision-replay-panel.test.ts`

## Evidence
- `npm run test:unit -- tests/unit/audit-log-board.test.ts tests/unit/audit-decision-replay-panel.test.ts` -> 69 passed.
- `npm run test:unit -- tests/unit/dashboard-board.test.ts tests/unit/audit-log-board.test.ts tests/unit/audit-decision-replay-panel.test.ts tests/unit/quality-board.test.ts tests/unit/report-board.test.ts tests/unit/admin-board.test.ts tests/unit/employee-board.test.ts tests/unit/document-upload.test.ts tests/unit/customer-order-import-sync.test.ts tests/unit/quality-knowledge-sample-sync.test.ts tests/unit/login-page.test.ts tests/unit/auth.store.test.ts tests/unit/router-auth.test.ts` -> 304 passed.
- `npm run build` -> passed.
- Real browser:
  - `/scheduling?offlineDemo=1`: `hasBackendSkip: false`, `alerts: []`, dashboard KPI cards present.
  - `/scheduling/audit-logs?offlineDemo=1`: `hasBackendSkip: false`, `alerts: []`, replay panel and local audit rows present.
  - `/scheduling/production?offlineDemo=1`: `hasBackendSkip: false`, `alerts: []`, work orders present.
