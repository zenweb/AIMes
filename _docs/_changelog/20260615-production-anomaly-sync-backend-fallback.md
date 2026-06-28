# 2026-06-15 Changelog: production anomaly sync backend fallback

- Added utility coverage for `readProductionAnomalyEventBackendFirst` when the backend latest-event read fails.
- Verified the production anomaly sync chain falls back to the local stored event and still calls the backend latest-event endpoint.
- Production code was unchanged; the existing backend-first reader already satisfies the fallback behavior.

Validation:

- `npm run test:unit -- tests/unit/production-anomaly-sync.test.ts -t "backend read fails"`: 1 passed.
- `npm run test:unit -- tests/unit/production-anomaly-sync.test.ts`: 6 passed.
- `npm run test:unit:coverage -- tests/unit/production-anomaly-sync.test.ts`: 6 passed; `production-anomaly-sync.ts` line coverage `95.65%`.
