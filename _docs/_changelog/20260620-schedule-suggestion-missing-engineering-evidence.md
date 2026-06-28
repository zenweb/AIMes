# 2026-06-20 Schedule suggestion missing engineering evidence

## Changed
- Tightened ScheduleBoard suggestion generation so fail-loud backend readback must return evidence, not just avoid throwing.
- Route capability, engineering change, and M-AL-6061 alternate-material suggestions now stop when backend readback returns no record.
- Updated material adoption coverage to require current alternate-material backend evidence before generating the released-material recommendation.

## Verified
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "no backend evidence"`
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "stale local alternate material"`
- `npm run test:unit -- tests/unit/schedule-board.test.ts`
- `npm run test:unit -- tests/unit/schedule-board.test.ts tests/unit/bom-board.test.ts tests/unit/engineering-constraint-panel.test.ts tests/unit/engineering-evidence-api.test.ts tests/unit/engineering-change-sync.test.ts tests/unit/shortage-risk-sync.test.ts`
