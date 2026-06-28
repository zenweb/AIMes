# 2026-06-19 Plan: Production anomaly backend partial fallback

## Success Criteria
- Production anomaly backend-first reads must not accept partial records that cannot explain operation context, detection metadata, severity, and suggested action.
- Complete local anomaly evidence must remain visible when backend readback is incomplete.
- Anomaly, risk queue, production, and risk API adjacent checks must keep passing.

## Execution
- Add RED test for partial backend production anomaly payload.
- Apply minimal shape guard at the backend-first read boundary.
- Run targeted and adjacent unit tests.

## Result
- Completed.
- Verification:
  - `npm run test:unit -- tests/unit/production-anomaly-sync.test.ts`
  - `npm run test:unit -- tests/unit/anomaly-board.test.ts -t "production|生产|anomaly|异常"`
  - `npm run test:unit -- tests/unit/risk-action-queue-panel.test.ts -t "production|生产|anomaly|异常"`
  - `npm run test:unit -- tests/unit/risk-evidence-api.test.ts`
  - `npm run test:unit -- tests/unit/production-board.test.ts -t "anomaly|异常|exception"`
