# Changelog: Risk action queue aggregate source failures

Date: 2026-06-19

## Changed

- Fixed startup risk source load failures in `RiskActionQueuePanel` so multiple failed sources stay visible in the same assertive alert.
- Preserved base risk cards when anomaly dispatch and assistant recovery source reads both fail.
- Kept existing single-source failure behavior and operation failure behavior unchanged.
- Added unit coverage proving earlier startup failure evidence is not overwritten by a later source failure.

## Verification

- RED: `npx vitest run tests/unit/risk-action-queue-panel.test.ts --coverage.enabled=false -t "keeps all startup risk source failures visible"` failed because only the later assistant recovery failure was rendered.
- GREEN: the same targeted test passed after aggregating startup source failures.
- `npx vitest run tests/unit/risk-action-queue-panel.test.ts --coverage.enabled=false` passed: 15 tests.
- `npm run test:unit:coverage` passed: 111 files / 1079 tests.
- `npm run lint` passed.
