# 2026-06-16 Admin Create Dialog Draft Reset Review

## Decision

Accepted for the current boutique hardening track.

## Scope

- Component: `src/frontend/src/components/admin/AdminBoard.vue`.
- Test: `src/frontend/tests/unit/admin-board.test.ts`.
- Workflow: admin user creation dialog cancellation and reopen.

## Findings

- Before the fix, cancelling the create-user modal only set `showUserCreate = false`.
- The reactive `createForm` retained abandoned username, display name, password, and role.
- Reopening the dialog exposed stale draft data, which is poor UX and risky for administrator account creation.
- The fix introduces explicit open/close helpers that reset the create form on open, cancel, overlay close, and successful create.

## Verification

- Red-first test observed the bug: reopened username remained `qa-admin`.
- Single-test green: `1 passed | 27 skipped`.
- Targeted AdminBoard coverage: `28 passed`; lines `89.45%`.
- Full frontend coverage: `111 files / 1061 tests passed`; lines `92.66%`.

## Residual Risk

- Strict v1.0.0 release readiness is still not claimed because gray observation remains owner-deferred.
- Worktree contains many unrelated edits; this review covers only the AdminBoard create-dialog draft reset slice.
