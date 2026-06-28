# Changelog: Chat navigation success lock

Date: 2026-06-19

## Changed

- Locked successful plain assistant navigation actions in `ChatPanel.vue`.
- After a normal `navigate` or `schedule_suggestion` action successfully routes to its target page, the action button is disabled through the existing `completedActionIds` guard.
- This prevents repeated clicks from duplicating route changes, success status messages, and successful action audit evidence.
- Added unit coverage in `chat-panel.test.ts` for successful plain navigation dedupe.

## Verification

- RED: `npx vitest run tests/unit/chat-panel.test.ts --coverage.enabled=false -t "locks a successful plain navigation action"` failed because the successful navigation button remained enabled.
- GREEN: the same targeted test passed after locking the action id after successful `router.push`.
- `npx vitest run tests/unit/chat-panel.test.ts --coverage.enabled=false`: 71 passed.
- `npm run test:unit:coverage`: 111 files / 1086 tests passed.
- `npm run lint`: passed.
- `npm run build`: passed.

## Release note

This is an auditability and duplicate-action guard for an existing AI assistant path. It does not expand product scope.
