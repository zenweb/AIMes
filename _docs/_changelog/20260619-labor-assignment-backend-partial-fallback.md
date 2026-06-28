# 2026-06-19 Labor Assignment Backend Partial Fallback

## Changed
- Hardened `readLaborReassignmentsBackendFirst` and `readLaborQualificationBlocksBackendFirst` so backend records are runtime-validated before replacing local execution evidence.
- Added merge semantics for labor reassignment and qualification block evidence: complete backend records keep precedence, complete local records fill gaps, partial backend records are ignored.

## Verification
- RED first: `npm run test:unit -- tests/unit/labor-assignment-sync.test.ts` failed on the new partial backend labor record case.
- GREEN: `npm run test:unit -- tests/unit/labor-assignment-sync.test.ts` passed: 7 tests.
- `npm run test:unit -- tests/unit/execution-evidence-api.test.ts` passed: 2 tests.
- `npm run test:unit -- tests/unit/admin-board.test.ts -t "人员|labor|替班|资质"` passed: 1 selected test, 31 skipped by filter.
- `npm run test:unit -- tests/unit/production-board.test.ts -t "人员|labor|替班|资质|qualification"` passed: 2 selected tests, 37 skipped by filter.
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "人员|labor|替班|资质|qualification"` passed: 2 selected tests, 67 skipped by filter.
- `npm run test:unit -- tests/unit/chat-panel.test.ts -t "人员|labor|替班|资质|qualification"` passed: 1 selected test, 70 skipped by filter.
