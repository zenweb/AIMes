# 2026-06-19 Risk SLA Review Backend Partial Fallback

## Changed
- Hardened `readRiskSlaReviewRecordBackendFirst` so the latest backend review package must satisfy the complete runtime guard before it can replace local evidence.
- Incomplete backend packages now fall back to the local complete review package instead of dropping affected orders, actions, and audit fields.

## Verification
- RED first: `npm run test:unit -- tests/unit/risk-sla-review-sync.test.ts` failed on the new partial backend latest-record case.
- GREEN: `npm run test:unit -- tests/unit/risk-sla-review-sync.test.ts` passed: 6 tests.
- `npm run test:unit -- tests/unit/risk-action-queue-panel.test.ts -t "SLA|sla|风险|risk|复核"` passed: 12 selected tests, 4 skipped by filter.
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "SLA|sla|风险|risk|复核"` passed: 7 selected tests, 62 skipped by filter.
- `npm run test:unit -- tests/unit/risk-evidence-api.test.ts` passed: 2 tests.
