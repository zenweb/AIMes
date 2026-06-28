# 2026-06-19 Quality CAPA Backend Partial Fallback

## Changed
- Hardened `readQualityCapaClosureBackendFirst` so backend latest CAPA closure records must pass runtime validation before replacing local evidence.
- Partial backend CAPA records now fall back to the local complete closure, preserving owner, audit state, OTD impact, and review action.

## Verification
- RED first: `npm run test:unit -- tests/unit/quality-capa-sync.test.ts` failed on the new partial backend CAPA closure case.
- GREEN: `npm run test:unit -- tests/unit/quality-capa-sync.test.ts` passed: 5 tests.
- `npm run test:unit -- tests/unit/execution-evidence-api.test.ts` passed: 2 tests.
- `npm run test:unit -- tests/unit/report-board.test.ts -t "CAPA|质量 CAPA|quality"` passed: 5 selected tests, 23 skipped by filter.
- `npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts -t "CAPA|质量 CAPA|quality"` passed: 16 selected tests, 44 skipped by filter.
- `npm run test:unit -- tests/unit/quality-capa-task-panel.test.ts -t "CAPA|闭环|正式"` passed: 8 selected tests, 10 skipped by filter.
