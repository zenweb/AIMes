# 2026-06-19 Changelog: Risk action trace backend partial fallback

## Changed
- Hardened risk action trace local and backend-first reads.
- Risk action traces now require id, title, type, status, status label, owner, affected work orders, delivery impact trace, suggestion, narrative trace, and created timestamp.
- Partial backend trace lists fall back to local complete responsibility-action evidence.

## Evidence
- RED: `npm run test:unit -- tests/unit/risk-action-sync.test.ts` failed because partial backend and local traces were accepted.
- GREEN: `npm run test:unit -- tests/unit/risk-action-sync.test.ts` passed, 7 tests.
- Adjacent checks:
  - `npm run test:unit -- tests/unit/risk-action-queue-panel.test.ts` passed, 16 tests.
  - `npm run test:unit -- tests/unit/report-board.test.ts -t "risk|风险|action|责任"` passed, 1 test and 27 skipped by filter.
  - `npm run test:unit -- tests/unit/risk-evidence-api.test.ts` passed, 2 tests.

## Release Gate Note
- Strict v1.0.0 remains gated by first gray observation and the two-week no P0/P1 window.
