# 2026-06-14 Chat Anomaly Action Lock and Evidence

## Change
- Locked the AI assistant anomaly disposition card action after the card is successfully generated.
- Reused the existing `completedActionIds` guard so repeated clicks cannot write duplicate anomaly disposition packages or duplicate assistant action audits.
- Extended the focused Chromium chat workflow to assert the anomaly disposition action is disabled after success.

## Evidence
- RED first: `npm run test:unit -- tests/unit/chat-panel.test.ts -t "locks the anomaly disposition package action"`
  - Failed because the anomaly disposition card button remained enabled after success.
- GREEN: `npm run test:unit -- tests/unit/chat-panel.test.ts -t "locks the anomaly disposition package action"`
  - 1 focused test passed.
- `npm run test:unit -- tests/unit/chat-panel.test.ts`
  - 48 tests passed.
- `npm run test:e2e -- tests/e2e/chat.spec.ts -g "可执行动作：创建异常处置卡并联动风险排产和审计" --project=chromium`
  - Chromium: 1 test passed.
- `npm run test:unit:coverage`
  - 105 files passed.
  - 768 tests passed.
  - Global lines: 84.02%.
  - `ChatPanel.vue` lines: 72.62%.

## Notes
- This is existing AI assistant anomaly workflow hardening, not new scope.
- Gray observation / 15-day monitoring remains skipped by owner direction and is not counted as a current blocker.
