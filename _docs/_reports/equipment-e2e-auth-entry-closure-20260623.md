# Equipment E2E Auth Entry Closure - 2026-06-23

## Summary

The full frontend E2E run still does not have a full-suite pass. It timed out after the 20-minute guard. The newest artifacts identified Equipment as the next red cluster.

## Root Cause

`tests/e2e/equipment.spec.ts` seeded a demo-token session and navigated to protected routes without an explicit `offlineDemo=1` query. The auth middleware is designed to clear demo tokens on protected routes that are not explicit offline-demo entries, so the browser bounced between `/scheduling/login` and `/scheduling/dashboard`.

The empty-list live-mock scenario also needed a separate session boundary: after switching to `offlineDemo=0`, the suite-level init script was still able to rewrite demo tokens during navigation.

## Fix

- Equipment E2E now seeds explicit offline-demo auth state.
- Protected route entries now use `?offlineDemo=1` for offline-demo scenarios.
- The live-mock empty-list scenario uses backend-style token/refresh state with `offlineDemo=0`.
- A local marker prevents the suite init script from overwriting the live-mock session on navigation.

## Evidence

- `npm run test:e2e -- tests/e2e/equipment.spec.ts`
- Result: 22 Chromium tests passed.

## Non-Claims

- This is not a full frontend E2E pass.
- This is not a v1.0.0 completion claim.
- The next action is another full frontend E2E run or direct continuation from the next artifact/red cluster after Equipment.
