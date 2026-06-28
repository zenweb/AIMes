# 2026-06-14 Plan - Router Auth Guard Matrix Evidence

## Goal
- Harden evidence for an existing user-critical route guard without expanding application scope.

## Success Criteria
- Central auth guard role matrix is directly tested.
- Full frontend unit coverage remains green.
- A relevant Chromium login/route guard path passes after production build.
- Gray observation is not used as a blocker for this work item.

## Execution
- Select `src/router/index.ts` from coverage report as the lowest-covered user-entry file.
- Read router guard implementation and existing `router-auth.test.ts`.
- Add focused route matrix tests.
- Run focused unit, focused coverage, full coverage, and focused e2e.

## Result
- Success criteria met for this slice.
- Next slice should move to another low-coverage, user-critical existing feature rather than over-polishing router guard.
