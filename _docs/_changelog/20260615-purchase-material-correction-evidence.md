# 2026-06-15 Changelog: purchase material correction evidence

## Changed
- Added a unit regression for the purchase board material anomaly correction success path.
- The test proves a routed material anomaly can lock supplier corrective action, write supply risk evidence, write OTD evidence, and update the visible trace without showing an alert.

## Verification
- `npm run test:unit -- tests/unit/purchase-board.test.ts -t "locks material supplier correction"` passed: 1/1.
- `npm run test:unit -- tests/unit/purchase-board.test.ts` passed: 26/26.
- `npm run test:unit:coverage -- tests/unit/purchase-board.test.ts` passed: 26/26; `PurchaseBoard.vue` line coverage reports `79.7%`.
