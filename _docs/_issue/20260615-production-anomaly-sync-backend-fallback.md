# 2026-06-15 Issue: production anomaly sync backend fallback evidence gap

Problem:

- `readProductionAnomalyEventBackendFirst` had coverage for backend returning no record, but not for backend read failure.
- Without that evidence, a regression could break the local fallback and interrupt the production anomaly event chain during backend outages.

Resolution:

- Added a focused utility test where local storage contains a valid event and the backend read rejects.
- The test asserts the reader resolves to the local event and still attempts `/scheduling/production-anomaly-event/latest`.

Status:

- Verified by focused, file-level, and focused coverage commands.
