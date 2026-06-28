# Changelog: Chat empty-state help links

Date: 2026-06-19

## Changed

- Added bilingual first-use guidance to the AI production assistant empty state.
- Added contextual links from the empty state to:
  - `/report`
  - `/audit-logs`
  - `#assistant-help`
- Added an in-panel `#assistant-help` section with bilingual guidance for complex assistant actions.
- Added unit coverage proving the guidance copy and clickable help entry render.

## Verification

- RED: `npx vitest run tests/unit/chat-panel.test.ts --coverage.enabled=false -t "guides first-time assistant use with bilingual examples and a clickable help entry"` failed because the empty state only had Chinese hints and no help link.
- GREEN: the same targeted test passed after adding bilingual guidance and the help entry.
- `npx vitest run tests/unit/chat-panel.test.ts --coverage.enabled=false` passed: 69 tests.
- `npm run test:unit:coverage` passed: 111 files / 1075 tests.
- `npm run lint` passed.
