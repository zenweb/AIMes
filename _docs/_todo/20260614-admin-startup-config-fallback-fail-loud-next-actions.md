# Next Actions - Admin startup config fallback fail loud

## Done
- Added unit coverage for combined governance evidence, system config, and notification config startup failures.
- Added Chromium coverage proving the real browser shows config fallback failures and still renders fallback data.
- Aggregated Admin startup failures so local demo fallback data is no longer silent.

## Next
- Continue selecting existing-feature slices by coverage leverage and user-criticality.
- Candidate next targets: `ScheduleBoard.vue` lower-branch user paths or `AnomalyBoard.vue` remaining branch gaps.
- Avoid further Admin gray-decision refinement unless new evidence shows a correctness or UX gap.

## Deferred
- Investigate coverage `--localstorage-file` warning as a separate cleanup.
- Owner-deferred gray observation remains out of the current execution path.
