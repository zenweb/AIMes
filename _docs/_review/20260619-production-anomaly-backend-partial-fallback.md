# 2026-06-19 Review: Production anomaly backend partial fallback

## Scope
- Reviewed `production-anomaly-sync.ts` backend-first reads.
- Focused on anomaly evidence completeness before it feeds anomaly board, risk action queue, and production exception follow-up.

## Finding
- Local reads already removed incomplete anomaly events.
- Backend-first reads trusted the latest backend record directly, so partial events could override a complete local production anomaly.

## Resolution
- Reused `isProductionAnomalyEvent` at the backend-first boundary.
- Backend records that fail the guard now fall back to local complete evidence.

## Verification
- `npm run test:unit -- tests/unit/production-anomaly-sync.test.ts`: 7 passed.
- `npm run test:unit -- tests/unit/anomaly-board.test.ts -t "production|生产|anomaly|异常"`: 12 passed, 10 skipped by filter.
- `npm run test:unit -- tests/unit/risk-action-queue-panel.test.ts -t "production|生产|anomaly|异常"`: 2 passed, 14 skipped by filter.
- `npm run test:unit -- tests/unit/risk-evidence-api.test.ts`: 2 passed.
- `npm run test:unit -- tests/unit/production-board.test.ts -t "anomaly|异常|exception"`: 6 passed, 33 skipped by filter.

## Residual Risk
- This is frontend evidence-shape containment. Live staging should still verify backend production anomaly records are complete.
