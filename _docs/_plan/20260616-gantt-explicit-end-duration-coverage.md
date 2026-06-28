# 2026-06-16 Gantt Explicit End Duration Coverage Plan

## Goal

Ensure Gantt rendering honors explicit backend schedule windows when a task includes both `start_date` and `end_date`.

## Success Criteria

- A task from `08:00` to `20:00` renders with dhtmlx `duration: 12`, not `24`.
- Existing tasks without `end_date` continue to derive their end date from internal day duration.
- Targeted Gantt unit coverage passes.
- Full frontend unit coverage passes.

## Execution

1. Re-baselined Gantt targeted coverage.
2. Read the conversion and drag-window logic around `toDhtmlxTask`, `toTaskDate`, and `getTaskEndDate`.
3. Added a failing regression test for explicit `end_date`.
4. Implemented the smallest conversion-layer fix.
5. Ran targeted and full frontend coverage.

## Next Slice Candidate

Continue by coverage leverage plus user-critical value. `AdminBoard.vue` remains a plausible next candidate because it is user-critical and currently has low branch/function coverage, but it needs a fresh baseline before any edit.
