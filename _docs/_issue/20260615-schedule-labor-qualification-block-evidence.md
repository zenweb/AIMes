# 2026-06-15 Issue - ScheduleBoard 人员资质阻断采纳证据

Issue:
- Labor qualification blocking could alter schedule events, but there was no focused test proving that stop-work supervisor-review evidence survives Agent suggestion adoption.

Impact:
- A regression could allow UI suggestions to remain visible while losing the audit reason that production start must stay frozen until review/reassignment closes.

Resolution:
- Added a focused active labor qualification block test.
- Verified event queue text, Agent suggestion text, local feedback snapshot, and backend feedback payload.

Not fixed here:
- Live browser staging remains gated by external Docker/API state.
