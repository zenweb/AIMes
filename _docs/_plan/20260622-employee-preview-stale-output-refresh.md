# 2026-06-22 Plan - Employee Preview Stale Output Refresh

## Success Criteria

- The current `4173` preview serves a fresh `.output` build.
- Employee offline-demo skip internals are not visible in the restarted preview.
- Evidence is recorded without broad staging unrelated worktree changes.

## Steps

1. Confirm current source-level Employee tests are green.
2. Confirm current focused Employee E2E is green.
3. Rebuild `.output` with live mode as default.
4. Restart `4173`.
5. Smoke test the restarted preview with real Chromium.
6. Record bounded evidence and residual risk.

## Status

Completed for this bounded refresh slice. Global CC plan remains active.
