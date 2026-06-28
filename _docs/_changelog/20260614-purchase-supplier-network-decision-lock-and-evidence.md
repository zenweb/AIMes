# 2026-06-14 Purchase Supplier Network Decision Lock and Evidence

## Change
- Locked the supplier network SLA decision action after a supplier decision has been generated.
- Added a handler-level guard so repeated clicks cannot write duplicate supplier network decisions or duplicate OTD evidence chain records.
- Extended the focused Chromium purchase workflow to assert the SLA decision button is disabled after selection.

## Evidence
- RED first: `npm run test:unit -- tests/unit/purchase-board.test.ts -t "locks supplier network SLA decision"`
  - Failed because the supplier network decision button was still enabled after selection.
- GREEN: `npm run test:unit -- tests/unit/purchase-board.test.ts -t "locks supplier network SLA decision"`
  - 1 focused test passed.
- `npm run test:unit -- tests/unit/purchase-board.test.ts`
  - 22 tests passed.
- `npm run test:unit -- tests/unit/purchase-board.test.ts -t "keeps supplier network decision pending"`
  - 1 focused regression test passed.
- `npm run test:e2e -- tests/e2e/purchase.spec.ts -g "供应商绩效 SLA 选优进入排产复核和 OTD 审计" --project=chromium`
  - Chromium: 1 test passed.
- `npm run test:unit:coverage`
  - 105 files passed.
  - 766 tests passed.
  - Global lines: 84.01%.
  - `PurchaseBoard.vue` lines: 78.18%.

## Notes
- This is existing purchase / supplier network workflow hardening, not new scope.
- Gray observation / 15-day monitoring remains skipped by owner direction and is not counted as a current blocker.
