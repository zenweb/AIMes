# 2026-06-14 Chat Engineering Constraint Action Lock and Evidence

## Change
- Locked the AI assistant engineering constraint package action after the package is successfully generated.
- Reused the existing `completedActionIds` guard so repeated clicks cannot write duplicate engineering constraint packages or duplicate assistant action audits.
- Extended the focused Chromium chat workflow to assert the engineering constraint package action is disabled after success.

## Evidence
- RED first: `npm run test:unit -- tests/unit/chat-panel.test.ts -t "locks the engineering constraint package action"`
  - Failed because the engineering constraint package button remained enabled after success.
- GREEN: `npm run test:unit -- tests/unit/chat-panel.test.ts -t "locks the engineering constraint package action"`
  - 1 focused test passed.
- `npm run test:unit -- tests/unit/chat-panel.test.ts`
  - 50 tests passed.
- `npm run test:e2e -- tests/e2e/chat.spec.ts -g "可执行动作：生成工程约束复核包并同步排产证据与审计" --project=chromium`
  - Chromium: 1 test passed.
- `npm run test:unit:coverage`
  - 105 files passed.
  - 770 tests passed.
  - Global lines: 84.03%.
  - `ChatPanel.vue` lines: 72.88%.

## Notes
- This is existing AI assistant engineering constraint workflow hardening, not new scope.
- Gray observation / 15-day monitoring remains skipped by owner direction and is not counted as a current blocker.
