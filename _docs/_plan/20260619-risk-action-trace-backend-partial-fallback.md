# 2026-06-19 Plan: Risk action trace backend partial fallback

## Success Criteria
- Risk action trace reads must not accept partial records that cannot explain owner, affected work orders, delivery impact, suggestion, status, and timestamp.
- Complete local responsibility-action evidence must remain visible when backend readback is incomplete.
- Risk action queue, report center, and risk evidence API checks must keep passing.

## Execution
- Add RED tests for partial backend risk action trace lists and incomplete local trace records.
- Apply a minimal shape guard at local and backend-first read boundaries.
- Run targeted and adjacent unit tests.

## Result
- Completed.
- Verification:
  - `npm run test:unit -- tests/unit/risk-action-sync.test.ts`
  - `npm run test:unit -- tests/unit/risk-action-queue-panel.test.ts`
  - `npm run test:unit -- tests/unit/report-board.test.ts -t "risk|风险|action|责任"`
  - `npm run test:unit -- tests/unit/risk-evidence-api.test.ts`
