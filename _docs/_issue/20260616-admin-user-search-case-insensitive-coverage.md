# 2026-06-16 Admin User Search Case Insensitive Coverage Issue

## Status

Closed for this slice.

## Problem

Admin user search lowercased the input term but did not lowercase `username` or `displayName` before matching.

Example:

- Search term: `qa`
- Display name: `QA Lead`

Before the fix, the user was filtered out.

## Resolution

`filteredUsers` now compares the normalized search term against lowercased username and display name values.

## Evidence

- Regression test failed before the fix because the page did not contain `QA Lead`.
- Regression test passed after the fix.
- Admin targeted coverage passed with `25 passed`.
- Full frontend coverage passed with `111 files / 1054 tests passed`.

## Remaining Open Item

This does not close the whole CC remediation goal. Release strict readiness remains blocked by deferred gray observation.
