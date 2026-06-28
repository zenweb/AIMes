# Review - Gantt localStorage coverage warning cleanup

## Scope
- Reviewed `src/frontend/src/components/gantt/GanttChart.vue`.
- Reviewed `src/frontend/tests/unit/gantt-chart.test.ts`.
- Reviewed `src/frontend/tests/unit/test-storage.ts`.

## Findings
- The coverage warning was not caused by Vitest config or the coverage provider.
- Trace output showed `GanttChart.vue` reading `window.localStorage` during setup, which touched Node's native Web Storage in the jsdom test environment and emitted `--localstorage-file was provided without a valid path`.
- Parallel coverage diagnosis also revealed a separate runner constraint: multiple simultaneous coverage runs can conflict over `coverage/.tmp`.

## Decision
- Kept production behavior: explicit `aimes_offline_demo=false` still forces real dhtmlx live mode, and unavailable storage still falls back to real gantt rather than lightweight demo markers.
- Used the existing memory localStorage helper in the Gantt unit test, matching other storage-heavy tests.
- Did not add a global Vitest setup file because a local test fix was enough for the observed warning.

## Residual Risk
- Full coverage is now warning-free in the verified command, but future tests that mount storage-reading components without `installMemoryLocalStorage()` can reintroduce the same warning.
- Coverage commands should remain serial unless each run has a separate reports directory.
