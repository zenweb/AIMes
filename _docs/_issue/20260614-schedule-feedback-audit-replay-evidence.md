# 2026-06-14 Issue - Schedule Feedback Audit Replay Evidence

## Issue
- Schedule adoption feedback reasons were persisted in backend audit logs but were not replayable in the audit decision panel.
- This made the scheduling feedback path weaker than the backend contract: the reason existed, but a user could not inspect it through the replay UI.

## Resolution
- Added support for `ScheduleAdoptionFeedbackUpsert` in audit replay.
- Rendered the required reason detail, reason category, optimization objective, decision label, operator, trace ID, and AI scheduling link.
- Added fail-loud handling for incomplete schedule feedback audit payloads.

## Status
- Resolved for this slice.
- Verified by unit tests and real Chromium audit replay tests.
