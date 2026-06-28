# Next Actions - Gantt localStorage coverage warning cleanup

## Done
- Traced the `--localstorage-file` warning to `GanttChart.vue` setup-time storage access.
- Added a regression for an unavailable `window.localStorage` handle.
- Reused `installMemoryLocalStorage()` in `gantt-chart.test.ts`.
- Re-ran focused and full coverage with `NODE_OPTIONS=--trace-warnings`; warning is gone.

## Next
- Keep coverage verification serial, or configure isolated coverage directories for parallel diagnosis.
- Continue routing by user-criticality and coverage leverage.
- Candidate next targets remain:
  - `AnomalyBoard.vue`: 77.64% lines.
  - `ReportBoard.vue`: 78.54% lines.
  - `ProductionBoard.vue`: 79.16% lines.

## Deferred
- A global Vitest setup for memory localStorage is not needed yet; revisit only if the same warning reappears in another component test.
