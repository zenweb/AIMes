# 2026-06-15 Issue - Router Auth User Evidence Required

## Issue

The router previously treated a token-only cache as authenticated for protected routes.

## Impact

That allowed navigation into workbench routes without a valid cached user payload, weakening the consistency of auth and session evidence.

## Resolution

- Require both token and cached user evidence before allowing protected routes.
- Lock the behavior with a focused router unit test.

## Status

- Closed for this slice.

