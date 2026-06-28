# Plan - Anomaly API contract coverage

## Success Criteria
- Anomaly API helper paths are directly covered.
- Default paging is locked.
- Critical list, detail read, and AI analysis return backend data without reshaping.
- Backend failures propagate to callers.
- AnomalyBoard caller regression remains green.
- Full frontend unit coverage remains green.

## Execution
- Read AnomalyBoard, anomaly API helper, and recent anomaly docs.
- Avoid repeating already-covered AnomalyBoard fail-loud branches.
- Add focused API contract tests.
- Run focused unit, caller regression, focused coverage, and full coverage.

## Result
- Completed.
- Production code unchanged.
- Full frontend unit coverage: 106 files / 791 tests passed; global line coverage 84.31%.
