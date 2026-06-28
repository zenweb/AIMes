# 2026-06-15 Issue - ScheduleBoard 缺料 Agent 采纳证据

Issue:
- Dynamic backend material shortage events were mapped into the event queue, but the accepted Agent suggestion path did not have a focused test proving that the alternate-material reasoning is retained in the adoption audit trail.

Impact:
- A regression could have kept the UI suggestion visible while losing the reason detail needed for later review.

Resolution:
- Added a unit test that generates and accepts a material-shortage Agent suggestion from backend risk data.
- Asserted local feedback snapshot and backend feedback payload both include the accepted material-event category and shortage reasoning.

Not fixed here:
- Live browser staging proof is still blocked by external Docker/API state.
