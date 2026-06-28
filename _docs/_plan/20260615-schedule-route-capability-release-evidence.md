# 2026-06-15 Plan - ScheduleBoard 工艺能力放行采纳证据

Success criteria:
- Released route capability evidence appears in the schedule event queue.
- The released route event generates the correct Agent recommendation with batch-window evidence.
- Accepting the suggestion persists route-event context locally and to backend feedback.
- Full frontend coverage completes without unhandled teardown errors.
- Current runtime/operator files do not steer new runs to host `localhost:5000`.

Execution:
1. Add a focused released-state route capability test.
2. Run focused `ScheduleBoard` unit and coverage.
3. Run full frontend coverage.
4. Investigate and fix the full-suite teardown error from `ParetoCompare` async Gantt import.
5. Rerun focused Pareto and full frontend coverage.

Result:
- Frontend quality slice and full-suite reliability fix completed.
- Larger CC goal remains active.
