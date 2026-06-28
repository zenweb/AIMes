# 2026-06-14 Issue - Router Auth Guard Matrix Evidence

## Issue
- `src/router/index.ts` was the lowest-covered user-entry file in the frontend coverage report.
- Several important route guard branches had indirect or missing evidence.

## Resolution
- Added focused tests for forced password-change routing, root redirect, role-specific allow/deny behavior, and stale cached user role handling.
- Reused the existing Chromium login e2e path to prove forced password-change redirect works in the real browser build.

## Status
- Resolved for this slice.
- No production implementation changes required.
