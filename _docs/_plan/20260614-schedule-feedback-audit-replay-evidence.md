# 2026-06-14 Plan - Schedule Feedback Audit Replay Evidence

## Goal
- Make required schedule adoption feedback reasons replayable in the existing audit decision panel.

## Success Criteria
- A unit test first fails because schedule feedback audit records are not shown.
- The replay panel queries `ScheduleAdoptionFeedbackUpsert` audit records.
- Replay detail shows required reason detail, category, objective, decision label, and trace evidence.
- Real Chromium evidence proves the user-visible audit replay path.
- Gray observation is not used as a blocker for this work item.

## Execution
- Add the red unit test for schedule adoption feedback audit replay.
- Implement the minimal reader, payload parser, replay mapper, metric, and default selection.
- Add a Chromium e2e scenario using backend audit API interception.
- Run focused and full audit replay verification.

## Result
- Success criteria met for this slice.
- Next work should continue depth-hardening existing core workflows.
