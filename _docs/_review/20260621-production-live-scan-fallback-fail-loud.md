# 2026-06-21 Review - Production live scan fallback fail-loud

## Review Result

PASS for this slice.

## Checked

- Live scan failure path no longer silently selects a local matched work order with demo operations unless the failure is an explicit offline demo skip.
- Manual work-order selection no longer silently falls back to local demo operations on live backend failures.
- Offline demo behavior remains available for explicit `OfflineDemoApiError`.
- Tests now model backend-backed operations instead of relying on old rejected-scan local `opMap` behavior.

## Validation

- `production-board.test.ts`: 41/41 passed.
- `production-board.test.ts + production-api.test.ts`: 47/47 passed.
- Frontend production build passed.
- Real browser WO-013 route confirmed backend-backed production context with no fallback/offline/load-failure text.

## Residual Risk

- The scan API currently returns a single operation. When no next operation is returned, successful quality-pass completion does not create handoff evidence. This is intentionally reflected in tests; if the product needs downstream handoff evidence, the backend contract should return route-next-operation data instead of the frontend inventing it.
- 4173 preview had stale static assets before restart. It was restarted with the current `.output` build and verified afterward.
