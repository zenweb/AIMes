# 2026-06-14 Chat Equipment Downtime Evidence Answer

## Change
- Added focused unit evidence for the existing `ChatPanel` equipment-downtime business answer.
- Covered the RAG fallback path where the assistant reads the latest CNC-001 OTD equipment-maintenance evidence and explains production impact without falling back to the no-evidence message.

## Evidence
- `npm run test:unit -- tests/unit/chat-panel.test.ts`
  - 1 file passed.
  - 41 tests passed.
- `npm run test:unit:coverage -- tests/unit/chat-panel.test.ts`
  - `ChatPanel.vue`: lines 70.60%.
- `npm run test:unit:coverage`
  - 105 files passed.
  - 673 tests passed.
  - global lines 82.51%.
- `npm run test:e2e -- tests/e2e/chat.spec.ts -g "业务问答：设备停机证据生成后解释 CNC-001 影响"`
  - Nuxt production build passed.
  - Chromium 1 test passed.

## Notes
- No production code change was required; the existing implementation already selected the latest CNC-001 downtime evidence.
- Gray observation / 15-day monitoring remains skipped/deferred by owner direction and is not counted as completed.
