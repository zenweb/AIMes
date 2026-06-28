# 2026-06-19 Todo: Document upload quality publish readback next actions

## Done In This Slice
- Added post-publish readback for formal quality knowledge retraining publish.
- Preserved local publish history when backend readback fails.
- Verified targeted unit, component unit, full coverage, lint, and production build.

## Next Actions
- Continue prioritizing existing-feature correctness, recovery, readback, and auditability gaps.
- Prefer another user-critical path with weak readback evidence over cosmetic expansion.
- Candidate areas: `ScannerBoard.vue`, `ScheduleBoard.vue`, `ChatPanel.vue`, or another verified gap from the current coverage profile.
- Keep backend/staging work on `5003`, not `5000`.
- Do not claim strict v1.0.0 completion until gray observation is resolved.
