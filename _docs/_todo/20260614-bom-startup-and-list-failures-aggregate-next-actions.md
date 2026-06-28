# Next Actions - BOM startup and list failures aggregate

## Done
- Added unit coverage for combined startup engineering evidence failure and BOM list fallback failure.
- Added Chromium coverage for the same real browser path.
- Split BOM fail-loud state so unrelated failure sources no longer overwrite each other.

## Next
- Continue selecting existing-feature slices by user-criticality and coverage leverage.
- Candidate next targets: `AdminBoard.vue` governance paths or `ScheduleBoard.vue` lower-branch paths.
- Avoid further BOM fail-loud refinement unless new evidence shows another correctness gap.

## Deferred
- Investigate coverage `--localstorage-file` warning as a separate cleanup.
- Owner-deferred gray observation remains out of the current execution path.
