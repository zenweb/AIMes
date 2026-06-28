# 2026-06-22 Schedule Assistant Recovery Handoff Fail-Loud

## Changed
- Added fail-loud refresh handling after Assistant recovery handoff closure.
- Kept the locally closed recovery package visible when backend readback fails or omits the closed package.
- Added visible feedback sync notes for closure-save failure, backend refresh failure, and backend omission.
- Added focused unit coverage for the three handoff failure modes.

## Verified
- `npm run test:unit -- tests/unit/schedule-board.test.ts` -> 76 passed.
- `git diff --cached --check` -> passed.
