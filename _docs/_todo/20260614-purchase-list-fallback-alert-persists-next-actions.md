# Next Actions - Purchase list fallback alert persists

## Done
- Added unit coverage for initial purchase list fallback alert persistence after later confirmation success.
- Added Chromium coverage for the same user path.
- Reclassified the initial list fallback warning into the startup fail-loud lane.

## Next
- Continue selecting slices by coverage leverage and user-criticality.
- Candidate next targets remain low-coverage critical boards such as `ScheduleBoard.vue`, `BomBoard.vue`, or `AdminBoard.vue`.
- Do not refine this PurchaseBoard path again unless a new real defect appears.

## Deferred
- Investigate `--localstorage-file` coverage warning separately.
- Gray observation window remains owner-deferred and is not blocking current work.
