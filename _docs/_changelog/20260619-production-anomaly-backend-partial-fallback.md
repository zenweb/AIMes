# 2026-06-19 Changelog: Production anomaly backend partial fallback

## Changed
- Hardened production anomaly backend-first reads.
- Backend production anomaly records now must include operation, equipment/null equipment, type, severity, description, detection metadata, and suggested action before replacing local evidence.
- Partial backend anomaly payloads fall back to local complete production anomaly evidence.

## Evidence
- RED: `npm run test:unit -- tests/unit/production-anomaly-sync.test.ts` failed because a partial backend anomaly was returned directly.
- GREEN: `npm run test:unit -- tests/unit/production-anomaly-sync.test.ts` passed, 7 tests.
- Adjacent checks:
  - `npm run test:unit -- tests/unit/anomaly-board.test.ts -t "production|生产|anomaly|异常"` passed, 12 tests and 10 skipped by filter.
  - `npm run test:unit -- tests/unit/risk-action-queue-panel.test.ts -t "production|生产|anomaly|异常"` passed, 2 tests and 14 skipped by filter.
  - `npm run test:unit -- tests/unit/risk-evidence-api.test.ts` passed, 2 tests.
  - `npm run test:unit -- tests/unit/production-board.test.ts -t "anomaly|异常|exception"` passed, 6 tests and 33 skipped by filter.

## Release Gate Note
- Strict v1.0.0 remains gated by first gray observation and the two-week no P0/P1 window.
