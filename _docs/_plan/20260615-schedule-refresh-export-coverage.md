# 2026-06-15 Plan: Schedule refresh and export coverage

Success criteria:
- Cover user-facing ScheduleBoard toolbar refresh and export behavior.
- Prove manual refresh can recover from stale backend fallback state.
- Prove CSV export uses the current loaded schedule data.
- Verify focused ScheduleBoard tests and full frontend unit coverage.

Execution:
1. Inspect ScheduleBoard tests and coverage gaps.
2. Add auditable export mocks for filename and payload assertions.
3. Add toolbar refresh recovery coverage.
4. Add toolbar CSV export coverage.
5. Run focused and full frontend coverage sequentially.

Outcome:
- Completed. ScheduleBoard focused coverage improved to statements 79.29%, branches 48.84%, functions 62.79%, lines 80.37%.
