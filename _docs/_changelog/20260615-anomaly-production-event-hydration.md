# 2026-06-15 Changelog: anomaly production event hydration

- Added unit coverage for `AnomalyBoard` loading the latest production anomaly event from backend-first sync.
- Verified the mapped production anomaly event is inserted at the top of the anomaly list and replaces stale list items with the same id.
- Verified opening that event uses `toProductionAnomalyDetail` instead of refetching with `getAnomalyById`.
- Production code was unchanged; existing hydration and detail mapping behavior already satisfies the test.

Validation:

- `npm run test:unit -- tests/unit/anomaly-board.test.ts -t "latest production anomaly event"`: 1 passed.
- `npm run test:unit -- tests/unit/anomaly-board.test.ts`: 15 passed.
- `npm run test:unit:coverage -- tests/unit/anomaly-board.test.ts`: 15 passed; `AnomalyBoard.vue` line coverage `82.94%`.
