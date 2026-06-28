# 2026-06-19 Anomaly Dispatch Backend Partial Fallback

## Changed
- Hardened `readAnomalyDispatchRecordsBackendFirst` so incomplete backend dispatch records are filtered before merging with local evidence.
- Preserved backend-first precedence for complete dispatch records while preventing partial records from shadowing complete local owner/action evidence with the same id.

## Verification
- RED first: `npm run test:unit -- tests/unit/anomaly-dispatch-sync.test.ts` failed on the new partial backend record case.
- GREEN: `npm run test:unit -- tests/unit/anomaly-dispatch-sync.test.ts` passed: 6 tests.
- `npm run test:unit -- tests/unit/anomaly-board.test.ts -t "dispatch|分流|分派|异常"` passed: 10 selected tests, 12 skipped by filter.
- `npm run test:unit -- tests/unit/risk-action-queue-panel.test.ts -t "dispatch|分流|分派|异常"` passed: 1 selected test, 15 skipped by filter.
- `npm run test:unit -- tests/unit/risk-evidence-api.test.ts` passed: 2 tests.
