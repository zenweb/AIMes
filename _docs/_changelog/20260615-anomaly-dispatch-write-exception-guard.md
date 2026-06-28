# 2026-06-15 Changelog: anomaly dispatch write exception guard

- Added unit coverage for anomaly dispatch confirmation when evidence writing throws an exception.
- Locked the expected behavior: the lane stays retryable, no dispatch trace is rendered, and the fail-loud alert includes the thrown backend/audit error reason.
- Production code was unchanged; the existing `dispatchEventLane` catch branch already satisfies this behavior.

Validation:

- `npm run test:unit -- tests/unit/anomaly-board.test.ts -t "write throws"`: 1 passed.
- `npm run test:unit -- tests/unit/anomaly-board.test.ts`: 14 passed.
- `npm run test:unit:coverage -- tests/unit/anomaly-board.test.ts`: 14 passed; `AnomalyBoard.vue` line coverage `81.17%`.
