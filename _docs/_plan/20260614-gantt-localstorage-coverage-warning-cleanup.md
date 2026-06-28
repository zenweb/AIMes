# Plan - Gantt localStorage coverage warning cleanup

## Success Criteria
- The `--localstorage-file` warning is traced to a concrete source.
- The fix preserves Gantt live/demo mode behavior.
- Focused Gantt tests pass.
- Focused and full coverage pass with `NODE_OPTIONS=--trace-warnings` and no warning.
- The runner constraint discovered during diagnosis is recorded.

## Execution
- Search repo scripts/config for `localstorage-file`.
- Reproduce with `NODE_OPTIONS=--trace-warnings`.
- Narrow the trigger to `GanttChart.vue`.
- Apply the smallest localStorage safety/test-environment fix.
- Run focused unit, focused coverage, and full coverage.

## Result
- Completed.
- Full frontend coverage: 106 files / 787 tests passed; global line coverage 84.29%.
- The previous `--localstorage-file` warning is absent from the verified full coverage output.
