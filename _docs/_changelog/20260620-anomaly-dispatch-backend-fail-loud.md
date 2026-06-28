# 2026-06-20 Changelog: Anomaly Dispatch Backend Fail Loud

- Added optional fail-loud support to `queryAnomalyDispatchRecords` so audit refresh callers can surface backend read failures.
- Hardened `readAnomalyDispatchRecordsBackendFirst` with an explicit backend array-shape guard. Non-array anomaly dispatch payloads now fail loud when requested.
- Preserved default startup/demo behavior: ordinary backend-first reads still fall back to local dispatch evidence and ignore incomplete backend dispatch records.

## Verification

- RED: `npm run test:unit -- tests/unit/anomaly-dispatch-sync.test.ts` failed with 2 new failures because `readAnomalyDispatchRecordsBackendFirst({ failLoud: true })` resolved `[]` instead of rejecting.
- RED: `npm run test:unit -- tests/unit/risk-evidence-api.test.ts` failed with 1 new failure because `queryAnomalyDispatchRecords(12, { failLoud: true })` resolved `[]` instead of rejecting.
- GREEN: `npm run test:unit -- tests/unit/anomaly-dispatch-sync.test.ts` passed: 8 tests.
- GREEN: `npm run test:unit -- tests/unit/risk-evidence-api.test.ts` passed: 6 tests.
- Adjacent filtered: `npm run test:unit -- tests/unit/anomaly-board.test.ts -t "dispatch|分流|异常|审计|offline"` passed: 11 passed, 11 skipped.
- Adjacent filtered: `npm run test:unit -- tests/unit/risk-action-queue-panel.test.ts -t "dispatch|异常|risk|风险|source|来源"` passed: 9 passed, 7 skipped.
- Adjacent filtered: `npm run test:unit -- tests/unit/schedule-board.test.ts -t "anomaly dispatch|异常分流|risk|风险|event|事件"` passed: 8 passed, 61 skipped.
- Adjacent filtered: `npm run test:unit -- tests/unit/chat-panel.test.ts -t "anomaly|异常|dispatch|分流|context"` passed: 9 passed, 62 skipped.
- Lint: `npm run lint -- src/api/riskEvidence.ts src/utils/anomaly-dispatch-sync.ts tests/unit/anomaly-dispatch-sync.test.ts tests/unit/risk-evidence-api.test.ts` passed.
- Diff hygiene: `git diff --check -- src/frontend/src/api/riskEvidence.ts src/frontend/src/utils/anomaly-dispatch-sync.ts src/frontend/tests/unit/anomaly-dispatch-sync.test.ts src/frontend/tests/unit/risk-evidence-api.test.ts` exited 0 with LF/CRLF normalization warnings only.
