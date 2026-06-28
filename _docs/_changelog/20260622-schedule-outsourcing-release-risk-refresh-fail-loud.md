# Changelog - Schedule outsourcing release risk refresh fail-loud - 2026-06-22

## Changed
- Outsourcing schedule release now calls risk refresh in fail-loud mode.
- The existing release-risk test now verifies the release-specific fail-loud note and retained schedule release trace.

## Verified
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "risk refresh fails after release"`
- `npm run test:unit -- tests/unit/schedule-board.test.ts`
- `npm run test:unit`
