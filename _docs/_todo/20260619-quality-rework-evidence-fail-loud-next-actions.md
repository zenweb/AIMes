# 2026-06-19 Todo: Quality rework evidence fail-loud next actions

## Done In This Slice
- Added fail-loud handling for quality rework evidence storage failures.
- Preserved the existing rework preview and withheld success messaging when archival fails.
- Verified targeted unit, component unit, full coverage, lint, and production build.

## Next Actions
- Continue choosing slices by existing-feature depth, coverage leverage, and user-criticality.
- Prefer real correctness, recovery, readback, and auditability gaps over adding more surface polish.
- Candidate areas: `BomBoard.vue`, `RoutingBoard.vue`, `DocumentUpload.vue`, or another verified low-confidence user-critical path.
- Keep backend/staging work on `5003`, not `5000`.
- Do not claim strict v1.0.0 completion until gray observation is resolved.
