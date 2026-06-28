# 2026-06-15 Issue - ScheduleBoard 质量释放采纳证据

Issue:
- Barcode quality release could restore OP-20 schedule recovery events, but no focused test proved the release trace survived Agent suggestion adoption.

Impact:
- A regression could leave the UI showing OP-20 recovery while dropping the release trace from feedback evidence and later audit replay.

Resolution:
- Added a focused quality release adoption test.
- Verified event queue text, Agent suggestion text, local feedback snapshot, and backend feedback payload.

Not fixed here:
- Live browser staging remains gated by external Docker/API state.
