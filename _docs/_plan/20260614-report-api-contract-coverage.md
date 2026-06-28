# Plan - Report API contract coverage

## Success Criteria
- Report API dashboard path is directly covered.
- Backend dashboard data is returned without reshaping.
- Backend failures propagate to callers.
- ReportBoard caller regression remains green.
- Full frontend unit coverage remains green.

## Execution
- Read ReportBoard, report API helper, and recent report docs.
- Avoid repeating already-covered ReportBoard CSV/evidence/fail-loud UI branches.
- Add focused API contract tests.
- Run focused unit, caller regression, focused coverage, and full coverage.

## Result
- Completed.
- Production code unchanged.
- Full frontend unit coverage: 107 files / 793 tests passed; global line coverage 84.31%.
