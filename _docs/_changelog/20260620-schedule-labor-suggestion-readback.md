# 2026-06-20 Schedule labor suggestion readback

## Changed
- Updated ScheduleBoard labor suggestion generation to refresh backend labor evidence with `{ failLoud: true }` before producing:
  - labor qualification blocking recommendations
  - labor reassignment release recommendations
- If backend readback returns no matching labor evidence, the board now keeps the Agent suggestion empty and shows a visible error.
- Added regression coverage proving stale local labor block evidence cannot drive a user-triggered recommendation.

## Verified
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "stale local labor block"`
- `npm run test:unit -- tests/unit/schedule-board.test.ts`
- `npm run test:unit -- tests/unit/schedule-board.test.ts tests/unit/labor-assignment-sync.test.ts tests/unit/start-qualification-panel.test.ts tests/unit/skill-matrix-panel.test.ts`
