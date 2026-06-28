# Plan: Chat empty-state help links

Date: 2026-06-19
Status: Completed

## Success criteria

- The assistant empty state must include Simplified Chinese and English guidance.
- The empty state must expose contextual links to related evidence surfaces.
- A clickable help entry must resolve to a real `#assistant-help` section.
- The regression test must fail before implementation and pass after it.
- ChatPanel and frontend regression checks must remain green.

## Implementation

- Added bilingual empty-state copy in `ChatPanel.vue`.
- Added links to `/report`, `/audit-logs`, and `#assistant-help`.
- Added a compact in-panel help section for evidence-first complex assistant operations.
- Added a focused unit test in `tests/unit/chat-panel.test.ts`.

## Verification

- Targeted RED confirmed the prior empty state lacked English guidance and the help entry.
- Targeted GREEN passed after the UI update.
- `npx vitest run tests/unit/chat-panel.test.ts --coverage.enabled=false`: 69 passed.
- `npm run test:unit:coverage`: 111 files / 1075 tests passed.
- `npm run lint`: passed.
