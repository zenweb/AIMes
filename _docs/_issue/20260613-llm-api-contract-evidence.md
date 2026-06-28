# 2026-06-13 Issue: LLM API helper had no direct contract evidence

## Status

Closed for this slice.

## Finding

`src/api/llm.ts` was uncovered even though the chat panel depends on model status.

## Resolution

Added direct contract tests for the status and config helper functions.

## Remaining risk

This verifies frontend request construction and data passthrough. Actual model availability still requires backend/runtime evidence.

