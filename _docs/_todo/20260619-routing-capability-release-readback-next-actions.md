# 2026-06-19 Todo: Routing capability release readback next actions

## Done In This Slice
- Added write-after-readback for route capability validation and release.
- Added fail-loud behavior when release readback fails after a local write succeeds.
- Verified targeted unit, component unit, full coverage, lint, and production build.

## Next Actions
- Keep prioritizing existing-feature correctness, recovery, readback, and auditability gaps.
- Prefer another user-critical path with weak readback evidence over cosmetic UI expansion.
- Candidate areas: `BomBoard.vue`, `DocumentUpload.vue`, `ScannerBoard.vue`, or another verified gap from the current coverage profile.
- Keep backend/staging work on `5003`, not `5000`.
- Do not claim strict v1.0.0 completion until gray observation is resolved.
