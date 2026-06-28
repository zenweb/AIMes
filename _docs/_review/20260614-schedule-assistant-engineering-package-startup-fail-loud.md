# 2026-06-14 Review - Schedule Assistant Engineering Package Startup Fail Loud

## Scope
- Reviewed Scheduling startup behavior when Assistant engineering constraint package evidence fails from both backend and local storage.
- Focused on fail-loud messaging, primary schedule continuity, and real Chromium evidence.

## Findings
- Prior behavior allowed an optional Assistant engineering package read to reject inside `onMounted`, preventing `loadData()` from reaching the primary schedule API.
- The updated behavior reports the Assistant package failure in the existing engineering startup warning lane and continues loading the formal schedule plan.
- The same safe read is reused after assistant recovery handoff closure so the optional evidence source cannot break that refresh path.

## Verification
- Focused RED/GREEN unit evidence proved the old path did not call `getCurrentPlan` after the package read rejected.
- Full ScheduleBoard unit regression: 28/28 passed.
- Full Scheduling Chromium regression: 41/41 passed.
- Coverage regression: 689/689 frontend unit tests passed.

## Residual Risk
- This slice covers frontend startup resilience and browser-visible behavior, not backend availability of the Assistant engineering package endpoint.
- Other optional evidence reads inside risk enrichment are still guarded by the broader risk enrichment fallback, not individually surfaced.
