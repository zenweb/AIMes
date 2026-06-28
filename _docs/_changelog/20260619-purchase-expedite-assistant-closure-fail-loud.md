# Changelog: Purchase expedite assistant closure fail loud

Date: 2026-06-19

## Changed

- Fixed `PurchaseBoard` expedited shortage receipt so optional AI assistant recovery closure failures no longer break the completed purchase receipt path.
- Kept purchase receipt, shortage risk resolution, and OTD receipt evidence closed when assistant recovery package lookup fails afterward.
- Added a fail-loud alert for the assistant closure boundary: purchase receipt is complete, but AI assistant purchase action closure needs follow-up.
- Added unit coverage proving the receipt remains mitigated and the assistant failure is surfaced.

## Verification

- RED: `npx vitest run tests/unit/purchase-board.test.ts --coverage.enabled=false -t "keeps expedited receipt closed when assistant recovery package lookup fails"` failed with an unhandled assistant recovery backend rejection.
- GREEN: the same targeted test passed after wrapping assistant closure as a secondary fail-loud boundary.
- `npx vitest run tests/unit/purchase-board.test.ts --coverage.enabled=false` passed: 35 tests.
- `npm run test:unit:coverage` passed: 111 files / 1082 tests.
- `npm run lint` passed.
