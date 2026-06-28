# 2026-06-15 Plan - ScheduleBoard 缺料 Agent 采纳证据

Success criteria:
- Dynamic material shortage events can generate an Agent suggestion.
- Accepting that suggestion persists material-event adoption context into local and backend feedback evidence.
- Focused and full frontend tests remain green.
- No current runtime/operator file points new runs to host `localhost:5000`.

Execution:
1. Recheck Docker/API/port state for live browser feasibility.
2. Select `ScheduleBoard` because it is user-critical and still low in branch/function coverage.
3. Add a focused test for dynamic material shortage Agent adoption feedback.
4. Run focused unit, focused coverage, and full frontend coverage.

Result:
- Frontend slice complete and verified.
- Live browser evidence remains deferred until Docker/API prerequisites recover.
