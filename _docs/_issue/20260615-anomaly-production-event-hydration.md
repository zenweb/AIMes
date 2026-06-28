# 2026-06-15 Issue: anomaly production event hydration evidence gap

Problem:

- `AnomalyBoard` could merge the latest backend production anomaly event into the anomaly list, but there was no focused unit evidence proving ordering, duplicate replacement, and detail mapping.
- A regression could have left a stale API list item ahead of the live event or refetched details instead of using the mapped backend event.

Resolution:

- Added a focused unit test for the backend production anomaly event path.
- The test asserts the live event is first, same-id stale API items are removed, and selecting the event opens `toProductionAnomalyDetail` without `getAnomalyById('a-live')`.

Status:

- Verified by focused, file-level, and focused coverage commands.
