# 2026-06-14 Plan - Notification Lifecycle Alert Evidence

## Goal
- Harden existing notification reliability and high-severity alert evidence without expanding feature scope.

## Success Criteria
- SignalR connection lifecycle races are directly tested.
- High-severity anomaly alerts prove toast, sound, and browser notification behavior.
- Focused notification coverage improves.
- Full frontend unit coverage remains green.
- A relevant Chromium anomaly workflow passes after production build.
- Gray observation is not used as a blocker for this work item.

## Execution
- Select `notifications.ts` from the coverage report because it was low-covered and affects global user feedback reliability.
- Inspect current dirty worktree changes before editing.
- Add a focused test for high-severity anomaly alert side effects.
- Run focused unit, focused coverage, full coverage, and focused e2e.

## Result
- Success criteria met for this slice.
- Next slice should move to another low-coverage, user-critical existing feature.
