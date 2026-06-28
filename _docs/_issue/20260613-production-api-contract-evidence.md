# 2026-06-13 Issue: Production API normal-path evidence gap

## Status

Closed for this slice.

## Finding

The refreshed frontend coverage report showed weak evidence around `src/api/production.ts`, while production reporting is a user-critical workflow.

## Resolution

Added a unit contract test that verifies the normal backend paths and payloads for work orders, scanning, starting, completing, and exception reporting.

## Remaining risk

The focused coverage reporter does not attribute lines to `src/api/production.ts` because `http` is mocked. The evidence verifies contract calls, not direct line-coverage percentage.

