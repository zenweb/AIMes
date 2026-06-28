# 2026-06-16 Gantt Month Scale And Unmount Clear Coverage Plan

## Goal

Harden the existing scheduling Gantt by proving long-window month review and route-leave cleanup behaviors.

## Scope

- Existing feature only: `GanttChart.vue`.
- No new Gantt features.
- No production-code change unless tests expose a real defect.

## Steps

1. Establish Gantt targeted coverage baseline.
2. Inspect uncovered or weakly asserted planning behaviors.
3. Add focused unit evidence for month-scale review configuration.
4. Add focused unit evidence for dhtmlx data clearing on unmount.
5. Verify targeted new tests, targeted Gantt coverage, and full frontend coverage.
6. Update docs and task state.

## Result

Completed. Gantt month-scale and unmount-clear acceptance evidence is now explicit, and full frontend regression remains green.
