# 2026-06-14 Chat Startup Context Aggregate Fail-Loud

## Change
- Hardened `ChatPanel.vue` startup behavior when multiple assistant context sources fail.
- Startup failures from anomaly dispatch records, monitoring situation escalations, and risk SLA review are now accumulated and surfaced as one fail-loud alert.
- Preserved the chat entry: the input remains usable and offline/local-context answers can still continue.
- Added unit and Chromium evidence for the multi-source startup failure path.

## Evidence
- RED first:
  - `npm run test:unit -- tests/unit/chat-panel.test.ts -t "aggregates every startup context sync failure into one fail-loud alert"`
  - Failed because 3 startup context alerts were rendered instead of 1.
- GREEN:
  - `npm run test:unit -- tests/unit/chat-panel.test.ts -t "aggregates every startup context sync failure into one fail-loud alert"`
  - 1 focused test passed.
- `npm run test:unit -- tests/unit/chat-panel.test.ts`
  - 1 file passed.
  - 43 tests passed.
- `npm run test:unit:coverage -- tests/unit/chat-panel.test.ts`
  - `ChatPanel.vue`: focused lines 72.02%.
- `npm run test:e2e -- tests/e2e/chat.spec.ts -g "启动上下文多源同步失败时真实浏览器只展示一条聚合 fail-loud 告警"`
  - Chromium: 1 test passed.
- `npm run test:e2e -- tests/e2e/chat.spec.ts`
  - Chromium: 36 tests passed.
- `npm run test:unit:coverage`
  - 105 files passed.
  - 681 tests passed.
  - global lines 82.93%.

## Notes
- This slice moved `ChatPanel.vue` focused line coverage from 71.79% to 72.02%.
- The fix is UX/reliability hardening for an existing global assistant entry; no new product scope was added.
- Gray observation / 15-day monitoring is skipped/deferred by owner direction and is not counted as a current blocker.
