# 2026-06-14 Chat Equipment Downtime Action Lock and Evidence

## Change
- Locked the AI assistant equipment downtime package action after the package is successfully generated.
- Reused the existing `completedActionIds` guard so repeated clicks cannot write duplicate equipment downtime or OTD evidence records.
- Extended the focused Chromium chat workflow to assert the equipment downtime package action is disabled after success.

## Evidence
- RED first: `npm run test:unit -- tests/unit/chat-panel.test.ts -t "locks the equipment downtime package action"`
  - Failed because the equipment downtime package button remained enabled after success.
- GREEN: `npm run test:unit -- tests/unit/chat-panel.test.ts -t "locks the equipment downtime package action"`
  - 1 focused test passed.
- `npm run test:unit -- tests/unit/chat-panel.test.ts`
  - 47 tests passed.
- `npm run test:e2e -- tests/e2e/chat.spec.ts -g "可执行动作：生成设备停机复核包并同步设备排产和审计" --project=chromium`
  - Chromium: 1 test passed.
- `npm run test:unit:coverage`
  - 105 files passed.
  - 767 tests passed.
  - Global lines: 84.02%.
  - `ChatPanel.vue` lines: 72.48%.

## Notes
- This is existing AI assistant action hardening, not new scope.
- Gray observation / 15-day monitoring remains skipped by owner direction and is not counted as a current blocker.
