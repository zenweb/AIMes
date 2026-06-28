# Changelog: Chat navigation failure audit

Date: 2026-06-19

## Changed

- Hardened plain navigation actions in `ChatPanel.vue`.
- When a normal assistant navigation action fails, the assistant now:
  - announces the route failure as an assertive alert;
  - writes a failed action audit with `permitted: false`;
  - stops before emitting the generic `动作已执行` status message.
- If the failure audit write also fails, the assistant emits a second fail-loud alert instead of hiding the audit problem.
- Added unit coverage in `chat-panel.test.ts` for both the navigation failure and failure-audit failure paths.

## Verification

- RED: `npx vitest run tests/unit/chat-panel.test.ts --coverage.enabled=false -t "announces when a plain navigation action fails"` failed because a status success message still appeared after route failure.
- GREEN: the same targeted test passed after returning from the failed navigation path.
- Additional check: `npx vitest run tests/unit/chat-panel.test.ts --coverage.enabled=false -t "fails loud when a plain navigation failure audit"` passed.
- `npx vitest run tests/unit/chat-panel.test.ts --coverage.enabled=false`: 70 passed.
- `npm run test:unit:coverage`: 111 files / 1085 tests passed.
- `npm run lint`: passed.
- `npm run build`: passed.

## Release note

This is a correctness and audit-truthfulness fix for an existing AI assistant path. It does not expand product scope.
