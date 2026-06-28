# Plan - Schedule latest feedback startup fail loud

## Success Criteria
- Latest adoption feedback backend failure is not silently converted to an empty result.
- Schedule startup continues to load the current plan after latest feedback restore fails.
- The page shows a user-visible fail-loud note for the degraded latest-feedback restore.
- Real Chromium evidence proves the schedule board still renders the main metrics.
- Default local API host port no longer points at `5000`.

## Execution
- RED: add API unit coverage for latest-feedback error propagation.
- RED: add `ScheduleBoard` startup test for latest feedback restore failure plus current plan load.
- GREEN: move fallback ownership from API wrapper to `ScheduleBoard`.
- Browser: add focused Chromium route failure for latest feedback 503.
- Port: change Docker host mapping and staging evidence defaults to `localhost:5002`.

## Result
- Completed.
- Full `ScheduleBoard` unit suite: 41 passed.
- Focused Chromium evidence: 1 passed.
- Full unit coverage: 106 files / 781 tests passed; global line coverage 84.01%.
