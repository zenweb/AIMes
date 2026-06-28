# 2026-06-15 Changelog: Purchase startup evidence restore

## Changed
- Added focused `PurchaseBoard` coverage for backend startup restoration of supply risk, supplier network, and outsourcing evidence.
- Verified restored evidence disables duplicate write actions and does not emit new audit writes on mount.
- No production code changed; the existing implementation already restored these backend-first states.

## Verification
- `npm run test:unit -- tests/unit/purchase-board.test.ts -t "restores backend supply"`: 1 passed.
- `npm run test:unit -- tests/unit/purchase-board.test.ts`: 25 passed.
- `npm run test:unit:coverage -- tests/unit/purchase-board.test.ts`: 25 passed; `PurchaseBoard.vue` lines `79.1%`.
