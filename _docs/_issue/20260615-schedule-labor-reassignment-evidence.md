# 2026-06-15 Issue - ScheduleBoard 人员替班采纳证据

Issue:
- Labor reassignment could enter the schedule event chain, but there was no focused test proving that the replacement assignment audit trace survives Agent suggestion adoption.

Impact:
- A regression could make the UI look ready while losing the startup-review reason and reassignment trace needed for later audit replay.

Resolution:
- Added a focused approved labor reassignment test.
- Verified event queue text, Agent suggestion text, local feedback snapshot, and backend feedback payload.

Not fixed here:
- Live browser staging remains gated by external Docker/API state.
