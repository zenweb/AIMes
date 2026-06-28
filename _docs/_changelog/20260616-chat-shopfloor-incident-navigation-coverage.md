# 2026-06-16 Chat Shopfloor Incident Navigation Coverage

- Added direct regression coverage for `ChatPanel.vue` shopfloor incident navigation.
- Covered the compound request that asks the assistant to open:
  - anomaly center / shopfloor event handling,
  - production reporting.
- Locked the user-critical assistant behavior that an incident prompt exposes both execution entry points once and does not duplicate actions.
- Production code was not changed.

## Verification

- `npm run test:unit -- tests/unit/chat-panel.test.ts --reporter=dot`
  - `1 file / 67 tests passed`.
- `npm run test:unit:coverage -- tests/unit/chat-panel.test.ts --reporter=dot --coverage.reporter=text`
  - `ChatPanel.vue`: statements `85.64%`, branches `77.65%`, functions `83.76%`, lines `86.17%`.
- `npm run test:unit -- tests/unit/chat-panel.test.ts tests/unit/router-auth.test.ts tests/unit/local-user.test.ts tests/unit/notifications.store.test.ts --reporter=dot`
  - `4 files / 99 tests passed`.
- `npm run test:unit:coverage -- --reporter=dot`
  - `111 files / 1034 tests passed`.
  - overall statements `88.76%`, branches `76.02%`, functions `88.46%`, lines `91.94%`.
