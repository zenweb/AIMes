# 2026-06-16 Purchase Expedite Receipt Closure Coverage Plan

## Goal

Strengthen the existing purchase rush-receipt path so the critical shortage-risk closure behavior is covered by regression evidence.

## Success Criteria

- A rush shortage purchase can be generated and received in the test.
- Receipt writes shortage-risk resolution evidence.
- Receipt writes closed OTD evidence.
- Matching assistant recovery purchase action is closed.
- UI shows the shortage risk has dropped and the shortage quantity is zero.
- No alert is displayed on the successful path.
- Targeted and full frontend verification pass.

## Result

All success criteria passed through unit regression evidence. No production code was required.

## Next Candidate

Continue with existing user-critical paths by coverage leverage. Good next candidates remain:

- `ProductionBoard.vue`, especially scanned quality failure or route completion evidence.
- `BomBoard.vue`, only if the owner selects a specific remaining BOM behavior.
- `PurchaseBoard.vue` only if a future slice protects another user-critical purchase workflow rather than chasing residual line coverage.
