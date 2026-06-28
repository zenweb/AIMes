# 2026-06-16 Chat Shift Review Navigation Coverage

- Added direct regression coverage for `ChatPanel.vue` shift-review navigation actions.
- Covered the compound request that asks the assistant to open:
  - employee qualification / skill review,
  - real-time monitoring,
  - AI scheduling,
  - OTD reporting.
- Locked the user-critical assistant behavior that a shift review prompt exposes all relevant navigation entry points without duplicating the scheduling action.
- Production code was not changed.

## Verification

- `npm run test:unit -- tests/unit/chat-panel.test.ts --reporter=dot`
  - `1 file / 66 tests passed`.
- `npm run test:unit:coverage -- tests/unit/chat-panel.test.ts --reporter=dot --coverage.reporter=text`
  - `ChatPanel.vue`: statements `85.33%`, branches `77.41%`, functions `83.76%`, lines `85.85%`.
- `npm run test:unit -- tests/unit/chat-panel.test.ts tests/unit/router-auth.test.ts tests/unit/local-user.test.ts tests/unit/notifications.store.test.ts --reporter=dot`
  - `4 files / 98 tests passed`.
- `npm run test:unit:coverage -- --reporter=dot`
  - `111 files / 1033 tests passed`.
  - overall statements `88.74%`, branches `76.01%`, functions `88.46%`, lines `91.93%`.
