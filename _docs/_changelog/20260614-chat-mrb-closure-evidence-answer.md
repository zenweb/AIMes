# 2026-06-14 Chat MRB Closure Evidence Answer

## Change
- Added focused unit evidence for `ChatPanel.vue` answering MRB closure impact questions when RAG falls back.
- Covered closed MRB disposition evidence including disposition result, quality event, OTD impact, schedule impact, audit traces, closure traces, and action results.
- Made the `readQualityMrbDispositionRecord` test mock controllable so the assistant branch can be verified with realistic closed evidence.

## Evidence
- `npm run test:unit -- tests/unit/chat-panel.test.ts`
  - 1 file passed.
  - 42 tests passed.
- `npm run test:unit:coverage -- tests/unit/chat-panel.test.ts`
  - `ChatPanel.vue`: lines 71.79%.
- `npm run test:e2e -- tests/e2e/quality.spec.ts -g "质量 MRB 报废补料决策联动排产和 OTD 复盘"`
  - Chromium: 1 test passed.
- `npm run test:unit:coverage`
  - 105 files passed.
  - 678 tests passed.
  - global lines 82.85%.

## Notes
- No production code change was required; the existing assistant branch already explained closed MRB evidence correctly.
- This slice moved `ChatPanel.vue` focused line coverage from about 70.60% to 71.79%.
- Gray observation / 15-day monitoring remains skipped/deferred by owner direction and is not counted as a current blocker.
