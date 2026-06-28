# 2026-06-16 Gantt Init Fail Loud Plan

## Goal

Make real Gantt initialization fail loud instead of crashing the scheduling view.

## Success Criteria

- A thrown `gantt.init` error is caught.
- The schedule view renders a visible alert with the initialization failure reason.
- `gantt.parse` is not called after failed initialization.
- Targeted Gantt unit coverage passes.
- Full frontend unit coverage passes.

## Execution

1. Re-baselined GanttChart targeted coverage.
2. Read initialization, mount, and data-load flow.
3. Added a failing regression test for `gantt.init` throwing.
4. Implemented a minimal boolean return from `initGantt`.
5. Guarded mounted `loadData` behind successful initialization.
6. Ran targeted and full frontend coverage.

## Next Slice Candidate

Continue by coverage leverage plus user-critical value. Gantt remains a good candidate only if the next slice starts from a fresh baseline and a concrete planner workflow risk.
