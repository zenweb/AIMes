# 2026-06-20 Changelog: Risk Action Trace Backend Fail Loud

- Added fail-loud support to `queryRiskActionTraces` so audit refresh callers can surface backend read failures instead of silently receiving an empty trace list.
- Hardened `readRiskActionTracesBackendFirst` with an explicit backend array-shape guard. Non-array risk action trace payloads now fail loud when requested.
- Kept default backend-first behavior unchanged for non-audit/demo reads: backend failure, empty arrays, and incomplete backend trace records still fall back to cleaned local trace evidence.

## Verification

- RED: `npm run test:unit -- tests/unit/risk-action-sync.test.ts` failed with 2 new failures because `readRiskActionTracesBackendFirst({ failLoud: true })` resolved `[]` instead of rejecting.
- RED: `npm run test:unit -- tests/unit/risk-evidence-api.test.ts` failed with 1 new failure because `queryRiskActionTraces(12, { failLoud: true })` resolved `[]` instead of rejecting.
- GREEN: `npm run test:unit -- tests/unit/risk-action-sync.test.ts` passed: 9 tests.
- GREEN: `npm run test:unit -- tests/unit/risk-evidence-api.test.ts` passed: 5 tests.
- Adjacent filtered: `npm run test:unit -- tests/unit/risk-action-queue-panel.test.ts -t "trace|审计|风险|risk|处置"` passed: 11 passed, 5 skipped.
- Adjacent filtered: `npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts -t "risk|风险|trace|审计|回放"` passed: 4 passed, 56 skipped.
- Adjacent filtered: `npm run test:unit -- tests/unit/report-board.test.ts -t "risk|风险|trace|审计|OTD"` passed: 11 passed, 17 skipped.
- Adjacent: `npm run test:unit -- tests/unit/otd-evidence-chain-sync.test.ts` passed: 6 tests.
- Lint: `npm run lint -- src/api/riskEvidence.ts src/utils/risk-action-sync.ts tests/unit/risk-action-sync.test.ts tests/unit/risk-evidence-api.test.ts` passed.
- Diff hygiene: `git diff --check -- src/frontend/src/api/riskEvidence.ts src/frontend/src/utils/risk-action-sync.ts src/frontend/tests/unit/risk-action-sync.test.ts src/frontend/tests/unit/risk-evidence-api.test.ts` exited 0 with LF/CRLF normalization warnings only.
