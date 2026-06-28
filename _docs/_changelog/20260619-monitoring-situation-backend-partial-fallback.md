# 2026-06-19 Monitoring Situation Backend Partial Fallback

## Changed
- Hardened `readMonitoringSituationEscalationsBackendFirst` so backend escalation packages are runtime-validated before they can replace local evidence.
- Added backend/local merge semantics: complete backend packages keep precedence, local packages fill gaps, partial backend packages are ignored.

## Verification
- RED first: `npm run test:unit -- tests/unit/monitoring-situation-escalation-sync.test.ts` failed on the new partial backend escalation case.
- GREEN: `npm run test:unit -- tests/unit/monitoring-situation-escalation-sync.test.ts` passed: 8 tests.
- `npm run test:unit -- tests/unit/monitoring-board.test.ts -t "现场态势|处置包|monitoring|situation"` passed: 9 selected tests, 6 skipped by filter.
- `npm run test:unit -- tests/unit/risk-action-queue-panel.test.ts -t "现场态势|处置包|monitoring|situation"` passed: 3 selected tests, 13 skipped by filter.
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "现场态势|处置包|monitoring|situation"` passed: 1 selected test, 68 skipped by filter.
- `npm run test:unit -- tests/unit/chat-panel.test.ts -t "现场态势|处置包|monitoring|situation"` passed: 2 selected tests, 69 skipped by filter.
- `npm run test:unit -- tests/unit/risk-evidence-api.test.ts` passed: 2 tests.
