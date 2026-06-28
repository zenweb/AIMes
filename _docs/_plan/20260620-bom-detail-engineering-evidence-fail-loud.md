# 2026-06-20 Plan - BOM detail engineering evidence fail-loud

## Goal
Use the new engineering evidence fail-loud API where an existing user workflow is actively reviewing engineering evidence.

## Selection
- BOM detail selection is an explicit operator review action.
- It already has a visible error channel and should not confuse backend readback failure with absent evidence.

## Steps
1. Locate engineering evidence backend-first read callers.
2. Keep startup loading tolerant.
3. Add a failing BOM detail refresh test requiring `{ failLoud: true }`.
4. Pass fail-loud options for alternate material, ECN impact, and kitting package readback during detail refresh.
5. Verify focused, adjacent, and build checks.

## Status
- Completed for this slice.
