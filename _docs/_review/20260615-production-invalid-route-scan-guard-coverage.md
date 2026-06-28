# Production invalid route scan guard coverage review

## Scope

- Reviewed ProductionBoard invalid route `scanCode` behavior after a work order is selected.
- Code changed only in `src/frontend/tests/unit/production-board.test.ts`.

## Findings

- Existing implementation safely ignores invalid route scan-code values that cannot become a work-order barcode.
- The added regression protects the operator from a bad URL/query handoff clearing or replacing the current production reporting context.
- This slice improves branch/statement confidence more than line coverage; line coverage stays at 82.6% for `ProductionBoard.vue`.

## Verification

- ProductionBoard targeted unit tests passed.
- Production API targeted unit tests passed.
- Targeted and full frontend coverage passed.

## Residual risk

- This does not verify Nuxt router navigation in a real browser.
- Browser evidence should be used if actual route navigation behavior changes.
