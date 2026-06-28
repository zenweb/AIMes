# 2026-06-16 Risk Monitoring Close Fail Loud

- Fixed `RiskActionQueuePanel.vue` monitoring-situation closure so realtime package writeback failures no longer escape the click handler.
- Added a visible `role="alert"` message when risk closure trace archival succeeds but `closeMonitoringSituationEscalation` fails.
- Preserved the already-written risk trace while keeping the realtime monitoring situation package escalated, so the operator can retry without a false closed state.
- Kept normal risk close and monitoring close success behavior unchanged.

## Verification

- Red test first:
  - `npm run test:unit -- tests/unit/risk-action-queue-panel.test.ts -t "keeps monitoring situation packages escalated when realtime closure write fails after risk trace archival" --reporter=dot`
  - Expected failure observed: missing `[role="alert"]` and Vitest reported an unhandled native event handler error.
- Green targeted test:
  - Same command passed: `1 passed | 13 skipped`.
- Targeted coverage:
  - `npm run test:unit:coverage -- tests/unit/risk-action-queue-panel.test.ts --reporter=dot --coverage.reporter=text`
  - `14 passed`.
  - `RiskActionQueuePanel.vue`: statements `87.14%`, branches `73%`, functions `89.47%`, lines `89.84%`.
- Full frontend coverage:
  - `npm run test:unit:coverage -- --reporter=dot --coverage.reporter=text`
  - `111 files / 1059 tests passed`.
  - Totals: statements `89.51%`, branches `77.01%`, functions `89.54%`, lines `92.64%`.
