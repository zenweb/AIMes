# 2026-06-19 Todo: BOM kitting package readback next actions

## Done In This Slice
- Added post-publish readback for BOM kitting package evidence.
- Preserved local package lock when backend readback fails.
- Verified targeted unit, component unit, full coverage, lint, and production build.

## Next Actions
- Continue prioritizing existing-feature correctness, recovery, readback, and auditability gaps.
- Prefer another user-critical path with weak readback evidence over cosmetic expansion.
- Candidate areas: `DocumentUpload.vue`, `ScannerBoard.vue`, `ScheduleBoard.vue`, or another verified gap from the current coverage profile.
- Keep backend/staging work on `5003`, not `5000`.
- Do not claim strict v1.0.0 completion until gray observation is resolved.
