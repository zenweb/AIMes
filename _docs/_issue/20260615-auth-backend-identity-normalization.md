# 2026-06-15 Issue - Auth Backend Identity Normalization

## Issue

Backend login normalized tokens but accepted `username`, `displayName`, and `role` exactly as returned by the API.

## Impact

Whitespace in backend identity fields could leak into `aimes_user`, causing inconsistent session display, router-adjacent checks, and audit-adjacent UI evidence after login.

## Resolution

- Trim backend identity fields before assigning and persisting the authenticated user.
- Lock the behavior with a focused unit test.

## Status

- Closed for this slice.

