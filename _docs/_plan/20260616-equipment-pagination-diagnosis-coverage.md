# 2026-06-16 Equipment Pagination And Diagnosis Coverage Plan

## Goal

Harden the existing equipment maintenance board by proving page navigation and successful fault diagnosis output.

## Scope

- Existing feature only: `EquipmentBoard.vue`.
- No new equipment-management scope.
- No production-code change unless tests expose a real defect.

## Steps

1. Establish EquipmentBoard targeted coverage baseline.
2. Confirm `EquipmentScheduleImpactPanel.vue` already has dedicated tests and isolate it from the board suite.
3. Add focused evidence for loading page 2 without stale page 1 cards.
4. Add focused evidence for successful backend diagnosis rendering.
5. Verify targeted new tests, targeted EquipmentBoard coverage, and full frontend coverage.
6. Update docs and task state.

## Result

Completed. EquipmentBoard pagination and diagnosis success evidence is now explicit, targeted coverage is properly isolated, and full frontend regression remains green.
