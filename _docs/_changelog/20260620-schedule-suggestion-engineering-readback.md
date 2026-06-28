# 2026-06-20 Schedule suggestion engineering readback

## Changed
- Updated ScheduleBoard suggestion generation to refresh backend evidence with `{ failLoud: true }` before generating:
  - route capability suggestions
  - engineering change suggestions
  - M-AL-6061 alternate-material suggestions
- If readback fails, the board now clears the active suggestion and shows a visible error instead of using stale local evidence.
- Added regression coverage for stale local alternate-material evidence.

## Verified
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "stale local alternate material"`
- `npm run test:unit -- tests/unit/schedule-board.test.ts`
- `npm run test:unit -- tests/unit/schedule-board.test.ts tests/unit/bom-board.test.ts tests/unit/engineering-constraint-panel.test.ts tests/unit/engineering-evidence-api.test.ts tests/unit/engineering-change-sync.test.ts tests/unit/shortage-risk-sync.test.ts`
