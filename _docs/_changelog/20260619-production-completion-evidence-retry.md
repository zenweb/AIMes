# Changelog: Production completion evidence retry

Date: 2026-06-19

## Changed

- Fixed `ProductionBoard` completion failure recovery when backend completion succeeds but OTD/quality evidence archival fails.
- Released the in-flight completion guard on evidence archival failure so operators can retry from the same dialog.
- Restored optimistic local operation and work-order state after evidence archival failure, avoiding a false completed UI state.
- Added unit coverage proving the second completion attempt calls the backend again and can complete successfully after the first evidence archival failure.

## Verification

- RED: `npx vitest run tests/unit/production-board.test.ts --coverage.enabled=false -t "lets operators retry completion after evidence archival fails"` failed because the second click did not call `completeOperation`.
- GREEN: the same targeted test passed after releasing the completion guard and rolling back local optimistic state on evidence archival failure.
- `npx vitest run tests/unit/production-board.test.ts --coverage.enabled=false` passed: 37 tests.
- `npm run test:unit:coverage` passed: 111 files / 1081 tests.
- `npm run lint` passed.
