# 2026-06-15 Issue - Local User Complete Identity Required

## Issue

`getLocalUser()` returned normalized but incomplete cached user objects.

## Impact

Callers that used object presence as identity evidence could accidentally accept partial cached users.

## Resolution

- Require `username`, `displayName`, `role`, and boolean `mustChangePassword` for `getLocalUser()`.
- Preserve tolerant fallback behavior in display/report actor helpers.

## Status

- Closed for this slice.

