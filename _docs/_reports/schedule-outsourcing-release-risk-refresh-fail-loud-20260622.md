# Schedule outsourcing release risk refresh fail-loud evidence - 2026-06-22

## Scope
- Hardened the Scheduler Pro Workbench outsourcing commitment release path.
- After a received outsourcing commitment is adopted and released into the schedule, a risk-event refresh failure must be visible without losing the release confirmation.

## Root Cause
- The release path already had a dedicated catch block for post-release risk refresh failures.
- `loadRiskTriggeredEvents` default behavior intentionally swallowed risk dashboard failures for startup and ordinary refresh.
- The outsourcing release path was still using the default quiet mode, so the dedicated release catch could not emit its business-specific note.

## Change
- Reused the opt-in `loadRiskTriggeredEvents({ failLoud: true })` mode for outsourcing schedule release.
- Tightened the existing unit test to assert the release-specific note:
  - risk refresh failed,
  - the release confirmation remains,
  - the schedule release trace stays visible.

## Evidence
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "risk refresh fails after release"` passed, 1 focused test.
- `npm run test:unit -- tests/unit/schedule-board.test.ts` passed, 42 tests.
- `npm run test:unit` passed, 118 files / 1242 tests.

## Result
- PASS. Outsourcing release confirmation remains visible after risk refresh failure.
- PASS. The UI now emits release-specific fail-loud guidance instead of only the generic risk-event fallback.
