# 2026-06-16 Purchase Expedite Receipt Closure Coverage

- Resumed the AIMes V1 continuation from `hold_on` for one boutique hardening slice.
- Added unit regression coverage for `PurchaseBoard.vue` expedited shortage receipt success closure.
- Locked the business intent that a successful rush receipt must:
  - call purchase receipt with the rush order and material shortage quantity;
  - write shortage-risk resolution evidence with the received purchase order number;
  - write closed OTD evidence for purchase receipt;
  - close the matching assistant recovery purchase action;
  - update the UI from `已加急` to `风险下降`;
  - show zero shortage and the assistant recovery summary;
  - avoid any alert on the successful path.
- No production component code was changed; the existing behavior was made auditable by regression evidence.

## Verification

- `npm run test:unit -- tests/unit/purchase-board.test.ts -t "closes expedited shortage risk" --reporter=dot`
  - `1 passed | 33 skipped`
- `npm run test:unit:coverage -- tests/unit/purchase-board.test.ts --reporter=dot --coverage.reporter=text`
  - `1 file / 34 tests passed`
  - `PurchaseBoard.vue`: statements `87.53%`, branches `85.84%`, functions `87.5%`, lines `91.04%`
- `npm run test:unit:coverage -- --reporter=dot`
  - `111 files / 1036 tests passed`
  - all files: statements `88.87%`, branches `76.1%`, functions `88.54%`, lines `92.07%`

## Fail Loud Notes

- An earlier parallel coverage baseline attempt caused Vitest to report that `coverage/.tmp` had been removed. Sequential rerun passed, confirming it was a coverage directory write conflict rather than a production test failure.
