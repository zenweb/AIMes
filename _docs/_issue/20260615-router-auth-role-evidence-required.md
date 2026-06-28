# 2026-06-15 Issue - Router Auth Role Evidence Required

## Issue

The router treated a cached user without role as authenticated for ordinary protected routes.

## Impact

That allowed an invalid identity payload to enter workbench pages and only failed later on role-restricted routes.

## Resolution

- Require normalized role evidence before treating a session as authenticated.
- Align role-restricted missing-role behavior with unauthenticated routing.

## Status

- Closed for this slice.

