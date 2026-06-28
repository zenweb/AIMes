# 2026-06-15 ScheduleBoard retry / double-click / drag coverage plan

## Success Criteria
- ScheduleBoard retry, double-click, and unknown drag task paths have direct unit evidence.
- No production behavior changes are introduced unless a failing test proves a real defect.
- Focused ScheduleBoard tests pass.
- Full frontend unit coverage passes.

## Execution
1. Inspect existing ScheduleBoard tests and component handlers.
2. Add minimal user-visible tests for retry recovery, task double-click, and unknown-task drag fail-loud handling.
3. Run focused ScheduleBoard unit tests.
4. Run focused ScheduleBoard coverage.
5. Run full frontend coverage.
6. Record evidence in changelog/review/todo/issue/plan docs.

## Result
- Criteria met for this coverage-hardening slice.
- Goal remains active because the full CC remediation and release-readiness objective is broader than this slice.
