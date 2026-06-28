# 2026-06-14 Plan - Shortage Risk Sync Supplier Network Evidence

## Goal
- Harden an existing user-critical shortage and supplier-network evidence path without expanding product scope.

## Success Criteria
- Supply-risk escalation sync behavior is directly tested.
- Supplier-network decision sync behavior is directly tested.
- Focused utility coverage improves materially.
- Full frontend unit coverage remains green.
- A relevant Chromium purchase workflow passes after production build.
- Gray observation is not used as a blocker for this work item.

## Execution
- Select `shortage-risk-sync.ts` from the coverage report because it was low-covered and supports shortage, purchase, schedule, and OTD workflows.
- Read the utility and existing tests before editing.
- Add focused tests for supplier escalation and supplier network decision persistence/fallback.
- Run focused unit, focused coverage, full coverage, and focused e2e.

## Result
- Success criteria met for this slice.
- Next slice should move to another low-coverage, user-critical existing feature rather than continuing to refine this utility immediately.
