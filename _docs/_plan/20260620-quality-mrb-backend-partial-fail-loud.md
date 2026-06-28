# 2026-06-20 Plan: Quality MRB Backend Partial Fail Loud

## Goal
Make quality MRB backend latest reads fail loud when requested and prevent partial backend records from weakening complete local MRB evidence.

## Success Criteria
- Quality MRB latest API read supports fail-loud behavior.
- Backend-first sync read propagates fail-loud options and rethrows backend failures when requested.
- Incomplete backend MRB records fall back to complete local evidence.
- Quality, report, MRB panel, and OTD evidence adjacent behavior remains stable under targeted tests.

## Execution
1. Add RED tests for API fail-loud, sync fail-loud, and partial backend MRB records.
2. Update `getLatestQualityMrbDisposition()` to accept fail-loud options.
3. Update `readQualityMrbDispositionRecordBackendFirst()` to pass options and validate backend records before use.
4. Run target and adjacent tests, lint, and diff checks.

## Status
- Completed for this slice on 2026-06-20.
- This does not mark the overall CC remediation or strict v1.0.0 goal complete.
