# Issue - Gantt localStorage coverage warning cleanup

## Problem
- Full frontend coverage passed but emitted `Warning: --localstorage-file was provided without a valid path`.
- The warning polluted audit evidence and made it unclear whether coverage was clean.

## Root Cause
- `GanttChart.vue` checked explicit live mode during setup and accessed `window.localStorage`.
- In the Vitest jsdom environment, `gantt-chart.test.ts` had not installed the repo-local memory localStorage stub before mounting the component, so Node's native Web Storage emitted the warning.

## Fix
- Wrapped the localStorage handle access in the existing safety path.
- Installed memory localStorage in `gantt-chart.test.ts` before each test.
- Added regression coverage for an unavailable storage handle.

## Verification
- Focused Gantt unit and focused coverage pass without warning.
- Full frontend coverage passes without warning.

## Related Runner Constraint
- Running multiple coverage commands in parallel can fail with `coverage/.tmp` ENOENT because Vitest coverage runs share the same temp directory.
