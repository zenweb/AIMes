# 2026-06-16 Admin User Refresh Page Clamp Coverage Issue

## Status

Closed for this slice.

## Problem

Admin user pagination could become invalid after a successful write action refreshed the list from backend authority.

Scenario:

- Admin is on page 2 with 16 users.
- Admin disables the page-2 user.
- Backend refresh returns one remaining user.

Before the fix, page 2 stayed selected and the user table rendered empty.

## Resolution

`refreshUsers` now clamps `currentPage` to `totalPages` after assigning refreshed backend users.

## Evidence

- Regression test failed before the fix because the page did not contain `后端保留用户`.
- Regression test passed after the fix.
- Admin targeted coverage passed with `26 passed`.
- Full frontend coverage passed with `111 files / 1055 tests passed`.

## Remaining Open Item

This does not close the whole CC remediation goal. Release strict readiness remains blocked by deferred gray observation.
