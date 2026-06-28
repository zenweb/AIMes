# 2026-06-19 Plan - Offline Demo Schedule Corrected Sweep Quiet Fallback

## Success Criteria
- Corrected route sweep must reach every intended offline-demo route.
- No swept page may show `Offline demo mode skipped backend request`.
- ScheduleBoard must keep ordinary backend failures fail-loud.
- ScheduleBoard tests, offline-demo regression package, build, and corrected real-browser sweep must all pass.

## Execution
1. Diagnose why the prior sweep redirected protected pages to dashboard.
2. Re-run the sweep with the real demo role `Admin` and fail on any unexpected final route.
3. Add RED tests for quiet offline-demo latest-feedback restore and current schedule loading.
4. Add minimal `isOfflineDemoError` checks in ScheduleBoard startup paths.
5. Run focused GREEN tests and fail-loud protection tests.
6. Run ScheduleBoard full suite and offline-demo regression package.
7. Build production frontend output.
8. Restart preview on `127.0.0.1:4173`.
9. Re-run corrected route sweep and require `SWEEP_FAILURES=[]`.

## Stop Condition
- Stop this slice once corrected full-route offline-demo sweep reports zero visible backend-skip failures.

