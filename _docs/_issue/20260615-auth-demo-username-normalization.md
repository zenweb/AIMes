# 2026-06-15 Issue - Auth Demo Username Normalization

## Issue

Offline demo login used a normalized username for lookup but returned and persisted the original user input.

## Impact

Whitespace or case noise such as `"  Operator  "` could be stored in `aimes_user`, making auth evidence less consistent across reloads, router checks, and audit-adjacent UI.

## Resolution

- Store the same normalized username used for demo account lookup.
- Lock the behavior with a focused unit test.

## Status

- Closed for this slice.

