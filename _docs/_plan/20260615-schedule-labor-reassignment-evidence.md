# 2026-06-15 Plan - ScheduleBoard 人员替班采纳证据

Success criteria:
- An approved labor reassignment appears in the schedule event queue.
- The event generates a startup-review Agent recommendation.
- Accepting the suggestion persists reassignment audit context locally and to backend feedback.
- Focused and full frontend tests remain green.
- Current runtime/operator files do not steer new runs to host `localhost:5000`.

Execution:
1. Add focused labor reassignment released-state adoption test.
2. Run focused unit and focused coverage.
3. Run full frontend coverage.
4. Verify current runtime/operator files do not reference host `localhost:5000`.

Result:
- Frontend labor reassignment slice complete and verified.
- Larger CC goal remains active.
