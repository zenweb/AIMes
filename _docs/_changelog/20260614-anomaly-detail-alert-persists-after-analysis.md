# 2026-06-14 Anomaly Detail Alert Persists After Analysis

## Changed
- Hardened the existing AnomalyBoard detail and AI analysis alert lifecycle.
- Split anomaly notifications into startup, detail, analysis, and operation lanes.
- Preserved a detail-load fail-loud alert after a later AI analysis succeeds.

## Verification
- RED confirmed: `npm run test:unit -- tests/unit/anomaly-board.test.ts -t "keeps anomaly detail load failures visible"` failed because no `[role="alert"]` remained after AI analysis succeeded.
- Focused GREEN: `npm run test:unit -- tests/unit/anomaly-board.test.ts -t "keeps anomaly detail load failures visible"` -> 1 passed.
- Anomaly unit: `npm run test:unit -- tests/unit/anomaly-board.test.ts` -> 12 passed.
- Anomaly real browser: `npm run test:e2e -- tests/e2e/anomaly.spec.ts --project=chromium` -> 9 passed.
- Frontend coverage: `npm run test:unit:coverage` -> 105 files passed, 776 tests passed, global line coverage 84.19%, `AnomalyBoard.vue` line coverage 77.64%.

## Notes
- This is a boutique hardening slice for an existing user-critical anomaly detail path.
- Coverage still emits the existing `--localstorage-file was provided without a valid path` warning.
- Gray observation remains owner-skipped/deferred and is not a blocker for this slice.

