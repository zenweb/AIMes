# 2026-06-19 Review: Risk action trace backend partial fallback

## Scope
- Reviewed `risk-action-sync.ts` local and backend-first reads.
- Focused on responsibility-action evidence before it feeds risk action queue, report center, and OTD review.

## Finding
- Local trace reads only required `id`, `title`, and `trace`.
- Backend-first reads accepted any non-empty backend list.
- Partial records could enter report evidence without owner, affected work orders, delivery impact, suggestion, status, or timestamp.

## Resolution
- Added `isRiskActionTrace` shape guard.
- Local reads now remove incomplete trace records.
- Backend-first reads now filter incomplete backend records and fall back to local complete records when no backend record is complete.

## Verification
- `npm run test:unit -- tests/unit/risk-action-sync.test.ts`: 7 passed.
- `npm run test:unit -- tests/unit/risk-action-queue-panel.test.ts`: 16 passed.
- `npm run test:unit -- tests/unit/report-board.test.ts -t "risk|风险|action|责任"`: 1 passed, 27 skipped by filter.
- `npm run test:unit -- tests/unit/risk-evidence-api.test.ts`: 2 passed.

## Residual Risk
- This is frontend evidence-shape containment. Live staging should still verify backend risk action trace records are complete.
