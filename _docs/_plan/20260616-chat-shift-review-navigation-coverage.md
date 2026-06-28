# 2026-06-16 Chat Shift Review Navigation Coverage Plan

## Objective

Move away from `ScheduleBoard.vue` micro-slices and harden a user-critical assistant entry path with better coverage leverage.

## Success Criteria

- Choose a current medium-coverage, user-critical component.
- Add one focused test for a real assistant navigation workflow.
- Verify targeted `ChatPanel` tests and coverage.
- Verify related routing/user-state regression.
- Verify full frontend coverage.

## Outcome

- `ChatPanel.vue` selected as the next slice because it is a user-facing assistant entry point and had lower coverage than the recently refined schedule paths.
- Added the shift-review navigation regression.
- All verification passed.

## Next Slice

Continue choosing by coverage leverage and user-critical value. Candidate areas after this slice include `BomBoard.vue`, `PurchaseBoard.vue`, `ProductionBoard.vue`, or the remaining high-value `ChatPanel.vue` anomaly/production navigation branches if selected intentionally.
