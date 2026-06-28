# 2026-06-14 Issue - Schedule Assistant Engineering Package Startup Fail Loud

## Issue
ScheduleBoard startup directly awaited Assistant engineering constraint package evidence. If that optional evidence source rejected, primary schedule loading did not run.

## Impact
- A secondary evidence-source outage could block the core Scheduling workbench.
- Operators would lose the formal schedule view even though the schedule API and equipment API were still healthy.
- The failure was not surfaced through the existing engineering startup warning lane.

## Resolution
- Added a safe Assistant engineering package read path.
- Converted package read failures into a visible engineering startup warning.
- Returned an empty package list so the formal schedule load can continue.
- Reused the safe read after assistant recovery handoff closure.

## Status
- Closed for frontend startup resilience and real-browser visible behavior.
- Backend endpoint reliability remains separate from this frontend hardening slice.
