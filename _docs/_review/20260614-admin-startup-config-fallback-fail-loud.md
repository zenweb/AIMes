# Review - Admin startup config fallback fail loud

## Scope
- Reviewed `src/frontend/src/components/admin/AdminBoard.vue`.
- Reviewed `src/frontend/tests/unit/admin-board.test.ts`.
- Reviewed `src/frontend/tests/e2e/admin.spec.ts`.

## Findings
- No open issue remains in this slice after verification.
- RED confirmed the original behavior: startup governance evidence failures were visible, but system config and notification config fallback failures could be omitted from the visible alert summary.

## Decision
- Kept the existing single alert UI.
- Reused the startup error collection path instead of adding a second banner.
- Put system config and notification config failures at the front of the summary because those tabs otherwise display local fallback data that could be mistaken for backend-authoritative data.

## Residual Risk
- The full repository worktree is dirty with many unrelated changes; this slice intentionally touched only AdminBoard and its tests.
- The known `--localstorage-file` warning remains outside this slice.
