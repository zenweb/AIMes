# 2026-06-20 Schedule engineering evidence fail-loud

## Changed
- Updated ScheduleBoard engineering adoption / release paths to request audit-grade backend readback for:
  - alternate material approval
  - engineering change impact
  - route capability validation
- Kept startup engineering constraint loading usable: startup failures are aggregated into visible warnings instead of blocking the schedule board.
- Added regression coverage proving the ScheduleBoard user-action paths pass `{ failLoud: true }`.

## Verified
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "startup engineering constraint sync fails|route capability blocking adoption|route capability release adoption"`
- `npm run test:unit -- tests/unit/schedule-board.test.ts tests/unit/bom-board.test.ts tests/unit/engineering-evidence-api.test.ts tests/unit/engineering-change-sync.test.ts tests/unit/shortage-risk-sync.test.ts`
- `npm run test:unit -- tests/unit/schedule-board.test.ts tests/unit/bom-board.test.ts tests/unit/engineering-constraint-panel.test.ts tests/unit/engineering-evidence-api.test.ts tests/unit/engineering-change-sync.test.ts tests/unit/shortage-risk-sync.test.ts`
- `npm run build`
