# 2026-06-15 Issue - Local User Invalid Cache Clear

## Issue

Incomplete cached user payloads were rejected by `getLocalUser()` but left in local storage.

## Impact

The same invalid identity evidence could be re-read repeatedly by auth/router code.

## Resolution

- Remove invalid cached user payloads when `getLocalUser()` rejects them.
- Verify the cleanup and full frontend unit suite.

## Status

- Closed for this slice.

