# 2026-06-20 Schedule outsourcing suggestion readback

## Changed
- Updated ScheduleBoard outsourcing commitment suggestion generation to refresh backend evidence with `{ failLoud: true }` before producing release or review recommendations.
- If backend readback returns no matching outsourcing commitment, the board now keeps the Agent suggestion empty and shows a visible error.
- Added regression coverage proving stale local outsourcing receipt evidence cannot drive a user-triggered release recommendation.

## Verified
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "stale local outsourcing receipt"`
- `npm run test:unit -- tests/unit/schedule-board.test.ts`
- `npm run test:unit -- tests/unit/schedule-board.test.ts tests/unit/outsourcing-commitment-sync.test.ts tests/unit/otd-kpi-commitment-sync.test.ts tests/unit/report-board.test.ts`
