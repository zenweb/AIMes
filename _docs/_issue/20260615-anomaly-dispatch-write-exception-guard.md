# 2026-06-15 Issue: anomaly dispatch write exception guard

Problem:

- The anomaly dispatch write exception path was handled in production code but not explicitly locked by a unit test.
- A regression in this branch could falsely confirm a dispatch lane after an audit/evidence backend failure.

Resolution:

- Added a focused unit test that makes `writeAnomalyDispatchRecord` throw `dispatch audit backend unavailable`.
- The test asserts the lane remains enabled, no dispatch trace appears, and the alert includes the thrown error reason.

Status:

- Verified by focused, file-level, and focused coverage commands.
