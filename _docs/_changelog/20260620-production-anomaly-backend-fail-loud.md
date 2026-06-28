# 2026-06-20 Production Anomaly Backend Fail Loud

## Changed
- Added fail-loud support to production anomaly latest backend reads.
- `readProductionAnomalyEventBackendFirst()` now propagates fail-loud options and rethrows backend failures when requested.
- Existing normal-mode fallback remains: unavailable or incomplete backend evidence falls back to local auditable production anomaly events.

## Validation
- `npm run test:unit -- tests/unit/production-anomaly-sync.test.ts` -> 8 passed.
- `npm run test:unit -- tests/unit/risk-evidence-api.test.ts` -> 4 passed.
- `npm run test:unit -- tests/unit/anomaly-board.test.ts -t "生产异常|anomaly|latest|fallback|detail"` -> 13 passed, 9 skipped.
- `npm run test:unit -- tests/unit/production-board.test.ts -t "生产异常|anomaly|异常|storage|写入"` -> 3 passed, 36 skipped.
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "异常|anomaly|风险|risk"` -> 7 passed, 62 skipped.
- `npm run test:unit -- tests/unit/risk-sla-review-sync.test.ts -t "风险|risk|SLA|异常"` -> 7 passed.
- `npm run lint -- src/api/riskEvidence.ts src/utils/production-anomaly-sync.ts tests/unit/production-anomaly-sync.test.ts tests/unit/risk-evidence-api.test.ts` -> passed.
- `git diff --check -- src/frontend/src/api/riskEvidence.ts src/frontend/src/utils/production-anomaly-sync.ts src/frontend/tests/unit/production-anomaly-sync.test.ts src/frontend/tests/unit/risk-evidence-api.test.ts` -> passed with CRLF warnings only.
