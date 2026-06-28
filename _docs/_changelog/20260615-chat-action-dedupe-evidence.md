# 2026-06-15 Changelog: chat action dedupe evidence

## Changed
- Added a ChatPanel unit regression for overlapping engineering constraint navigation actions.
- The test proves one question that matches both direct navigation and engineering constraint action groups renders only one `打开 AI 排产`, one `打开 BOM 管理`, and one `打开工艺路线` action.

## Verification
- `npm run test:unit:coverage` passed: 107 files / 823 tests, all-files line coverage `86.03%`.
- `npm run test:unit -- tests/unit/chat-panel.test.ts -t "deduplicates overlapping navigation actions"` passed: 1/1.
- `npm run test:unit -- tests/unit/chat-panel.test.ts` passed: 53/53.
- `npm run test:unit:coverage -- tests/unit/chat-panel.test.ts` passed: 53/53; `ChatPanel.vue` focused line coverage reports `75.6%`.

## Environment
- Docker Server remains unavailable from this shell (`dockerDesktopLinuxEngine` pipe missing), so Docker-backed host `5002` smoke was not rerun.
