# 2026-06-15 Order Detail Panel Explanation Coverage Issue

## Issue

`OrderDetailPanel.vue` had accessibility coverage for modal/loading/error states, but thinner evidence for task-level scheduling explanation, close behavior, empty state, actual start time, and unknown status fallback.

## Impact

- A regression could hide why a work order was scheduled in its current slot.
- A regression could show blank status for a new backend status value.
- A regression could leave the empty detail panel silent.

## Resolution

- Added tests for custom explanation rendering, close event emission, empty state announcement, actual start display, and unknown status fallback.

