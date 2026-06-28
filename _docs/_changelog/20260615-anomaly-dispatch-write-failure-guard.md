# 2026-06-15 Changelog: anomaly dispatch write failure guard

- Added unit coverage for anomaly dispatch confirmation when downstream evidence cannot be written.
- Locked the expected fail-loud behavior: the lane remains actionable, no dispatch trace is rendered, and the user sees the storage-unavailable alert.
- Production code was unchanged; the existing `dispatchEventLane` failure branch already satisfies the expected behavior.

Validation:

- `npm run test:unit -- tests/unit/anomaly-board.test.ts -t "keeps a dispatch lane actionable"`: 1 passed.
- `npm run test:unit -- tests/unit/anomaly-board.test.ts`: 13 passed.
- `npm run test:unit:coverage -- tests/unit/anomaly-board.test.ts`: 13 passed; `AnomalyBoard.vue` line coverage `79.41%`.
