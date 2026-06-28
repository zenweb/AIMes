# 2026-06-15 Review - Audit Replay POC and OTD Rework Release Coverage

## Decision

The audit replay panel hardening slice is valid and verified.

## What changed

- The replay panel now has direct regression coverage for the remaining POC, OTD, and barcode rework release paths that were still uncovered.
- Fail-loud behavior is pinned for loader errors and malformed payloads in the same user-critical replay surface.
- The work stayed inside the existing feature boundary and did not broaden scope.

## Verification

- `npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts --reporter=dot`
- `npm run test:unit:coverage -- tests/unit/audit-decision-replay-panel.test.ts --reporter=dot --coverage.reporter=text`
- `npm run test:unit -- tests/unit/audit-log-board.test.ts tests/unit/audit-decision-replay-panel.test.ts tests/unit/knowledge-citations.test.ts tests/unit/quality-board.test.ts --reporter=dot`
- `npm run test:unit:coverage -- --reporter=dot`
- Regression refresh on 2026-06-19:
  - `npx vitest run tests/unit/audit-decision-replay-panel.test.ts --coverage.enabled=false`: 56 passed.
  - `npm run test:unit:coverage`: 111 files / 1083 tests passed.
  - `npm run lint`: passed.

## Notes

- Remaining uncovered lines in the component are low-value outer catch paths (`1703`, `1708`) and one parser fallback (`679`).
- Strict release readiness is still not claimed.
