# 2026-06-20 Risk SLA Backend Fail Loud

## Changed
- Added fail-loud support to risk SLA latest backend reads.
- `readRiskSlaReviewRecordBackendFirst()` now propagates fail-loud options and rethrows backend failures when requested.
- Existing normal-mode fallback remains: unavailable or incomplete backend evidence falls back to local auditable risk SLA review records.

## Validation
- `npm run test:unit -- tests/unit/risk-sla-review-sync.test.ts` -> 7 passed.
- `npm run test:unit -- tests/unit/risk-evidence-api.test.ts` -> 3 passed.
- `npm run test:unit -- tests/unit/risk-action-queue-panel.test.ts -t "SLA|风险|risk|复核|晨会"` -> 12 passed, 4 skipped.
- `npm run test:unit -- tests/unit/report-board.test.ts -t "SLA|风险|risk|OTD|复核"` -> 11 passed, 17 skipped.
- `npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts -t "SLA|风险|risk|审计|回放"` -> 1 passed, 59 skipped.
- `npm run test:unit -- tests/unit/otd-evidence-chain-sync.test.ts` -> 6 passed.
- `npm run lint -- src/api/riskEvidence.ts src/utils/risk-sla-review-sync.ts tests/unit/risk-sla-review-sync.test.ts tests/unit/risk-evidence-api.test.ts` -> passed.
- `git diff --check -- src/frontend/src/api/riskEvidence.ts src/frontend/src/utils/risk-sla-review-sync.ts src/frontend/tests/unit/risk-sla-review-sync.test.ts src/frontend/tests/unit/risk-evidence-api.test.ts` -> passed with CRLF warnings only.
