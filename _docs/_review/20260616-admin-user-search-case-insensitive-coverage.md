# 2026-06-16 Admin User Search Case Insensitive Coverage Review

## Finding

Admin user search normalized only the search term, not the searched fields.

## Impact

An administrator searching `qa` could miss a user displayed as `QA Lead`. This is a small but real user-management reliability issue because mixed-case display names and English role labels are common in admin data.

## Fix

- `filteredUsers` now lowercases both `username` and `displayName` before comparing with the normalized search term.
- No pagination, create, edit, active-toggle, or backend refresh behavior was changed.

## Verification

- Red/green test cycle completed.
- Admin targeted suite passed: `25 passed`.
- Full frontend suite passed: `111 files / 1054 tests passed`.

## Remaining Risk

- `AdminBoard.vue` branch coverage remains low at `51.55%`; this slice intentionally closed one real management-path defect rather than chasing all branches.
- Strict v1.0.0 release readiness is still not claimed because gray observation remains owner-deferred.
