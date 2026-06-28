# 2026-06-15 Issue: anomaly dispatch write failure guard

Problem:

- Anomaly dispatch success and duplicate-lock behavior had tests, but the storage-unavailable write failure path was not explicitly locked.
- Without this evidence, a later change could accidentally mark a lane as confirmed even when no downstream evidence was written.

Resolution:

- Added a focused unit test that clicks the quality dispatch lane while `writeAnomalyDispatchRecord` returns `null`.
- The test asserts the lane remains enabled, no dispatch trace appears, and the fail-loud alert states that browser storage is unavailable.

Status:

- Verified by focused, file-level, and focused coverage commands.
