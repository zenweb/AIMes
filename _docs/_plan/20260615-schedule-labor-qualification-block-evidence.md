# 2026-06-15 Plan - ScheduleBoard 人员资质阻断采纳证据

Success criteria:
- An active labor qualification block appears in the schedule event queue.
- The event generates a stop-work Agent recommendation.
- Accepting the suggestion persists labor-event audit context locally and to backend feedback.
- Focused and full frontend tests remain green.
- Current runtime/operator files do not steer new runs to host `localhost:5000`.

Execution:
1. Inspect labor assignment sync contracts and `ScheduleBoard` labor event paths.
2. Hoist labor mocks for test control.
3. Add focused stop-work qualification block adoption test.
4. Run focused unit, focused coverage, full frontend coverage, and current 5000 scan.

Result:
- Frontend labor qualification slice complete and verified.
- Larger CC goal remains active.
